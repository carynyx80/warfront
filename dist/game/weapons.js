/**
 * WARFRONT's original procedural firearm models.
 * Meters, trigger-hand grip at the origin, muzzle points toward local -Z.
 * Shapes are batched by material; meshes/materials are shared across operators.
 */
export const WEAPON_DETAILS = Object.freeze({
  M4A1: { label: 'M4A1', category: 'ASSAULT RIFLE', description: 'A balanced carbine with a compact reflex optic.', color: '#b8ac87', length: 1.02 },
  AK74: { label: 'AK-74', category: 'ASSAULT RIFLE', description: 'Hard-hitting rifle with a curved magazine and iron sights.', color: '#a38765', length: 1.00 },
  MP5: { label: 'MP5', category: 'SUBMACHINE GUN', description: 'A compact, fast-firing option for tight city streets.', color: '#93a7a0', length: .77 },
  M24: { label: 'M24', category: 'PRECISION RIFLE', description: 'Scoped bolt-action rifle for deliberate long-range shots.', color: '#a8ad86', length: 1.23 },
  M9: { label: 'M9', category: 'SIDEARM', description: 'A lightweight semi-automatic backup pistol.', color: '#a2adb6', length: .24 },
  'SCAR-L': { label: 'SCAR-L', category: 'ASSAULT RIFLE', description: 'A modular rifle with a holographic sight and folding stock.', color: '#d3b483', length: .99 },
  M249: { label: 'M249', category: 'LIGHT MACHINE GUN', description: 'Belt-fed support weapon with a box magazine and bipod.', color: '#a5a286', length: 1.14 }
});

const caches = new WeakMap();
const PALETTE = {
  metal: { color: [.28, .30, .31], metallic: .5, gloss: .49 },
  black: { color: [.085, .095, .10], metallic: .08, gloss: .27 },
  tan: { color: [.38, .345, .25], metallic: .12, gloss: .3 },
  olive: { color: [.225, .255, .155], metallic: .06, gloss: .25 },
  wood: { color: [.285, .145, .087], metallic: 0, gloss: .34 },
  edge: { color: [.42, .44, .43], metallic: .65, gloss: .65 },
  glass: { color: [.04, .27, .31], metallic: .72, gloss: .95 },
  brass: { color: [.48, .34, .11], metallic: .78, gloss: .6 }
};

const add = (a, b) => a.map((n, i) => n + b[i]);
const sub = (a, b) => a.map((n, i) => n - b[i]);
const mul = (v, s) => v.map(n => n * s);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = v => mul(v, 1 / (Math.hypot(...v) || 1));

