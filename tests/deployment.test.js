import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

test('Vercel routes preserve static assets and disable the hosted dev route',()=>{
  const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
  assert.equal(config.framework,null);
  assert.equal(config.outputDirectory,'dist');
  assert.ok(config.installCommand.includes('pnpm@10.28.0'));
  assert.ok(config.redirects.some(r=>r.source==='/dev'&&r.destination==='/'));
  for(const route of ['/play','/lobby','/loadout','/profile','/leaderboard','/inventory','/marketplace']){
    assert.ok(config.rewrites.some(r=>r.source===route&&r.destination==='/index.html'));
  }
  assert.ok(config.rewrites.every(r=>!r.source.includes('*')&&!r.source.includes('(')));
});

test('production build generates engine/config assets and rejects insecure multiplayer URLs',()=>{
  const file='dist/config.js',previous=fs.existsSync(file)?fs.readFileSync(file):null;
  const build=url=>spawnSync(process.execPath,['scripts/build.js'],{encoding:'utf8',env:{...process.env,VERCEL:'1',WARFRONT_SERVER_URL:url}});
  try{
    const valid=build('wss://game.example.com');
    assert.equal(valid.status,0,valid.stderr);
    assert.match(fs.readFileSync(file,'utf8'),/wss:\/\/game.example.com/);
    assert.ok(fs.statSync('dist/vendor/playcanvas.mjs').size>100000);
    assert.ok(fs.existsSync('dist/vendor/LICENSE.playcanvas'));
    for(const url of ['ws://game.example.com','https://game.example.com','wss://user:secret@game.example.com','wss://game.example.com?secret=token'])assert.notEqual(build(url).status,0);
  }finally{if(previous)fs.writeFileSync(file,previous);else fs.rmSync(file,{force:true});}
});
