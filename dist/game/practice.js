import {weapons, boxes, blocked, move, rayBox, createPlayer, spawn, explosionDamage} from '../shared/simulation.js';

// Explicitly local sandbox. Online matches use the separate Node authority.
export function createPractice({roam = false} = {}) {
  const socket = {readyState: 0, onopen: null, onmessage: null, onclose: null};
  let players = [], me = null, inputs = {}, sequence = 0, time = 0, ended = false, paused = true;
  let end = Date.now() + 600000, previousTick = Date.now();
  const scores = [0, 0], grenades = [];
  const emit = message => socket.onmessage?.({data: JSON.stringify(message)});
  const emitState = now => emit({type: 'state', time: now, end, finished: ended, scores, players, grenades, local: true, roam, paused});

  function eliminate(target, attacker) {
    target.deaths++;
    target.respawnAt = Date.now() + 5000;
    if (target === me) inputs = {};
    if (attacker) {
      attacker.kills++;
      scores[attacker.team]++;
      emit({type: 'event', text: `${attacker.name} eliminated ${target.name}`});
    }
  }

  function shoot(player) {
    const now = Date.now(), weapon = weapons[player.weapon];
    if (player.hp <= 0 || player.reloadAt || now - player.lastShot < weapon.rate || !player.ammo || ended || paused) return;
    player.lastShot = now;
    player.ammo--;
    const origin = [player.x, player.y + 1.65, player.z];
    const direction = [-Math.sin(player.yaw) * Math.cos(player.pitch), Math.sin(player.pitch), -Math.cos(player.yaw) * Math.cos(player.pitch)];
    let nearest = Math.min(weapon.range, ...boxes.map(box => rayBox(origin, direction, box))), target = null;
    for (const other of players) {
      if (other === player || other.team === player.team || other.hp <= 0) continue;
      const distance = rayBox(origin, direction, [other.x, other.y + .9, other.z, .8, 1.8, .8]);
      if (distance < nearest) { nearest = distance; target = other; }
    }
    if (target) {
      const headshot = origin[1] + direction[1] * nearest > target.y + 1.5;
      target.hp = Math.max(0, target.hp - weapon.damage * (headshot ? 1.8 : 1));
      if (player === me) emit({type: 'hit', kill: target.hp === 0});
      if (target.hp === 0) eliminate(target, player);
    }
    emit({type: 'shot', id: player.id, x: player.x, y: player.y, z: player.z, yaw: player.yaw, pitch: player.pitch, range: nearest, weapon: player.weapon});
  }

  socket.send = raw => {
    if (socket.readyState === 3) return;
    let message;
    try { message = JSON.parse(raw); } catch { return; }
    if (!message || typeof message !== 'object') return;
    if (message.type === 'join' && !me) {
      me = createPlayer('local-player', String(message.name || 'Operator'), 0, message.weapon, message.operator);
      me.x = 1; me.z = 26; players = [me];
      if (!roam) for (let index = 0; index < 3; index++) {
        const bot = createPlayer('bot-' + index, 'BOT / ' + ['WRAITH', 'VIPER', 'ECHO'][index], 1, ['M4A1', 'MP5', 'AK74'][index], 'Assault');
        bot.x = [-8, 8, 21][index]; bot.z = [18, 20, 20][index]; bot.bot = true; players.push(bot);
      }
      emit({type: 'welcome', id: me.id, room: roam ? 'LOCAL ROAM' : 'LOCAL TRAINING'});
      emit({type: 'event', text: roam ? 'Free roam · no connected players' : 'Offline practice · three labeled AI bots'});
      return;
    }
    if (message.type === 'ping') emit({type: 'pong', time: message.time});
    if (message.type === 'pause' && typeof message.paused === 'boolean') {
      paused = message.paused;
      if (paused) inputs = {};
      return;
    }
    if (!me || ended || paused || me.hp <= 0) return;
    if (message.type === 'input' && Number.isSafeInteger(message.seq) && message.seq > me.seq && Number.isFinite(message.yaw) && Number.isFinite(message.pitch)) {
      inputs = {
        x: Math.max(-1, Math.min(1, Number(message.x) || 0)),
        z: Math.max(-1, Math.min(1, Number(message.z) || 0)),
        crouch: !!message.crouch, sprint: !!message.sprint
      };
      me.seq = message.seq; me.yaw = message.yaw; me.pitch = Math.max(-1.4, Math.min(1.4, message.pitch));
      me.crouch = inputs.crouch; me.sprinting = inputs.sprint;
      if (message.jump && me.y === 0) me.vy = 5.5;
    }
    if (message.type === 'fire') shoot(me);
    if (message.type === 'reload' && !me.reloadAt && me.reserve > 0 && me.ammo < weapons[me.weapon].mag) me.reloadAt = Date.now() + weapons[me.weapon].reload;
    if (message.type === 'switch' && !me.reloadAt && [me.primary, 'M9'].includes(message.weapon) && message.weapon !== me.weapon) {
      me.slots[me.weapon] = {ammo: me.ammo, reserve: me.reserve};
      me.weapon = message.weapon;
      me.ammo = me.slots[message.weapon]?.ammo ?? weapons[message.weapon].mag;
      me.reserve = me.slots[message.weapon]?.reserve ?? 60;
    }
    if (message.type === 'grenade' && me.grenades > 0) {
      me.grenades--;
      grenades.push({id: 'g' + sequence++, x: me.x, y: me.y + 1.6, z: me.z, vx: -Math.sin(me.yaw) * 12, vz: -Math.cos(me.yaw) * 12, vy: 5 + Math.sin(me.pitch) * 8, fuse: Date.now() + 2200});
    }
  };

  const timer = setInterval(() => {
    const now = Date.now(), delta = Math.max(0, now - previousTick);
    previousTick = now;
    if (!me) { end += delta; return; }
    if (paused && !ended) {
      end += delta;
      for (const player of players) {
        if (player.reloadAt) player.reloadAt += delta;
        if (player.respawnAt) player.respawnAt += delta;
        if (player.lastShot) player.lastShot += delta;
      }
      for (const grenade of grenades) grenade.fuse += delta;
      emitState(now);
      return;
    }
    const dt = 1 / 30;
    time += dt;
    // Complete the round before processing delayed damage or input at its deadline.
    if (!roam && !ended && (now >= end || Math.max(...scores) >= 50)) { ended = true; inputs = {}; }
    for (const player of players) {
      if (player.hp > 0 && !ended) {
        if (player === me) move(player, inputs, dt);
        else {
          const dx = me.x - player.x, dz = me.z - player.z, distance = Math.hypot(dx, dz);
          player.yaw = Math.atan2(-dx, -dz); player.pitch = -.055;
          const chase = distance > 13 ? 1 : distance < 6 ? -1 : 0, strafe = Math.sin(time * .8 + Number(player.id.slice(-1)) * 2);
          move(player, {x: dx / Math.max(distance, 1) * chase + Math.cos(player.yaw) * strafe * .45, z: dz / Math.max(distance, 1) * chase - Math.sin(player.yaw) * strafe * .45}, dt * .7);
          if (me.hp > 0 && distance < 38 && Math.sin(time * 1.1 + Number(player.id.slice(-1))) > .3 && now - player.lastShot > 650) shoot(player);
          if (!player.ammo && !player.reloadAt && player.reserve > 0) player.reloadAt = now + weapons[player.weapon].reload;
        }
        player.vy -= 15 * dt; player.y = Math.max(0, player.y + player.vy * dt);
        if (!player.y) player.vy = 0;
      }
      if (!ended && player.reloadAt && now >= player.reloadAt) {
        const amount = Math.min(weapons[player.weapon].mag - player.ammo, player.reserve);
        player.ammo += amount; player.reserve -= amount; player.reloadAt = 0;
      }
      if (!ended && player.respawnAt && now >= player.respawnAt) {
        spawn(player); player.x = player.bot ? 21 : 1; player.z = player.bot ? 24 : 26;
        player.reloadAt = 0;
      }
    }
    for (let index = grenades.length - 1; index >= 0; index--) {
      const grenade = grenades[index];
      grenade.vy -= 9.8 * dt;
      if (!blocked(grenade.x + grenade.vx * dt, grenade.z)) grenade.x += grenade.vx * dt; else grenade.vx *= -.5;
      if (!blocked(grenade.x, grenade.z + grenade.vz * dt)) grenade.z += grenade.vz * dt; else grenade.vz *= -.5;
      grenade.y += grenade.vy * dt;
      if (grenade.y < .15) { grenade.y = .15; grenade.vy = Math.abs(grenade.vy) * .4; grenade.vx *= .9; grenade.vz *= .9; }
      if (now < grenade.fuse) continue;
      grenades.splice(index, 1);
      emit({type: 'explosion', x: grenade.x, y: grenade.y, z: grenade.z});
      if (ended) continue;
      for (const target of players) {
        if (target.hp <= 0 || target.team === me.team) continue;
        const distance = Math.hypot(target.x - grenade.x, target.z - grenade.z, target.y + .9 - grenade.y), damage = explosionDamage(distance);
        if (!damage) continue;
        const direction = distance ? [(target.x - grenade.x) / distance, (target.y + .9 - grenade.y) / distance, (target.z - grenade.z) / distance] : [0, 1, 0];
        if (boxes.some(box => rayBox([grenade.x, grenade.y, grenade.z], direction, box) < distance)) continue;
        target.hp = Math.max(0, target.hp - damage);
        if (target.hp === 0) eliminate(target, me);
      }
    }
    if (!roam && Math.max(...scores) >= 50) ended = true;
    emitState(now);
  }, 1000 / 30);
  const opening = setTimeout(() => { socket.readyState = 1; socket.onopen?.(); }, 0);
  socket.close = () => {
    clearInterval(timer); clearTimeout(opening);
    if (socket.readyState === 3) return;
    socket.readyState = 3; socket.onclose?.();
  };
  return socket;
}