class Geometry {
  constructor() { this.groups = new Map(); }
  triangle(material, a, b, c, normals) {
    let g = this.groups.get(material);
    if (!g) { g = { positions: [], normals: [], indices: [] }; this.groups.set(material, g); }
    const i = g.positions.length / 3;
    const normal = unit(cross(sub(b, a), sub(c, a)));
    g.positions.push(...a, ...b, ...c);
    g.normals.push(...(normals?.[0] || normal), ...(normals?.[1] || normal), ...(normals?.[2] || normal));
    g.indices.push(i, i + 1, i + 2);
  }
  quad(material, a, b, c, d) { this.triangle(material, a, b, c); this.triangle(material, a, c, d); }
  /** Extrude a counterclockwise Y/Z silhouette across the gun's X axis. */
  profile(material, width, points, x = 0) {
    // Zero bevels produce coincident corner points; remove them before clipping.
    points = points.filter((p, i) => { const q = points[(i + points.length - 1) % points.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-9; });
    const area = points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]; return sum + p[0] * q[1] - p[1] * q[0]; }, 0);
    if (area < 0) points = [...points].reverse();
    const left = points.map(([y, z]) => [x - width / 2, y, z]);
    const right = points.map(([y, z]) => [x + width / 2, y, z]);
    // Ear clipping also preserves the inset edges of rifle stocks and grips.
    const remaining = points.map((_, i) => i);
    const turn = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    let attempts = points.length * points.length;
    while (remaining.length > 2 && attempts-- > 0) {
      let clipped = false;
      for (let j = 0; j < remaining.length; j++) {
        const a = remaining[(j + remaining.length - 1) % remaining.length], b = remaining[j], c = remaining[(j + 1) % remaining.length];
        if (turn(points[a], points[b], points[c]) < 1e-10) continue;
        const inside = remaining.some(k => k !== a && k !== b && k !== c && turn(points[a], points[b], points[k]) >= -1e-10 && turn(points[b], points[c], points[k]) >= -1e-10 && turn(points[c], points[a], points[k]) >= -1e-10);
        if (inside) continue;
        this.triangle(material, right[a], right[b], right[c]);
        this.triangle(material, left[a], left[c], left[b]);
        remaining.splice(j, 1);
        clipped = true;
        break;
      }
      if (!clipped) break;
    }
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      this.quad(material, left[i], right[i], right[j], left[j]);
    }
  }
  box(material, center, size, bevel = 0) {
    const [x, y, z] = center, [w, h, d] = size;
    const b = Math.min(bevel, h / 3, d / 3);
    this.profile(material, w, [
      [y - h / 2 + b, z - d / 2], [y - h / 2, z - d / 2 + b],
      [y - h / 2, z + d / 2 - b], [y - h / 2 + b, z + d / 2],
      [y + h / 2 - b, z + d / 2], [y + h / 2, z + d / 2 - b],
      [y + h / 2, z - d / 2 + b], [y + h / 2 - b, z - d / 2]
    ], x);
  }
  tube(material, start, end, radius, segments = 12, radiusEnd = radius, cap = true) {
    const axis = unit(sub(end, start));
    const u = unit(cross(axis, Math.abs(axis[1]) > .95 ? [1, 0, 0] : [0, 1, 0]));
    const v = cross(axis, u);
    const point = (p, r, a) => add(p, add(mul(u, Math.cos(a) * r), mul(v, Math.sin(a) * r)));
    for (let i = 0; i < segments; i++) {
      const a = i / segments * Math.PI * 2, b = (i + 1) / segments * Math.PI * 2;
      const p = point(start, radius, a), q = point(start, radius, b), r = point(end, radiusEnd, b), s = point(end, radiusEnd, a);
      this.quad(material, p, q, r, s);
      if (cap) {
        this.triangle(material, start, q, p);
        this.triangle(material, end, s, r);
      }
    }
  }
}

function trigger(g, z = -.045, scale = 1) {
  g.box('metal', [0, -.041 * scale, z], [.012, .065 * scale, .011], .003);
  g.box('black', [0, -.075 * scale, z], [.034, .012, .088 * scale], .005);
  g.box('black', [0, -.042 * scale, z - .044 * scale], [.034, .067 * scale, .012], .005);
}

function grip(g, color = 'black', z = 0) {
  g.profile(color, .055, [[-.145, z + .009], [-.132, z + .061], [.055, z + .019], [.06, z - .029]]);
  for (let i = 0; i < 5; i++) g.box('black', [0, -.105 + i * .025, z + .038 - i * .006], [.058, .007, .027], .002);
  trigger(g, z - .056);
}

function rail(g, z, length, y = .217, width = .045) {
  g.box('black', [0, y, z], [width * .72, .012, length]);
  const count = Math.floor(length / .026);
  for (let i = 0; i < count; i++) g.box('metal', [0, y + .009, z - length / 2 + .013 + i * .026], [width, .009, .014]);
}

function barrel(g, start, end, y = .139, radius = .013, brake = true) {
  g.tube('metal', [0, y, start], [0, y, end], radius, 14);
  if (brake) {
    g.tube('black', [0, y, end + .046], [0, y, end - .018], radius * 1.55, 14);
    for (let i = 0; i < 3; i++) for (const side of [-1, 1]) g.box('metal', [side * radius * 1.52, y, end + .006 + i * .012], [.003, radius * 1.15, .006]);
  }
  g.tube('black', [0, y, end - .0185], [0, y, end - .019], radius * .65, 12);
}

