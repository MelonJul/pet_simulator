// Actual presentation functions, geometry and save immutability. No pixel renderer.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {D,E,prepared}=require('./helpers.cjs'),ED=require('../dist/event-data.js');
const context={PetEngine:E,PetData:D,PetEventData:ED};vm.createContext(context);
for(const file of ['scene.js','cat-event-frames.js','event-ui.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),context);
const UI=context.PetEventUI,cats=Object.values(D.PETS).filter(p=>p.species==='cat');
test('all nine selected cats are actors in every eligible incident and replay, without state mutation',()=>{
 assert.equal(cats.length,9);
 for(const p of cats){const s=prepared(p.id);s.stats.stress=20;const saved=E.serialize(s);
  for(const e of ED.EVENTS.filter(e=>e.species==='cat'||e.species==='all')){
   const view=UI.scene(s,e),replay=UI.scene(s,e,true);
   for(const html of [view,replay]){assert.ok(html.includes(`data-character="${p.id}"`));assert.ok(html.includes(p.id+(e.image.room?'-states-v3.png':'-events-v1.png')));assert.ok(html.includes(p.name));assert.doesNotMatch(html,/NaN|undefined/);}
   assert.equal((view.match(/class="incident-cutout /g)||[]).length,e.image.room?0:3);
   assert.equal((replay.match(/class="incident-cutout /g)||[]).length,e.image.room?0:1);
  }assert.equal(E.serialize(s),saved);
 }
});
test('all 72 source rectangles are in bounds, separate and normalize without clipping or stretching',()=>{
 for(const p of cats){const m=context.CatEventFrames[p.id],disk=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/assets/events/pets',p.id+'-events-v1.json'),'utf8'));
  assert.equal(JSON.stringify(m),JSON.stringify(disk));assert.equal(m.frames.length,8);
  const png=fs.readFileSync(path.join(__dirname,'../dist/assets/events/pets',p.id+'-events-v1.png'));assert.equal(png.readUInt32BE(16),m.width);assert.equal(png.readUInt32BE(20),m.height);assert.equal(png[25],6);
  m.frames.forEach(([x,y,w,h],i)=>{assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=m.width&&y+h<=m.height,p.id+' '+i);
   for(const [j,[x2,y2,w2,h2]]of m.frames.entries())if(j>i)assert.ok(x+w<=x2||x2+w2<=x||y+h<=y2||y2+h2<=y,p.id+' pose overlap');
   const f=UI.frameStyle(m,i);assert.ok(f.left>=0&&f.top>=0&&f.left+f.width<=100&&f.top+f.height<=100);
   assert.ok(Math.abs((f.width*384)/(f.height*512)-w/h)<1e-9);assert.ok(Math.abs((f.top+f.height)*512/100-450)<1e-9);
  });
 }
});
test('incident expressions distinguish alarm, contentment, caution and discomfort',()=>{
 const s=prepared('catDudung'),r=id=>UI.presentation(s,ED.EVENTS.find(e=>e.id===id));
 assert.equal(r('catCup').frames.join(), '0,1,5');assert.equal(r('catScratch').frames[1],2);assert.equal(r('catBox').frames[2],3);assert.equal(r('catHide').frames[2],4);assert.equal(r('health').frames[2],6);assert.equal(r('vetExpense').frames[2],7);assert.ok(!r('missingToy').frames.includes(6));assert.notEqual(r('catBox').motion,r('catCup').motion);
});
test('critical need remains visible instead of being masked by a contented incident pose',()=>{
 for(const key of ['nutrition','hydration']){const s=prepared('catDudung');s.stats[key]=8;const e=ED.EVENTS.find(e=>e.id==='catBox'),m=E.mood(s),r=UI.presentation(s,e);assert.ok(m.locked);assert.ok(r.critical);assert.ok(r.frames.every(n=>n===m.pose));assert.equal(r.motion,'breathe');const html=UI.scene(s,e);assert.match(html,/catDudung-states-v3/);assert.doesNotMatch(html,/catDudung-events-v1|incident-reaction-cue/);}
});
test('older cats have gentler motion while replay holds a single expression',()=>{
 const e=ED.EVENTS.find(e=>e.id==='catCup');assert.ok(UI.presentation(prepared('catSenior'),e).scale<UI.presentation(prepared('catCurious'),e).scale);
 assert.match(UI.scene(prepared('catDudung'),e,true),/pose-still/);assert.doesNotMatch(UI.scene(prepared('catDudung'),e,true),/pose-0|incident-reaction-cue/);
});
test('the performance stays paused until the selected cat and incident background finish loading',async()=>{
 const pending=[],classes=new Set(),el={isConnected:true,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)}};
 context.Image=class{set src(url){this.url=url;pending.push(this);}};
 const s=prepared('catDudung'),before=E.serialize(s),ready=UI.readyScene(el,s,ED.EVENTS.find(e=>e.id==='catCup'));
 assert.ok(classes.has('incident-loading'));assert.equal(pending.length,3);assert.ok(pending.some(img=>img.url.includes('catDudung-events')));
 pending[0].onload();pending[1].onload();await Promise.resolve();assert.ok(classes.has('incident-loading'));
 pending[2].onload();await ready;assert.ok(!classes.has('incident-loading'));assert.ok(!classes.has('incident-load-error'));assert.equal(E.serialize(s),before);
});
