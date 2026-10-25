import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPractice} from '../dist/game/practice.js';
import {blocked, boxes, rayBox} from '../dist/shared/simulation.js';

function practice(t, {roam = true, weapon = 'M4A1', operator = 'Recon', paused = false} = {}) {
  let now = 1000000;
  t.mock.timers.enable({apis: ['setInterval', 'setTimeout']});
  t.mock.method(Date, 'now', () => now);
  const socket = createPractice({roam}), events = [];
  let state, seq = 0;
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.type === 'state') state = message;
    events.push(message);
  };
  const send = message => socket.send(JSON.stringify(message));
  const advance = frames => { for (let i = 0; i < frames; i++) { now += 34; t.mock.timers.tick(34); } };
  const input = values => send({type: 'input', seq: ++seq, x: 0, z: 0, yaw: 0, pitch: 0, ...values});
  t.mock.timers.tick(0);
  send({type: 'join', name: 'Local tester', weapon, operator});
  if (!paused) send({type: 'pause', paused: false});
  advance(1);
  t.after(() => socket.close());
  return {socket, send, advance, input, events, setTime(value) { now = value; }, get state() { return state; }, get me() { return state.players[0]; }};
}

const playerStats = state => state.players.map(p => ({hp: p.hp, kills: p.kills, deaths: p.deaths, weapon: p.weapon, ammo: p.ammo, grenades: p.grenades, x: p.x, z: p.z}));

test('local loadouts preserve ammunition and reject malformed or stale movement', t => {
  const game = practice(t, {weapon: 'M249'});
  assert.equal(game.me.weapon, 'M249');
  assert.equal(game.me.operator, 'Recon');
  assert.equal(game.me.ammo, 80);
  game.send({type: 'fire'}); game.advance(1);
  assert.equal(game.me.ammo, 79);
  game.send({type: 'switch', weapon: 'M9'}); game.advance(1);
  assert.equal(game.me.ammo, 15);
  assert.equal(game.me.reserve, 60);
  game.send({type: 'switch', weapon: 'M249'}); game.advance(1);
  assert.equal(game.me.ammo, 79);
  game.socket.send('{invalid');
  game.input({x: 1}); game.advance(2);
  const before = game.me.x;
  game.send({type: 'input', seq: 0, x: -1, yaw: 0, pitch: 0});
  game.send({type: 'input', seq: 999, x: -1, yaw: null, pitch: 0});
  game.advance(2);
  assert.ok(game.me.x > before, 'invalid inputs cannot replace the current direction');
  game.input({x: 0}); game.advance(1);
  const stopped = game.me.x;
  game.advance(5);
  assert.equal(game.me.x, stopped, 'pause/zero input stops movement');
});

test('practice grenades bounce off cover and remain inside the arena', t => {
  const game = practice(t);
  game.input({x: 1}); game.advance(39);
  game.input({z: -1}); game.advance(58);
  game.input({}); game.advance(1);
  assert.ok(game.me.x > 6 && game.me.x < 8);
  assert.ok(game.me.z > 16 && game.me.z < 18);
  game.send({type: 'grenade'});
  let bounced = false;
  for (let i = 0; i < 58; i++) {
    game.advance(1);
    for (const grenade of game.state.grenades) {
      assert.equal(blocked(grenade.x, grenade.z), false, 'grenades cannot enter solid cover');
      if (grenade.vz > 0) bounced = true;
      assert.ok(Math.abs(grenade.x) <= 31 && Math.abs(grenade.z) <= 31);
    }
  }
  assert.ok(bounced, 'the northbound throw must bounce at the freight cover');
});