function magazine(g, z, color = 'metal', curved = false, tall = .21) {
  if (curved) {
    // Three continuous tapered sections create the forward sweep of a magazine.
    g.profile(color, .061, [[-.013, z - .045], [-.095, z - .051], [-.13, z + .017], [-.013, z + .047]]);
    g.profile(color, .059, [[-.095, z - .051], [-tall + .033, z - .095], [-tall, z - .019], [-.13, z + .017]]);
    g.box('black', [0, -tall + .003, z - .053], [.065, .016, .08], .004);
    for (const side of [-1, 1]) for (let j = 0; j < 3; j++) {
      g.box('black', [side * .031, -.057, z - .023 + j * .024], [.003, .091, .006]);
      g.profile('black', .003, [[-.107, z - .037 + j * .023], [-tall + .024, z - .071 + j * .023], [-tall + .023, z - .065 + j * .023], [-.107, z - .031 + j * .023]], side * .03);
    }
  } else {
    g.profile(color, .061, [[-.014, z - .046], [-tall, z - .079], [-tall - .012, z + .007], [-.014, z + .044]]);
    for (let i = 0; i < 5; i++) g.box('black', [0, -.05 - i * .029, z - i * .005], [.064, .006, .082], .001);
    g.box('black', [0, -tall + .004, z - .033], [.07, .014, .09], .003);
  }
}

function receiverDetails(g, z = -.105, y = .137) {
  g.box('black', [.038, y, z], [.004, .039, .105], .007);
  g.box('edge', [.041, y + .008, z + .017], [.003, .011, .057], .002);
  for (const side of [-1, 1]) {
    for (let j = 0; j < 3; j++) g.tube('edge', [side * .037, .081 + j * .04, z + .079], [side * .041, .081 + j * .04, z + .079], .005, 8);
    g.box('edge', [side * .039, .111, z + .099], [.006, .009, .022], .003);
  }
}

function reflex(g, z = -.15, y = .26, wide = false) {
  const w = wide ? .055 : .041;
  g.box('metal', [0, y - .02, z], [.054, .034, .075], .007);
  g.box('black', [-w / 2, y + .017, z], [.013, .059, .047], .005);
  g.box('black', [w / 2, y + .017, z], [.013, .059, .047], .005);
  g.box('black', [0, y + .047, z], [w + .009, .012, .047], .005);
  g.box('glass', [0, y + .021, z + .004], [w - .008, .038, .006], .004);
  g.box('metal', [w / 2 + .009, y + .006, z], [.012, .019, .02], .003);
}

function irons(g, front, rear, y = .23) {
  for (const z of [front, rear]) {
    g.box('metal', [0, y - .018, z], [.026, .027, .031], .003);
    g.box('black', [-.016, y + .009, z], [.008, .035, .014]);
    g.box('black', [.016, y + .009, z], [.008, .035, .014]);
  }
  g.box('edge', [0, y + .006, front], [.007, .03, .008]);
}

function collapsibleStock(g, color = 'tan', end = .34) {
  g.tube('metal', [0, .13, .062], [0, .13, end - .025], .022);
  g.profile(color, .071, [[.108, .142], [.056, end - .037], [-.019, end - .003], [-.014, end + .018], [.173, end + .018], [.179, .146]]);
  g.box('black', [0, .068, end + .028], [.079, .205, .022], .009);
  g.box(color, [0, .16, end - .085], [.086, .045, .12], .012);
  g.box('black', [0, .061, end - .078], [.04, .016, .051], .005);
  for (let i = 0; i < 6; i++) g.box('metal', [0, .035 + i * .022, end + .041], [.065, .006, .003]);
}

