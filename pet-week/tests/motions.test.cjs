// Deterministic DOM geometry/timeline test, not a browser pixel test.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {E,D,prepared}=require('./helpers.cjs');
function stage(){
 const timers=new Map();let serial=0,time=0;
 function el(rect={left:0,top:0,width:900,height:600,bottom:600}){const classes=new Set();return {innerHTML:'',textContent:'',className:'',style:{setProperty(k,v){this[k]=v;}},classes,classList:{add:(...ks)=>ks.forEach(k=>classes.add(k)),remove:(...ks)=>ks.forEach(k=>classes.delete(k))},getBoundingClientRect:()=>rect,insertAdjacentHTML(_,html){this.innerHTML+=html;},remove(){this.removed=true;},querySelector(){return null;}};}
 const mover=el({left:300,top:200,width:180,height:240}),actor=el(),sprite=el(),bubble=el(),surface=el(),food=el({left:200,top:440,width:100,height:80,bottom:520}),water=el({left:600,top:420,width:90,height:70,bottom:490});actor.querySelector=()=>sprite;food.querySelector=water.querySelector=()=>surface;
 const nodes={'#room-stage':el(),'#pet-mover':mover,'#pet-mover .pet-actor':actor,'#pet-bubble':bubble,'[data-room-id="bowl"] .item-art':food,'[data-room-id="waterBowl"] .item-art':water};
 const ctx={PetEngine:E,PetData:D,document:{querySelector:q=>nodes[q]||null},setTimeout:(fn,ms)=>{timers.set(++serial,{fn,at:time+ms});return serial;},clearTimeout:id=>timers.delete(id)};vm.createContext(ctx);for(const f of ['scene.js','motions.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'),ctx);
 function advance(ms){time+=ms;for(const [id,t] of [...timers])if(t.at<=time){timers.delete(id);t.fn();}}
 return {M:ctx.PetMotion,mover,actor,sprite,bubble,food,water,surface,advance};
}
for(const id of ['catDudung','dogSunny'])for(const action of ['feed','drink'])test(`${id} ${action}: actual bowl mouth alignment, settle/lower/consume/finish; pure presentation`,()=>{
 const ui=stage(),s=prepared(id),before=E.serialize(s);let ended=0;ui.M.play(s,{action,drank:true},()=>ended++);
 const p=E.pet(s),a=ui.M.anchors[id],drop=p.species==='cat'?.13:.16,b=ui[action==='feed'?'food':'water'].getBoundingClientRect(),x=parseFloat(ui.mover.style.left)/100*900-90+a[0]*180,y=parseFloat(ui.mover.style.top)/100*600-.91*240+(a[1]+drop)*240;
 assert.ok(Math.abs(x-(b.left+b.width*(action==='feed'?.5:.52)))<.001);assert.ok(Math.abs(y-(b.top+b.height*(action==='feed'?.39:.37)))<.001);assert.equal(ended,0);
 ui.advance(650);assert.match(ui.actor.innerHTML,/rig-head/);assert.match(ui.actor.innerHTML,/rig-body/);assert.ok(ui.actor.innerHTML.includes(id+'-states-v3.png'));assert.ok(!ui.actor.classes.has('lowered'));
 ui.advance(400);assert.ok(ui.actor.classes.has('lowered'));assert.ok(!ui.actor.classes.has('consuming'));ui.advance(400);assert.ok(ui.actor.classes.has('consuming'));assert.ok(ui[action==='feed'?'food':'water'].classes.has(action==='feed'?'food-decreasing':'water-rippling'));
 ui.advance(1850);assert.ok(!ui.actor.classes.has('consuming'));assert.match(ui.bubble.textContent,action==='feed'?/식사를 마쳤/:/물을 마시고/);ui.advance(1100);assert.equal(ended,1);assert.ok(ui.surface.removed);ui.advance(10000);assert.equal(ended,1);assert.equal(E.serialize(s),before);
});
test('refusal has no tongue/ripples; cancellation cannot finish a stale motion; danger pose beats play',()=>{
 const ui=stage(),s=prepared('catDudung');let ended=0;ui.M.play(s,{action:'drink',drank:false},()=>ended++);ui.advance(1450);assert.ok(!ui.actor.classes.has('consuming'));assert.match(ui.bubble.textContent,/마시지 않았/);ui.M.cancel();ui.advance(10000);assert.equal(ended,0);
 s.stats.hydration=9;ui.M.play(s,{action:'play',response:{pose:4,animation:'pounce',reaction:'즐거워요'}},()=>ended++);ui.advance(1050);assert.equal(ui.sprite.style['--sprite-x'],2/3*100+'%');assert.match(ui.bubble.textContent,/물/);assert.ok(!ui.mover.classes.has('behavior-pounce'));
});
test('cat cover follows squatting and dog urine poses differ by individual',()=>{
 const ui=stage();let ended=0;ui.M.play(prepared('catDudung'),{action:'stool',location:{place:'litterBox',x:88,y:86}},()=>ended++);ui.advance(1450);assert.match(ui.actor.innerHTML,/rig-paw/);assert.ok(!ui.actor.classes.has('consuming'));ui.advance(1850);assert.ok(ui.actor.classes.has('covering'));ui.advance(1100);assert.equal(ended,1);
 assert.match(ui.M.rig(prepared('dogSunny'),'urine'),/leg-lift/);assert.doesNotMatch(ui.M.rig(prepared('dogCalm'),'urine'),/leg-lift/);assert.doesNotMatch(ui.M.rig(prepared('dogSunny'),'stool'),/leg-lift/);
});
