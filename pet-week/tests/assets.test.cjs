const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../dist/data.js');
test('17 original PNGs match the 4x2 atlas geometry and support alpha',()=>{
 const manifest=require('../dist/assets/manifest-v3.json');assert.equal(manifest.states.length,8);
 for(const p of Object.values(D.PETS)){const b=fs.readFileSync(path.join(__dirname,'../dist',p.image));assert.equal(b.toString('ascii',1,4),'PNG');assert.equal(b.readUInt32BE(16),1536);assert.equal(b.readUInt32BE(20),1024);assert.equal(b[25],6,p.id+' must have RGBA channels');}
});
test('buildless script dependencies are ordered and all declared files exist',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');let last=-1;
 for(const file of ['profiles.js','event-data.js','price-data.js','scenarios.js','data.js','behavior.js','engine.js','scene.js','cat-event-frames.js','event-ui.js','runtime.js','motions.js','app.js']){const index=html.indexOf('src="'+file+'"');assert.ok(index>last,file);last=index;assert.ok(fs.existsSync(path.join(__dirname,'../dist',file)));}
 assert.match(html,/journal\.css/);for(const action of D.ACTIONS)assert.ok(D.GUIDE.some(g=>g.id===action.guide),action.id);
});
