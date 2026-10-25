import { createWeapon } from './weapons.js';

// The skinned mesh and its original embedded PBR textures are CC0 from Grab3D.
// See /assets/operators/PROVENANCE.md for its origin, optimization and limitations.
const modelLoads = new WeakMap();
const MODEL_URL = '/assets/operators/soldier-rigged.glb';
export const OPERATOR_PROFILES = {
  Assault: { title: 'VANGUARD', role: 'Frontline specialist', color: [0.95, 0.98, 0.87], pack: false },
  Recon: { title: 'GHOST', role: 'Reconnaissance specialist', color: [0.65, 0.74, 0.68], pack: false },
  Support: { title: 'BULWARK', role: 'Heavy weapons specialist', color: [0.74, 0.72, 0.64], pack: true },
  Medic: { title: 'LIFELINE', role: 'Combat support specialist', color: [0.82, 0.88, 0.83], pack: true }
};

function loadModel(app) {
  if (!modelLoads.has(app)) {
    modelLoads.set(app, new Promise((resolve, reject) => {
      app.assets.loadFromUrl(MODEL_URL, 'container', (error, asset) => error ? reject(error) : resolve(asset));
    }));
  }
  return modelLoads.get(app);
}

function material(pc, color, metalness = 0, gloss = 0.25) {
  const m = new pc.StandardMaterial();
  m.diffuse = new pc.Color(...color);
  m.useMetalness = true;
  m.metalness = metalness;
  m.gloss = gloss;
  m.update();
  return m;
}

function part(pc, parent, name, type, position, size, mat) {
  const e = new pc.Entity(name);
  e.addComponent('render', { type, material: mat, castShadows: true, receiveShadows: true });
  e.setLocalPosition(...position);
  e.setLocalScale(...size);
  parent.addChild(e);
  return e;
}

// Immediate loading silhouette. The detailed skinned GLB replaces this once ready.
function createFallback(pc, root, team) {
  const e = new pc.Entity('loading-operator');
  root.addChild(e);
  const fabric = material(pc, [.24, .29, .22]);
  const armor = material(pc, [.16, .19, .14]);
  const rubber = material(pc, [.065, .075, .07]);
  const skin = material(pc, [.44, .32, .24]);
  const marker = material(pc, team ? [.6, .18, .13] : [.1, .43, .6]);
  part(pc, e, 'uniform', 'capsule', [0, 1.23, 0], [.46, .61, .29], fabric);
  part(pc, e, 'plate-carrier', 'box', [0, 1.29, -.16], [.4, .4, .12], armor);
  part(pc, e, 'pelvis', 'sphere', [0, .94, 0], [.4, .28, .28], fabric);
  part(pc, e, 'head', 'sphere', [0, 1.66, -.005], [.235, .29, .23], skin);
  part(pc, e, 'helmet', 'sphere', [0, 1.76, .018], [.29, .20, .28], armor);
  part(pc, e, 'visor', 'box', [0, 1.69, -.115], [.20, .055, .035], rubber);
  part(pc, e, 'team-strip', 'box', [.005, 1.43, -.23], [.22, .035, .015], marker);
  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new pc.Entity('hip');
    hip.setLocalPosition(side * .12, .94, 0);
    e.addChild(hip);
    part(pc, hip, 'trousers', 'capsule', [0, -.23, 0], [.18, .48, .19], fabric);
    const knee = new pc.Entity('knee');
    knee.setLocalPosition(0, -.45, 0);
    hip.addChild(knee);
    part(pc, knee, 'shin', 'capsule', [0, -.18, 0], [.15, .39, .16], fabric);
    part(pc, knee, 'boot', 'box', [0, -.37, -.055], [.18, .16, .29], rubber);
    part(pc, knee, 'kneepad', 'sphere', [0, 0, -.09], [.14, .16, .06], armor);
    const shoulder = part(pc, e, 'upper-arm', 'capsule', [side * .27, 1.30, -.04], [.16, .32, .16], fabric);
    shoulder.setLocalEulerAngles(-20, 0, side * 12);
    const forearm = part(pc, e, 'forearm', 'capsule', [side * .19, 1.20, -.24], [.13, .30, .13], fabric);
    forearm.setLocalEulerAngles(-75, side * 20, 0);
    part(pc, e, 'glove', 'sphere', [side * .13, 1.23, -.38], [.11, .13, .13], rubber);
    legs.push({ hip, knee });
  }
  for (let x = -.12; x < .2; x += .12) part(pc, e, 'magazine-pouch', 'box', [x, 1.23, -.245], [.10, .16, .06], armor);
  return { entity: e, legs, fabric, armor };
}

/**
 * Create an operator facing local -Z, with feet at y=0 and a height of 1.8m.
 * The entity is attached to app.root. The ready promise always resolves: if a
 * model request fails, the articulated loading model stays usable.
 */