test('dead players cannot fire, switch, throw or move until respawn', t => {
  const game = practice(t, {roam: false});
  for (let i = 0; i < 1000 && game.me.hp > 0; i++) game.advance(1);
  assert.equal(game.me.hp, 0, 'the three bots can eliminate a stationary player');
  const before = {...game.me};
  game.send({type: 'fire'});
  game.send({type: 'switch', weapon: 'M9'});
  game.send({type: 'grenade'});
  game.input({x: 1, jump: true, yaw: 1});
  game.advance(2);
  for (const key of ['ammo', 'weapon', 'grenades', 'x', 'z', 'y', 'yaw', 'seq']) assert.equal(game.me[key], before[key], key);
  game.advance(150);
  assert.ok(game.me.hp > 0);
  assert.equal(game.me.x, 1);
  assert.equal(game.me.reloadAt, 0);
});

test('pending grenades and new actions cannot alter a completed local round', t => {
  const game = practice(t, {roam: false});
  // A throw immediately before the deadline is still visible after completion.
  game.input({yaw: .9});
  game.setTime(game.state.end - 1000);
  game.send({type: 'grenade'});
  game.setTime(game.state.end + 1);
  game.advance(1);
  assert.equal(game.state.finished, true);
  const finalScore = game.state.scores.slice(), finalPlayers = playerStats(game.state);
  game.send({type: 'fire'}); game.send({type: 'switch', weapon: 'M9'}); game.send({type: 'grenade'}); game.input({x: 1, jump: true});
  game.advance(80);
  assert.deepEqual(game.state.scores, finalScore);
  assert.deepEqual(playerStats(game.state), finalPlayers);
  const explosion = game.events.find(event => event.type === 'explosion');
  assert.ok(explosion);
  assert.ok(game.state.players.some(target => {
    if (!target.bot) return false;
    const vector = [target.x - explosion.x, target.y + .9 - explosion.y, target.z - explosion.z], distance = Math.hypot(...vector);
    return distance < 8 && !boxes.some(box => rayBox([explosion.x, explosion.y, explosion.z], vector.map(n => n / distance), box) < distance);
  }), 'the pending explosion would damage an exposed bot if the completed-round guard were missing');
  assert.equal(game.state.grenades.length, 0);
});

test('training waits for deployment and pause preserves combat and match timers', t => {
  const game = practice(t, {roam: false, paused: true});
  const initial = playerStats(game.state), remaining = game.state.end - game.state.time;
  game.send({type: 'fire'}); game.send({type: 'grenade'}); game.input({x: 1});
  game.advance(300);
  assert.deepEqual(playerStats(game.state), initial, 'bots and player wait on the deployment screen');
  assert.equal(game.state.end - game.state.time, remaining);
  game.send({type: 'pause', paused: false});
  game.send({type: 'fire'}); game.send({type: 'reload'}); game.send({type: 'grenade'});
  game.advance(1);
  const current = playerStats(game.state), grenade = game.state.grenades[0], reloadRemaining = game.me.reloadAt - game.state.time;
  assert.ok(grenade);
  game.send({type: 'pause', paused: true});
  game.advance(300);
  assert.deepEqual(playerStats(game.state), current);
  assert.equal(game.me.reloadAt - game.state.time, reloadRemaining);
  assert.equal(game.state.grenades[0].x, grenade.x);
  assert.equal(game.state.grenades[0].z, grenade.z);
  assert.equal(game.state.grenades[0].fuse - game.state.time, grenade.fuse - (game.state.time - 300 * 34));
  game.send({type: 'pause', paused: false});
  game.advance(80);
  assert.equal(game.state.grenades.length, 0);
  assert.ok(game.events.some(event => event.type === 'explosion'));
});

test('closing practice before it opens cancels all future events', t => {
  t.mock.timers.enable({apis: ['Date', 'setInterval', 'setTimeout'], now: 1000000});
  const socket = createPractice();
  let opened = 0, closed = 0;
  socket.onopen = () => opened++;
  socket.onclose = () => closed++;
  socket.close(); socket.close();
  t.mock.timers.tick(1000);
  assert.equal(socket.readyState, 3);
  assert.equal(opened, 0);
  assert.equal(closed, 1);
});