function makeM4(g) {
  g.box('metal', [0, .12, -.098], [.072, .16, .315], .022);
  g.box('tan', [0, .142, -.361], [.078, .098, .264], .014);
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) g.box('black', [side * .04, .142, -.258 - i * .035], [.004, .023, .019], .005);
  g.box('black', [0, .089, -.36], [.045, .021, .238], .005);
  grip(g); magazine(g, -.16, 'tan'); receiverDetails(g);
  collapsibleStock(g); rail(g, -.23, .48); reflex(g, -.11);
  barrel(g, -.47, -.644);
  g.box('black', [0, -.008, -.348], [.045, .14, .046], .012);
  irons(g, -.439, .019, .236);
  return { muzzle: [0, .139, -.664], support: [0, -.023, -.348] };
}

function makeAK(g) {
  g.box('metal', [0, .118, -.103], [.077, .141, .313], .013);
  g.tube('black', [0, .191, .033], [0, .191, -.23], .03, 10);
  g.box('wood', [0, .116, -.321], [.082, .089, .179], .013);
  g.box('wood', [0, .193, -.32], [.061, .052, .139], .009);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) g.box('black', [s * .042, .117, -.263 - i * .035], [.004, .053, .008], .001);
  grip(g, 'wood'); magazine(g, -.172, 'black', true, .235);
  g.profile('wood', .075, [[.088, .041], [-.018, .31], [-.022, .355], [.151, .355], [.174, .068]]);
  g.box('black', [0, .066, .36], [.079, .18, .016], .007);
  g.tube('metal', [0, .191, -.37], [0, .191, -.471], .013, 10);
  g.box('metal', [0, .163, -.461], [.043, .072, .025], .006);
  barrel(g, -.407, -.62);
  g.box('metal', [.056, .157, -.154], [.062, .014, .022], .005);
  g.box('edge', [-.041, .104, -.047], [.008, .013, .105], .004);
  irons(g, -.558, -.201, .233);
  receiverDetails(g, -.09, .133);
  return { muzzle: [0, .139, -.64], support: [0, .067, -.32] };
}

function makeMP5(g) {
  g.tube('metal', [0, .148, .025], [0, .148, -.322], .036, 12);
  g.box('black', [0, .085, -.06], [.068, .13, .191], .017);
  g.profile('black', .079, [[.076, -.2], [.076, -.382], [.173, -.36], [.196, -.207]]);
  for (let i = 0; i < 6; i++) g.box('metal', [0, .087, -.218 - i * .025], [.081, .007, .01]);
  grip(g); magazine(g, -.145, 'metal', true, .18);
  for (const s of [-1, 1]) g.tube('metal', [s * .031, .14, .008], [s * .031, .14, .282], .009, 8);
  g.box('black', [0, .07, .287], [.071, .195, .026], .011);
  g.tube('metal', [0, .193, -.11], [0, .193, -.364], .014, 10);
  g.box('metal', [-.037, .196, -.303], [.054, .017, .025], .004);
  barrel(g, -.35, -.464, .148, .014);
  rail(g, -.12, .15, .2); reflex(g, -.117, .248);
  irons(g, -.381, .009, .211);
  receiverDetails(g, -.087, .126);
  return { muzzle: [0, .148, -.484], support: [0, .067, -.29] };
}

function makeM24(g) {
  g.profile('olive', .08, [[.027, -.544], [.005, -.242], [-.024, -.105], [-.084, .015], [-.019, .309], [-.012, .365], [.155, .365], [.148, .164], [.084, -.06], [.117, -.544]]);
  g.box('black', [0, .065, .372], [.087, .19, .025], .009);
  g.box('olive', [0, .16, .261], [.093, .049, .178], .013);
  g.tube('metal', [0, .139, .029], [0, .139, -.82], .016, 16);
  g.tube('black', [0, .139, -.54], [0, .139, -.842], .019, 16);
  g.tube('black', [0, .139, -.843], [0, .139, -.845], .011, 12);
  g.box('metal', [0, .138, -.08], [.064, .066, .234], .015);
  magazine(g, -.122, 'black', false, .07); trigger(g, -.014);
  g.tube('edge', [.03, .145, .018], [.083, .09, .032], .009, 10);
  g.tube('black', [.083, .09, .032], [.083, .074, .032], .017, 10);
  rail(g, -.129, .237, .184);
  for (const z of [-.061, -.236]) {
    g.box('metal', [0, .222, z], [.051, .074, .028], .005);
    g.tube('black', [0, .272, z - .013], [0, .272, z + .013], .03, 14);
  }
  g.tube('metal', [0, .272, .02], [0, .272, -.348], .023, 16);
  g.tube('black', [0, .272, -.265], [0, .272, -.377], .029, 18, .043);
  g.tube('black', [0, .272, .043], [0, .272, -.025], .03, 16);
  g.tube('glass', [0, .272, -.3775], [0, .272, -.378], .036, 18);
  g.tube('glass', [0, .272, .043], [0, .272, .044], .023, 16);
  g.tube('black', [0, .288, -.16], [0, .325, -.16], .023, 12);
  g.tube('black', [.017, .272, -.16], [.044, .272, -.16], .021, 12);
  for (const side of [-1, 1]) {
    g.tube('metal', [side * .035, .028, -.47], [side * .046, -.005, -.73], .008, 8);
    g.box('black', [side * .046, -.005, -.729], [.024, .02, .039], .005);
  }
  return { muzzle: [0, .139, -.845], support: [0, .037, -.38] };
}