export function createOperator(app, pc, { team = 0, operator = 'Assault', weapon = 'M4A1' } = {}) {
  const entity = new pc.Entity('operator');
  app.root.addChild(entity);
  const body = new pc.Entity('operator-body');
  entity.addChild(body);
  const fallback = createFallback(pc, body, team);
  const equipment = new pc.Entity('class-equipment');
  body.addChild(equipment);
  const rigRoot = new pc.Entity('operator-rig');
  rigRoot.setLocalEulerAngles(0, 180, 0); // GLB faces +Z; gameplay faces -Z.
  body.addChild(rigRoot);
  const gunMount = new pc.Entity('weapon-mount');
  body.addChild(gunMount);
  const fabric = material(pc, [.16, .19, .15]);
  const trim = material(pc, team ? [.64, .18, .12] : [.08, .43, .69], .1, .4);
  const patch = part(pc, equipment, 'team-identification', 'box', [-.25, 1.40, .005], [.018, .11, .12], trim);
  const backpack = part(pc, equipment, 'field-pack', 'box', [0, 1.22, .22], [.32, .43, .16], fabric);
  const antenna = part(pc, equipment, 'radio-antenna', 'cylinder', [-.15, 1.57, .24], [.012, .43, .012], fabric);
  const medicPatch = part(pc, equipment, 'support-patch', 'box', [0, 1.31, .31], [.14, .10, .015], material(pc, [.85, .88, .75]));
  let weaponEntity = null, model = null, currentWeapon = '', currentOperator = '', elapsed = 0;
  let loaded = false, destroyed = false, animationState = '', lastReload = false, reloadTime = 0;
  let crouchBlend = 0, motionBlend = 0;
  let clonedMaterials = [], rest = [], limbs = [], neck = null;
  const v = () => new pc.Vec3();
  const temp = { start: v(), end: v(), dir: v(), target: v(), elbow: v(), pole: v(), delta: v(), current: v(), offset: v(), rotation: new pc.Quat(), q: new pc.Quat(), up: v(), hand: v() };

  function setWeapon(id) {
    if (currentWeapon === id && weaponEntity) return;
    currentWeapon = id;
    weaponEntity?.destroy();
    weaponEntity = createWeapon(pc, id, { viewmodel: false });
    gunMount.addChild(weaponEntity);
    weaponEntity.setLocalPosition(0, 0, 0);
    // Stock sits against the shoulder, with the muzzle pointing forwards.
    gunMount.setLocalPosition(.13, 1.25, -.34);
  }

  function setOperator(id) {
    currentOperator = OPERATOR_PROFILES[id] ? id : 'Assault';
    const profile = OPERATOR_PROFILES[currentOperator];
    backpack.enabled = profile.pack;
    antenna.enabled = currentOperator === 'Recon' || currentOperator === 'Support';
    medicPatch.enabled = currentOperator === 'Medic';
    clonedMaterials.forEach(m => {
      m.diffuse.set(...profile.color);
      m.diffuseTint = true;
      m.update();
    });
    fallback.fabric.diffuse.set(...profile.color.map(c => c * .32));
    fallback.fabric.update();
  }

  // Solve a two-bone arm towards the grip while retaining the GLB's skinning.
  function solveArm(limb, handLocal, poleLocal) {
    const { upper, lower, hand, upperLength, lowerLength } = limb;
    temp.start.copy(upper.getPosition());
    body.getWorldTransform().transformPoint(temp.hand.set(...handLocal), temp.target);
    temp.dir.sub2(temp.target, temp.start);
    const distance = Math.min(upperLength + lowerLength - .002, Math.max(.02, temp.dir.length()));
    temp.dir.normalize();
    body.getWorldTransform().transformVector(temp.pole.set(...poleLocal), temp.pole);
    temp.pole.sub(temp.offset.copy(temp.dir).mulScalar(temp.pole.dot(temp.dir))).normalize();
    const along = (upperLength * upperLength - lowerLength * lowerLength + distance * distance) / (2 * distance);
    const height = Math.sqrt(Math.max(0, upperLength * upperLength - along * along));
    temp.elbow.copy(temp.start).add(temp.offset.copy(temp.dir).mulScalar(along)).add(temp.pole.mulScalar(height));
    temp.current.sub2(lower.getPosition(), temp.start).normalize();
    temp.delta.sub2(temp.elbow, temp.start).normalize();
    temp.q.setFromDirections(temp.current, temp.delta);
    upper.setRotation(temp.rotation.mul2(temp.q, upper.getRotation()));
    temp.current.sub2(hand.getPosition(), lower.getPosition()).normalize();
    temp.delta.sub2(temp.target, lower.getPosition()).normalize();
    temp.q.setFromDirections(temp.current, temp.delta);
    lower.setRotation(temp.rotation.mul2(temp.q, lower.getRotation()));
  }

  function update(dt, { moving = false, sprint = false, crouch = false, reload = false, dead = false } = {}) {
    if (destroyed) return;
    dt = Math.min(.1, Math.max(0, Number(dt) || 0));
    elapsed += dt;
    if (reload && !lastReload) reloadTime = 0;
    if (reload) reloadTime += dt;
    lastReload = !!reload;
    const smoothing = 1 - Math.exp(-dt * 12);
    crouchBlend += ((crouch ? 1 : 0) - crouchBlend) * smoothing;
    motionBlend += ((moving ? 1 : 0) - motionBlend) * smoothing;
    const phase = elapsed * (sprint ? 14 : 9);
    const bob = Math.sin(phase * 2) * .012 * motionBlend + Math.sin(elapsed * 2) * .003;
    body.setLocalPosition(0, -.31 * crouchBlend + bob, 0);
    body.setLocalEulerAngles(dead ? 84 : crouchBlend * 8 + (sprint && moving ? 7 : 0), 0, dead ? 12 : 0);
    if (model) {
      const desired = moving ? (sprint ? 'run' : 'walk') : 'idle';
      if (desired !== animationState) {
        animationState = desired;
        if (desired === 'idle') {
          model.anim.playing = false;
          rest.forEach(({ node, rotation, position }) => { node.setLocalRotation(rotation); node.setLocalPosition(position); });
        } else {
          model.anim.playing = true;
          model.anim.baseLayer.transition(desired, .14);
        }
      }
      model.anim.speed = crouch ? .58 : 1;
      const reloadRoll = reload ? Math.sin(Math.min(1, reloadTime / 1.6) * Math.PI) : 0;
      gunMount.setLocalPosition(.13, 1.25 - .10 * reloadRoll, -.34);
      gunMount.setLocalEulerAngles(reloadRoll * -15, reloadRoll * -10, reloadRoll * -25);
      for (const limb of limbs) {
        if (limb.side === 'right') solveArm(limb, [.13, 1.24 - .08 * reloadRoll, -.42], [1, -.5, .2]);
        else solveArm(limb, [-.02 - .08 * reloadRoll, 1.25 - .26 * reloadRoll, -.67 + .25 * reloadRoll], [-1, -.6, .2]);
      }
    } else {
      fallback.legs.forEach(({ hip, knee }, i) => {
        const swing = Math.sin(phase + i * Math.PI) * motionBlend;
        hip.setLocalEulerAngles(swing * (sprint ? 39 : 25) - crouchBlend * 35, 0, 0);
        knee.setLocalEulerAngles(Math.max(0, -swing) * 38 + crouchBlend * 58, 0, 0);
      });
    }
    // Team patch follows the chest, with shape and color visible at match distance.
    patch.enabled = !dead;
    gunMount.enabled = !dead;
  }

  setWeapon(weapon);
  setOperator(operator);
  entity.once('destroy', () => {
    destroyed = true;
    clonedMaterials.forEach(m => m.destroy());
    fabric.destroy();
    trim.destroy();
  });

  const ready = loadModel(app).then(asset => {
    if (destroyed) return false;
    model = asset.resource.instantiateRenderEntity({ castShadows: true, receiveShadows: true });
    rigRoot.addChild(model);
    model.findComponents('render').forEach(render => render.meshInstances.forEach(mi => {
      const clone = mi.material.clone();
      mi.material = clone;
      clonedMaterials.push(clone);
    }));
    model.addComponent('anim', { activate: true });
    const clips = asset.resource.animations;
    const walk = clips.find(a => /walk/i.test(a.name)) || clips[1] || clips[0];
    const run = clips.find(a => /run/i.test(a.name)) || clips[0];
    model.anim.assignAnimation('walk', walk.resource);
    model.anim.assignAnimation('run', run.resource);
    model.anim.playing = false;
    for (const node of model.find(() => true)) rest.push({ node, rotation: node.getLocalRotation().clone(), position: node.getLocalPosition().clone() });
    for (const [prefix, side] of [['Right', 'right'], ['Left', 'left']]) {
      const upper = model.findByName(`${prefix}Arm`), lower = model.findByName(`${prefix}ForeArm`), hand = model.findByName(`${prefix}Hand`);
      if (upper && lower && hand) limbs.push({ upper, lower, hand, side, upperLength: upper.getPosition().distance(lower.getPosition()), lowerLength: lower.getPosition().distance(hand.getPosition()) });
    }
    neck = model.findByName('neck');
    fallback.entity.enabled = false;
    loaded = true;
    setOperator(currentOperator);
    update(0);
    return true;
  }).catch(error => {
    console.warn('Operator model unavailable; articulated fallback retained.', error);
    return false;
  });

  return { entity, update, setWeapon, setOperator, ready, get loaded() { return loaded; }, get weapon() { return currentWeapon; }, get operator() { return currentOperator; } };
}
