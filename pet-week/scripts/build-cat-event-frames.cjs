// Run after editing pose rectangles. The game itself needs no build step.
const fs=require('node:fs'),path=require('node:path'),D=require('../dist/data.js');
const root=path.resolve(__dirname,'..'),frames={};
for(const p of Object.values(D.PETS).filter(p=>p.species==='cat'))frames[p.id]=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/events/pets',p.id+'-events-v1.json'),'utf8'));
fs.writeFileSync(path.join(root,'dist/cat-event-frames.js'),'/* Optical rectangles of the untouched generated originals. See assets/events/pets/*.json. */\n(function(root){const frames='+JSON.stringify(frames)+';if(typeof module!=="undefined"&&module.exports)module.exports=frames;root.CatEventFrames=frames;})(typeof globalThis!=="undefined"?globalThis:this);\n');