function makeM9(g) {
  g.box('metal', [0, .09, -.053], [.033, .044, .205], .008);
  g.box('black', [0, .055, -.025], [.033, .033, .138], .006);
  g.profile('black', .034, [[-.082, .018], [-.075, .06], [.068, .028], [.052, -.013]]);
  for (const s of [-1, 1]) g.profile('metal', .002, [[-.067, .021], [-.061, .05], [.022, .029], [.021, -.002]], s * .018);
  for (let j = 0; j < 6; j++) for (const s of [-1, 1]) g.box('edge', [s * .018, .091, .011 + j * .005], [.002, .033, .002]);
  g.tube('edge', [0, .089, -.12], [0, .089, -.162], .008, 12);
  g.tube('black', [0, .089, -.162], [0, .089, -.163], .005, 10);
  g.box('black', [0, .119, -.139], [.007, .014, .009], .002);
  g.box('black', [0, .119, .029], [.026, .013, .013], .002);
  g.box('edge', [0, .124, -.139], [.003, .003, .003]);
  g.box('black', [0, .09, .055], [.012, .037, .012], .004);
  g.box('edge', [-.019, .061, .011], [.005, .009, .027], .002);
  g.box('black', [0, -.079, .041], [.041, .011, .047], .004);
  trigger(g, -.034, .55);
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) g.box('black', [s * .02, -.055 + i * .015, .023 - i * .003], [.002, .005, .022], .001);
  return { muzzle: [0, .089, -.164], support: [0, -.02, .005] };
}

function makeSCAR(g) {
  g.box('tan', [0, .135, -.156], [.087, .155, .424], .018);
  g.box('black', [0, .041, -.042], [.068, .046, .195], .007);
  grip(g, 'tan'); magazine(g, -.161, 'metal');
  g.profile('tan', .09, [[.072, .066], [-.021, .279], [-.018, .326], [.159, .326], [.183, .16], [.172, .065]]);
  g.box('black', [0, .067, .337], [.096, .199, .024], .009);
  g.box('tan', [0, .17, .226], [.1, .047, .155], .011);
  g.box('metal', [0, .12, .064], [.095, .092, .024], .007);
  for (const s of [-1, 1]) {
    g.box('black', [s * .045, .145, -.3], [.01, .039, .151], .006);
    for (let i = 0; i < 6; i++) g.box('metal', [s * .05, .145, -.242 - i * .025], [.012, .043, .01]);
  }
  g.box('black', [-.045, .16, -.078], [.008, .017, .182], .004);
  g.box('metal', [-.068, .16, -.13], [.051, .013, .023], .003);
  rail(g, -.152, .407, .224); reflex(g, -.075, .268, true);
  barrel(g, -.36, -.62);
  g.box('black', [0, .055, -.316], [.049, .031, .129], .006);
  g.profile('tan', .042, [[.037, -.274], [-.06, -.297], [-.049, -.334], [.042, -.331]]);
  receiverDetails(g, -.1, .154); irons(g, -.351, .025, .251);
  return { muzzle: [0, .139, -.64], support: [0, -.014, -.31] };
}

function makeM249(g) {
  g.box('metal', [0, .137, -.132], [.11, .151, .373], .018);
  g.box('olive', [0, .207, -.124], [.115, .051, .29], .011);
  g.box('black', [0, .104, -.383], [.106, .091, .201], .015);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) g.box('metal', [s * .055, .104, -.307 - i * .029], [.008, .076, .011]);
  grip(g); collapsibleStock(g, 'olive', .346);
  g.box('olive', [-.025, -.057, -.171], [.191, .237, .18], .016);
  g.box('black', [-.025, .053, -.171], [.204, .024, .188], .007);
  for (let i = 0; i < 5; i++) {
    g.tube('brass', [-.096 - i * .007, .11 + i * .018, -.2], [-.096 - i * .007, .11 + i * .018, -.118], .008, 8);
    g.tube('metal', [-.096 - i * .007, .11 + i * .018, -.145], [-.096 - i * .007, .11 + i * .018, -.134], .01, 8);
  }
  barrel(g, -.468, -.75, .139, .017);
  g.tube('metal', [0, .087, -.438], [0, .087, -.636], .017, 10);
  g.box('metal', [0, .119, -.617], [.058, .091, .041], .007);
  for (const s of [-1, 1]) {
    g.tube('metal', [s * .035, .081, -.56], [s * .057, .021, -.735], .012, 8);
    g.box('black', [s * .057, .021, -.735], [.035, .02, .055], .004);
  }
  g.tube('metal', [.052, .162, -.336], [.089, .278, -.336], .01, 8);
  g.tube('black', [.089, .278, -.336], [.089, .278, -.491], .017, 10);
  rail(g, -.109, .24, .242); reflex(g, -.108, .283, true);
  irons(g, -.593, .015, .247); receiverDetails(g, -.052, .162);
  return { muzzle: [0, .139, -.77], support: [0, .056, -.39] };
}

const factories = { M4A1: makeM4, AK74: makeAK, MP5: makeMP5, M24: makeM24, M9: makeM9, 'SCAR-L': makeSCAR, M249: makeM249 };

function getCache(pc) {
  const device = pc.Application.getApplication()?.graphicsDevice;
  if (!device) throw new Error('Create the PlayCanvas application before creating a weapon.');
  let cache = caches.get(device);
  if (!cache) {
    const materials = {};
    for (const [name, value] of Object.entries(PALETTE)) {
      const m = new pc.StandardMaterial();
      m.name = `weapon-${name}`;
      m.diffuse = new pc.Color(...value.color);
      m.useMetalness = true;
      m.metalness = value.metallic;
      m.gloss = value.gloss;
      if (name === 'glass') m.emissive = new pc.Color(.006, .026, .031);
      m.update();
      materials[name] = m;
    }
    cache = { device, materials, templates: new Map() };
    caches.set(device, cache);
  }
  return cache;
}

/**
 * Return an unattached weapon Entity. Call .destroy() when unequipping it.
 * root.muzzle is a child Entity suitable for getPosition()/muzzle effects.
 * root.supportHand is the suggested local grip for the off hand, in meters.
 */
export function createWeapon(pc, id = 'M4A1', { viewmodel = false } = {}) {
  if (!Object.hasOwn(factories, id)) id = 'M4A1';
  const cache = getCache(pc);
  let template = cache.templates.get(id);
  if (!template) {
    const geometry = new Geometry();
    const anchors = factories[id](geometry);
    const meshes = [];
    for (const [name, data] of geometry.groups) {
      const mesh = new pc.Mesh(cache.device);
      mesh.setPositions(data.positions);
      mesh.setNormals(data.normals);
      mesh.setIndices(data.indices);
      mesh.update(pc.PRIMITIVE_TRIANGLES);
      // The cache owns a reference independently of the equipped entities.
      mesh.incRefCount();
      meshes.push({ mesh, material: cache.materials[name] });
    }
    template = { ...anchors, meshes };
    cache.templates.set(id, template);
  }
  const root = new pc.Entity(`weapon-${id}`);
  const meshInstances = template.meshes.map(({ mesh, material }) => new pc.MeshInstance(mesh, material, root));
  root.addComponent('render', { meshInstances, castShadows: !viewmodel, receiveShadows: !viewmodel });
  const muzzle = new pc.Entity('muzzle');
  muzzle.setLocalPosition(...template.muzzle);
  root.addChild(muzzle);
  root.weaponId = id;
  root.muzzle = muzzle;
  root.supportHand = new pc.Vec3(...template.support);
  root.userData = { weaponId: id, muzzle: [...template.muzzle], supportHand: [...template.support] };
  if (viewmodel) {
    const armMat=cache.materials.olive,gloveMat=cache.materials.black;
    const limb=(name,a,b,radius,material)=>{
      const e=new pc.Entity(name),start=new pc.Vec3(...a),end=new pc.Vec3(...b),direction=new pc.Vec3().sub2(end,start);
      e.addComponent('render',{type:'capsule',material,castShadows:false});
      e.setLocalPosition(new pc.Vec3().add2(start,end).mulScalar(.5));
      e.setLocalScale(radius,direction.length()+radius*.35,radius);
      e.setLocalRotation(new pc.Quat().setFromDirections(pc.Vec3.UP,direction.normalize()));
      root.addChild(e);
    };
    limb('right glove',[-.015,-.03,.02],[.02,-.11,.02],.09,gloveMat);
    limb('right sleeve',[.03,-.1,.10],[.19,-.30,.40],.125,armMat);
    if(id!=='M9') {
      const p=template.support;
      limb('left glove',[p[0]-.035,p[1]-.03,p[2]],[p[0]-.035,p[1]-.11,p[2]+.025],.095,gloveMat);
      limb('left sleeve',[p[0]-.05,p[1]-.12,p[2]+.055],[-.28,-.31,.2],.12,armMat);
    }
  }

  return root;
}

const ICONS = {
  M4A1: 'M12 36h45l12-8h68l5 5h43v8h-47l-18 4-1 17h-15l-6-16H81l5 17H73L61 45H42L18 55h-6z M91 25h19v-9H91z',
  AK74: 'M10 37h44l10-7h68l9 5h46v6h-48l-16 3-3 19-15 7-7-9 5-16H82l6 19H75L63 45H44L13 57z M132 26h13v9h-13z',
  MP5: 'M17 32h43l8-6h68l8 8h27v8h-32l-20 4-5 23-13-2 3-22H82l6 20H74L61 44H22v16h-9V33z M82 23h21v-8H82z',
  M24: 'M9 44l45-7 26 2 16-10h41l5 7h48v5h-50l-40 7H75l-9 8-14-5-40 11z M85 17h43v-5h17v14h-17v-4H85v3H75V14h10z M97 24v8h7v-8z',
  M9: 'M45 20h98v16h-38l-14 13h-15l-8 27H48l14-40H45z M85 36h13l-10 9H81z M128 17h7v6h-7z',
  'SCAR-L': 'M10 31h46l8-7h77v9h44v8h-48l-12 4-1 20h-17l-4-20H81l4 20H72L60 45H41L14 56h-4z M88 21h24V11H88z',
  M249: 'M10 34h45l9-8h73l4 7h45v8h-48l-14 5v21H88V46h-9l7 19H72L60 45H41L14 54h-4z M94 23h19V13H94z M145 43l16 27h6l-13-28z M130 25V14h24v6h-18v5z'
};

/** Original authored vector silhouette, suitable for innerHTML in loadout cards. */
export function weaponIcon(id) {
  const key = Object.hasOwn(ICONS, id) ? id : 'M4A1';
  return `<svg viewBox="0 0 200 86" fill="currentColor" role="img" aria-label="${WEAPON_DETAILS[key].label}" xmlns="http://www.w3.org/2000/svg"><path d="${ICONS[key]}"/></svg>`;
}
