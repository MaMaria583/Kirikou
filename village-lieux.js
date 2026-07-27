/* Le village de Naba — les lieux en 3D.
   Chaque lieu renvoie { group, spots, cam } ; les spots sont les groupes
   cliquables (userData.hotspot / label), avec un halo d'or intégré. */
import * as THREE from 'three';

export const M = (name, color, o = {}) =>
  new THREE.MeshStandardMaterial({ name, color, roughness: 0.9, ...o });

export const mat = {
  banco: M('banco', 0xc98f57, { roughness: 1 }),
  bancoSombre: M('banco_sombre', 0xa4652f, { roughness: 1 }),
  chaume: M('chaume', 0xd0a862, { roughness: 1, flatShading: true }),
  chaumeClair: M('chaume_clair', 0xdcbb79, { roughness: 1, flatShading: true }),
  corde: M('corde', 0x6b5433, { roughness: 1 }),
  bois: M('bois', 0x6d4a2b, { roughness: 0.85 }),
  boisClair: M('bois_clair', 0x9a7346, { roughness: 0.85 }),
  terre: M('terre_laterite', 0xb56a3c, { roughness: 1 }),
  sable: M('sable', 0xc99a63, { roughness: 1 }),
  solBattu: M('sol_battu', 0x8d5c39, { roughness: 1 }),
  terreCuite: M('terre_cuite', 0x8e4529, { roughness: 0.8 }),
  pierre: M('pierre', 0x7c746b, { roughness: 0.95 }),
  cendre: M('cendre', 0x9d968c, { roughness: 1 }),
  peau: M('peau_de_chevre', 0xe6d8b8, { roughness: 0.7 }),
  calebasse: M('calebasse', 0xd8c187, { roughness: 0.6 }),
  tissu: M('tissu_indigo', 0x2f4056, { roughness: 0.95 }),
  tissuOcre: M('tissu_ocre', 0xa8541f, { roughness: 0.95 }),
  natte: M('natte', 0xc0a46a, { roughness: 1 }),
  masque: M('masque_bois', 0x4a3120, { roughness: 0.8 }),
  or: M('or', 0xd9a83a, { roughness: 0.35, metalness: 0.35 }),
  cauri: M('cauri', 0xefe4cf, { roughness: 0.5 }),
  ombre: M('sombre', 0x2b1d13, { roughness: 1 }),
  peauEnfant: M('peau', 0x5d3521, { roughness: 0.75 }),
  braise: M('braise', 0x8a2a10, { roughness: 0.8 }),
  feuille: M('feuillage', 0x6d8a3c, { roughness: 0.95, flatShading: true }),
  feuilleSombre: M('feuillage_sombre', 0x4f6b2c, { roughness: 0.95, flatShading: true }),
  milVert: M('mil_vert', 0x9fb356, { roughness: 0.95 }),
  milMur: M('mil_mur', 0xd8b25c, { roughness: 0.9 }),
  herbe: M('herbe', 0x7f9a46, { roughness: 1 }),
  poil: M('poil_chevre', 0xd8cdb8, { roughness: 0.95 }),
  poilBrun: M('poil_brun', 0x8a6136, { roughness: 0.95 }),
  poilGris: M('poil_gris', 0x9b958c, { roughness: 0.95 }),
  poilNoir: M('poil_noir', 0x3b332c, { roughness: 0.95 }),
  plume: M('plume', 0xe4d6bd, { roughness: 0.95 }),
  plumeRousse: M('plume_rousse', 0xa8663a, { roughness: 0.95 }),
  plumePintade: M('plume_pintade', 0x5b5f66, { roughness: 0.9 }),
  bec: M('bec', 0xd9a13a, { roughness: 0.6 }),
  crete: M('crete', 0xa8302a, { roughness: 0.7 }),
  eau: M('eau', 0x4d7f86, { roughness: 0.25, metalness: 0.1 }),
  ecorce: M('ecorce_baobab', 0x9a8368, { roughness: 1 }),
};

export const mesh = (geo, m, name) => { const x = new THREE.Mesh(geo, m); x.name = name; return x; };
export const lathe = (p, m, name, seg = 36) =>
  mesh(new THREE.LatheGeometry(p.map(v => new THREE.Vector2(v[0], v[1])), seg), m, name);

function ring(a0, a1, inner, outer, h, m, name) {
  const N = 64, pts = [];
  for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * i / N; pts.push(new THREE.Vector2(Math.cos(a) * outer, Math.sin(a) * outer)); }
  for (let i = N; i >= 0; i--) { const a = a0 + (a1 - a0) * i / N; pts.push(new THREE.Vector2(Math.cos(a) * inner, Math.sin(a) * inner)); }
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: h, bevelEnabled: false, curveSegments: 8 });
  geo.rotateX(-Math.PI / 2);
  return mesh(geo, m, name);
}

/* ═══ fabrique de spots ═══ */
function spotFactory(root, spots) {
  return (id, label, x, y, z, rHalo = 0.4) => {
    const g = new THREE.Group(); g.name = id;
    g.userData = { hotspot: id, label };
    g.position.set(x, y, z);
    const halo = mesh(new THREE.TorusGeometry(rHalo, 0.024, 8, 44), mat.or, 'halo_' + id);
    halo.rotation.x = Math.PI / 2; halo.position.y = 0.05; halo.visible = false;
    halo.userData.halo = true; g.add(halo); g.userData.halo = halo;
    root.add(g); spots[id] = g; return g;
  };
}

/* ═══ animaux ═══ */
export function quadrupede(o = {}) {
  const {
    corps = mat.poilBrun, longueur = 0.6, hauteur = 0.42, epaisseur = 0.26,
    cornes = 0, oreilles = 'courtes', bosse = false, queue = 'fine', criniere = false, nom = 'animal',
  } = o;
  const g = new THREE.Group(); g.name = nom;
  const tronc = mesh(new THREE.SphereGeometry(0.5, 20, 14), corps, nom + '_corps');
  tronc.scale.set(epaisseur * 2, hauteur * 1.05, longueur * 1.7);
  tronc.position.y = hauteur; g.add(tronc);
  if (bosse) {
    const b = mesh(new THREE.SphereGeometry(0.16, 16, 12), corps, nom + '_bosse');
    b.scale.set(0.8, 0.9, 1.1); b.position.set(0, hauteur + hauteur * 0.5, -longueur * 0.1); g.add(b);
  }
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const p = mesh(new THREE.CylinderGeometry(epaisseur * 0.2, epaisseur * 0.15, hauteur, 10), corps, nom + '_patte');
    p.position.set(sx * epaisseur * 0.65, hauteur / 2, sz * longueur * 0.6); g.add(p);
    const s = mesh(new THREE.CylinderGeometry(epaisseur * 0.19, epaisseur * 0.19, 0.05, 8), mat.ombre, nom + '_sabot');
    s.position.set(sx * epaisseur * 0.65, 0.025, sz * longueur * 0.6); g.add(s);
  }
  const cou = mesh(new THREE.CylinderGeometry(epaisseur * 0.38, epaisseur * 0.45, hauteur * 0.5, 12), corps, nom + '_cou');
  cou.position.set(0, hauteur + hauteur * 0.34, longueur * 0.82); cou.rotation.x = -0.5; g.add(cou);
  const tete = new THREE.Group();
  tete.position.set(0, hauteur + hauteur * 0.62, longueur * 1.02); g.add(tete);
  const crane = mesh(new THREE.SphereGeometry(epaisseur * 0.52, 18, 14), corps, nom + '_tete');
  crane.scale.set(0.85, 0.9, 1.35); tete.add(crane);
  const museau = mesh(new THREE.SphereGeometry(epaisseur * 0.3, 14, 10), mat.ombre, nom + '_museau');
  museau.scale.set(0.9, 0.75, 1); museau.position.set(0, -epaisseur * 0.12, epaisseur * 0.66); tete.add(museau);
  for (const s of [-1, 1]) {
    const oe = mesh(new THREE.SphereGeometry(0.022, 10, 8), mat.ombre, nom + '_oeil');
    oe.position.set(s * epaisseur * 0.32, epaisseur * 0.12, epaisseur * 0.42); tete.add(oe);
    if (oreilles === 'longues') {
      const or = mesh(new THREE.SphereGeometry(0.06, 12, 10), corps, nom + '_oreille');
      or.scale.set(0.4, 1.5, 0.7); or.position.set(s * epaisseur * 0.42, epaisseur * 0.5, -0.02);
      or.rotation.z = -s * 0.3; tete.add(or);
    } else if (oreilles === 'tombantes') {
      const or = mesh(new THREE.SphereGeometry(0.05, 12, 10), corps, nom + '_oreille');
      or.scale.set(0.4, 1.1, 0.8); or.position.set(s * epaisseur * 0.46, epaisseur * 0.3, 0);
      or.rotation.z = -s * 0.9; tete.add(or);
    } else {
      const or = mesh(new THREE.SphereGeometry(0.042, 12, 10), corps, nom + '_oreille');
      or.scale.set(0.4, 0.9, 0.7); or.position.set(s * epaisseur * 0.44, epaisseur * 0.4, 0);
      or.rotation.z = -s * 0.5; tete.add(or);
    }
    for (let c = 0; c < cornes; c++) {
      const co = mesh(new THREE.ConeGeometry(0.028, 0.2 + c * 0.06, 10), mat.cauri, nom + '_corne');
      co.position.set(s * epaisseur * 0.3, epaisseur * 0.62, -0.02);
      co.rotation.set(-0.5, 0, -s * 0.35); tete.add(co);
    }
  }
  if (criniere) {
    for (let i = 0; i < 6; i++) {
      const c = mesh(new THREE.BoxGeometry(0.03, 0.1, 0.06), mat.poilNoir, nom + '_criniere');
      c.position.set(0, hauteur + hauteur * 0.5 + i * 0.02, longueur * (0.86 - i * 0.09));
      c.rotation.x = -0.4; g.add(c);
    }
  }
  const q = mesh(new THREE.CylinderGeometry(0.014, 0.008, queue === 'longue' ? 0.4 : 0.22, 8), corps, nom + '_queue');
  q.position.set(0, hauteur + 0.06, -longueur * 0.95); q.rotation.x = 0.9; g.add(q);
  if (queue === 'longue') {
    const t = mesh(new THREE.SphereGeometry(0.05, 10, 8), mat.poilNoir, nom + '_touffe_queue');
    t.position.set(0, hauteur - 0.16, -longueur * 1.16); g.add(t);
  }
  return g;
}

export function oiseau(o = {}) {
  const { corps = mat.plumeRousse, taille = 1, crete = false, huppe = false, nom = 'oiseau', queueHaute = true } = o;
  const g = new THREE.Group(); g.name = nom;
  const t = mesh(new THREE.SphereGeometry(0.12 * taille, 18, 14), corps, nom + '_corps');
  t.scale.set(0.85, 1, 1.25); t.position.y = 0.16 * taille; g.add(t);
  const tete = mesh(new THREE.SphereGeometry(0.062 * taille, 14, 12), corps, nom + '_tete');
  tete.position.set(0, 0.29 * taille, 0.08 * taille); g.add(tete);
  const bec = mesh(new THREE.ConeGeometry(0.022 * taille, 0.06 * taille, 8), mat.bec, nom + '_bec');
  bec.rotation.x = Math.PI / 2; bec.position.set(0, 0.28 * taille, 0.15 * taille); g.add(bec);
  for (const s of [-1, 1]) {
    const oe = mesh(new THREE.SphereGeometry(0.011 * taille, 8, 6), mat.ombre, nom + '_oeil');
    oe.position.set(s * 0.035 * taille, 0.3 * taille, 0.12 * taille); g.add(oe);
    const p = mesh(new THREE.CylinderGeometry(0.008 * taille, 0.007 * taille, 0.1 * taille, 6), mat.bec, nom + '_patte');
    p.position.set(s * 0.04 * taille, 0.05 * taille, 0.01); g.add(p);
    const a = mesh(new THREE.SphereGeometry(0.07 * taille, 12, 10), corps, nom + '_aile');
    a.scale.set(0.3, 0.8, 1.3); a.position.set(s * 0.09 * taille, 0.18 * taille, 0.01); g.add(a);
  }
  if (crete) {
    const c = mesh(new THREE.SphereGeometry(0.028 * taille, 10, 8), mat.crete, nom + '_crete');
    c.scale.set(0.35, 1, 0.9); c.position.set(0, 0.35 * taille, 0.07 * taille); g.add(c);
  }
  if (huppe) {
    const h = mesh(new THREE.ConeGeometry(0.018 * taille, 0.07 * taille, 8), mat.crete, nom + '_huppe');
    h.position.set(0, 0.35 * taille, 0.05 * taille); g.add(h);
  }
  const q = mesh(new THREE.BoxGeometry(0.02 * taille, 0.09 * taille, 0.13 * taille), corps, nom + '_queue');
  q.position.set(0, (queueHaute ? 0.24 : 0.17) * taille, -0.15 * taille);
  q.rotation.x = queueHaute ? -0.8 : -0.2; g.add(q);
  return g;
}

export function papillon(couleur = mat.or) {
  const g = new THREE.Group(); g.name = 'papillon';
  const c = mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.07, 6), mat.ombre, 'papillon_corps');
  c.rotation.x = Math.PI / 2; g.add(c);
  for (const s of [-1, 1]) {
    const a = mesh(new THREE.CircleGeometry(0.05, 12), couleur, 'papillon_aile');
    a.material.side = THREE.DoubleSide;
    a.position.set(s * 0.045, 0.01, 0); a.rotation.set(-0.4, s * 0.5, 0); g.add(a);
  }
  return g;
}

/* ═══ éléments partagés ═══ */
function arbre(h = 3.2, r = 0.18, feuilles = 5) {
  const g = new THREE.Group(); g.name = 'arbre';
  const t = mesh(new THREE.CylinderGeometry(r * 0.7, r, h, 12), mat.bois, 'tronc');
  t.position.y = h / 2; g.add(t);
  for (let i = 0; i < feuilles; i++) {
    const a = i * (Math.PI * 2 / feuilles);
    const f = mesh(new THREE.SphereGeometry(0.62, 16, 12), i % 2 ? mat.feuille : mat.feuilleSombre, 'feuillage_' + i);
    f.scale.set(1.15, 0.7, 1.15);
    f.position.set(Math.cos(a) * 0.42, h + Math.sin(i) * 0.16, Math.sin(a) * 0.42); g.add(f);
  }
  const c = mesh(new THREE.SphereGeometry(0.7, 16, 12), mat.feuille, 'feuillage_haut');
  c.scale.set(1.1, 0.72, 1.1); c.position.y = h + 0.3; g.add(c);
  return g;
}
function buisson(r = 0.5) {
  const g = new THREE.Group(); g.name = 'buisson';
  for (let i = 0; i < 5; i++) {
    const b = mesh(new THREE.SphereGeometry(r * (0.5 + Math.random() * 0.4), 14, 10), i % 2 ? mat.feuille : mat.feuilleSombre, 'touffe_' + i);
    b.position.set((Math.random() - 0.5) * r, r * 0.45 + Math.random() * r * 0.3, (Math.random() - 0.5) * r);
    b.scale.y = 0.8; g.add(b);
  }
  return g;
}
function tabouretBois() {
  const g = new THREE.Group();
  const a = mesh(new THREE.CylinderGeometry(0.17, 0.155, 0.05, 24), mat.bois, 'assise');
  a.position.y = 0.3; g.add(a);
  for (let i = 0; i < 3; i++) {
    const t = i * (Math.PI * 2 / 3);
    const p = mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.3, 10), mat.bois, 'pied_' + i);
    p.position.set(Math.cos(t) * 0.1, 0.15, Math.sin(t) * 0.1); g.add(p);
  }
  return g;
}
function jarre(s = 1) {
  return lathe([[0.02, 0], [0.15, 0.03], [0.25, 0.14], [0.27, 0.3], [0.21, 0.44], [0.14, 0.5], [0.17, 0.54]]
    .map(([x, y]) => [x * s, y * s]), mat.terreCuite, 'canari');
}
function djembeBois() {
  const g = new THREE.Group();
  g.add(lathe([[0.005, 0], [0.1, 0.01], [0.088, 0.14], [0.072, 0.32], [0.095, 0.44], [0.14, 0.54], [0.163, 0.6]], mat.bois, 'fut'));
  const p = mesh(new THREE.CylinderGeometry(0.168, 0.168, 0.014, 28), mat.peau, 'peau');
  p.position.y = 0.605; g.add(p);
  const c = mesh(new THREE.TorusGeometry(0.166, 0.012, 8, 28), mat.corde, 'cercle');
  c.rotation.x = Math.PI / 2; c.position.y = 0.6; g.add(c);
  return g;
}
function grenierSurPilotis() {
  const g = new THREE.Group(); g.name = 'grenier';
  for (let i = 0; i < 4; i++) {
    const a = i * (Math.PI / 2) + 0.4;
    const p = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.5, 10), mat.bois, 'pilotis_' + i);
    p.position.set(Math.cos(a) * 0.36, 0.25, Math.sin(a) * 0.36); g.add(p);
  }
  const plancher = mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.06, 24), mat.boisClair, 'plancher');
  plancher.position.y = 0.53; g.add(plancher);
  const cuve = mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.8, 28), mat.banco, 'cuve_du_grenier');
  cuve.position.y = 0.96; g.add(cuve);
  const toit = mesh(new THREE.ConeGeometry(0.74, 0.6, 28), mat.chaume, 'toit_du_grenier');
  toit.position.y = 1.62; g.add(toit);
  const lien = mesh(new THREE.TorusGeometry(0.52, 0.02, 8, 28), mat.corde, 'lien');
  lien.rotation.x = Math.PI / 2; lien.position.y = 1.34; g.add(lien);
  return g;
}

/* ═══════════ 1. LA CASE ═══════════ */
export function buildCase() {
  const G = new THREE.Group(); G.name = 'la_case';
  const spots = {}; const spot = spotFactory(G, spots);
  const R_IN = 1.52, R_OUT = 1.74, WALL_H = 1.92, FLOOR_Y = 0.16, DOOR = -Math.PI / 2, DOOR_W = 0.3, DOOR_H = 1.32;

  const sol = mesh(new THREE.CylinderGeometry(3.9, 4.1, 0.12, 56), mat.terre, 'terrasse');
  sol.position.y = -0.06; G.add(sol);
  const soub = mesh(new THREE.CylinderGeometry(R_OUT + 0.1, R_OUT + 0.16, FLOOR_Y, 56), mat.bancoSombre, 'soubassement');
  soub.position.y = FLOOR_Y / 2; G.add(soub);
  const mur = ring(DOOR + DOOR_W, DOOR - DOOR_W + Math.PI * 2, R_IN, R_OUT, WALL_H, mat.banco, 'mur_banco');
  mur.position.y = FLOOR_Y; G.add(mur);
  const lint = ring(DOOR - DOOR_W, DOOR + DOOR_W, R_IN, R_OUT, WALL_H - DOOR_H, mat.banco, 'linteau');
  lint.position.y = FLOOR_Y + DOOR_H; G.add(lint);
  const cour = mesh(new THREE.TorusGeometry((R_IN + R_OUT) / 2, (R_OUT - R_IN) / 2, 10, 56), mat.banco, 'couronne_mur');
  cour.rotation.x = Math.PI / 2; cour.position.y = FLOOR_Y + WALL_H; G.add(cour);
  for (let i = 0; i < 12; i++) {
    const a = i * (Math.PI / 6) + 0.26;
    if (Math.abs(Math.atan2(Math.sin(a - DOOR), Math.cos(a - DOOR))) < DOOR_W + 0.12) continue;
    const p = mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.34, 10), mat.bois, 'poutre_' + i);
    p.rotation.z = Math.PI / 2; p.rotation.y = -a;
    p.position.set(Math.cos(a) * (R_OUT + 0.06), FLOOR_Y + WALL_H - 0.3, Math.sin(a) * (R_OUT + 0.06));
    G.add(p);
  }
  const seuil = mesh(new THREE.BoxGeometry(0.92, 0.1, 0.5), mat.bancoSombre, 'seuil');
  seuil.position.set(0, 0.05, R_OUT + 0.08); G.add(seuil);
  const solInt = mesh(new THREE.CylinderGeometry(R_IN, R_IN, 0.04, 56), mat.solBattu, 'sol_de_terre_battue');
  solInt.position.y = FLOOR_Y + 0.02; G.add(solInt);

  const toit = new THREE.Group(); toit.name = 'toit_de_chaume';
  const EAVE = FLOOR_Y + WALL_H - 0.12; let base = EAVE;
  [[2.12, 1.52, 0.8], [1.52, 0.86, 0.92], [0.86, 0.2, 1.02]].forEach(([rb, rt, h], i) => {
    const c = mesh(new THREE.CylinderGeometry(rt, rb, h, 48, 1, true), i === 1 ? mat.chaumeClair : mat.chaume, 'chaume_' + i);
    c.material.side = THREE.DoubleSide; c.position.y = base + h / 2; toit.add(c);
    const l = mesh(new THREE.TorusGeometry(rb * 0.99, 0.024, 8, 48), mat.corde, 'lien_' + i);
    l.rotation.x = Math.PI / 2; l.position.y = base + 0.05; toit.add(l);
    base += h - 0.05;
  });
  const faite = mesh(new THREE.ConeGeometry(0.21, 0.34, 32), mat.chaume, 'faite');
  faite.position.y = base + 0.22; toit.add(faite);
  const epi = mesh(new THREE.SphereGeometry(0.085, 14, 10), mat.terreCuite, 'epi_de_faitage');
  epi.position.y = base + 0.42; toit.add(epi);
  for (let i = 0; i < 60; i++) {
    const a = i * (Math.PI * 2 / 60);
    const b = mesh(new THREE.BoxGeometry(0.062, 0.2, 0.022), i % 2 ? mat.chaume : mat.chaumeClair, 'brin_' + i);
    b.position.set(Math.cos(a) * 2.13, EAVE - 0.07, Math.sin(a) * 2.13);
    b.rotation.set(0, -a, 0); b.rotateX(-0.5); toit.add(b);
  }
  G.add(toit); G.userData.toit = toit;

  const foyer = spot('foyer', 'le foyer aux trois pierres', -0.52, FLOOR_Y, -0.34);
  const cendres = mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.04, 28), mat.cendre, 'cendres');
  cendres.position.y = 0.03; foyer.add(cendres);
  for (let i = 0; i < 3; i++) {
    const a = i * (Math.PI * 2 / 3) + 0.4;
    const p = mesh(new THREE.SphereGeometry(0.13, 14, 10), mat.pierre, 'pierre_du_foyer_' + i);
    p.position.set(Math.cos(a) * 0.27, 0.09, Math.sin(a) * 0.27); p.scale.set(1, 0.85, 1.15); foyer.add(p);
  }
  const marmite = lathe([[0.02, 0], [0.13, 0.02], [0.2, 0.1], [0.21, 0.2], [0.16, 0.28], [0.18, 0.31]], mat.terreCuite, 'marmite');
  marmite.position.y = 0.19; foyer.add(marmite);
  const braises = mesh(new THREE.SphereGeometry(0.17, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat.braise, 'braises');
  braises.scale.y = 0.3; braises.position.y = 0.05; braises.visible = false; foyer.add(braises);
  for (let i = 0; i < 4; i++) {
    const b = mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.34, 8), mat.bois, 'buche_' + i);
    b.position.set(-0.05 + i * 0.04, 0.05, 0); b.rotation.set(0, i * 0.7, Math.PI / 2 - 0.1); foyer.add(b);
  }

  const mortier = spot('mortier', 'le mortier et son pilon', 0.86, FLOOR_Y, -0.22);
  mortier.add(lathe([[0.02, 0], [0.14, 0.01], [0.1, 0.12], [0.115, 0.34], [0.175, 0.5], [0.18, 0.53], [0.135, 0.5], [0.12, 0.28]], mat.bois, 'mortier_de_bois'));
  const pilon = mesh(new THREE.CylinderGeometry(0.036, 0.045, 0.98, 12), mat.boisClair, 'pilon');
  pilon.position.set(0.16, 0.5, 0.12); pilon.rotation.set(0.34, 0, 0.42); mortier.add(pilon);

  const jarres = spot('jarre', 'les canaris de terre cuite', -1.02, FLOOR_Y, 0.62);
  jarres.add(jarre(1));
  const j2 = jarre(0.74); j2.position.set(-0.34, 0, -0.3); jarres.add(j2);

  const dj = spot('djembe', 'le djembé du griot', 0.92, FLOOR_Y, 0.72);
  dj.add(djembeBois());

  const masque = spot('masque', 'le masque des ancêtres', 0.12, FLOOR_Y + 1.18, -1.42, 0.3);
  masque.userData.halo.rotation.x = 0; masque.userData.halo.position.set(0, 0, 0.14);
  const face = mesh(new THREE.SphereGeometry(0.2, 24, 18), mat.masque, 'face_du_masque');
  face.scale.set(0.82, 1.5, 0.42); masque.add(face);
  for (const s of [-1, 1]) {
    const o = mesh(new THREE.SphereGeometry(0.032, 10, 8), mat.ombre, 'oeil');
    o.position.set(s * 0.072, 0.07, 0.075); o.scale.z = 0.5; masque.add(o);
    const c = mesh(new THREE.ConeGeometry(0.028, 0.2, 10), mat.masque, 'corne');
    c.position.set(s * 0.1, 0.31, 0.01); c.rotation.z = -s * 0.3; masque.add(c);
  }
  const nez = mesh(new THREE.BoxGeometry(0.045, 0.19, 0.07), mat.masque, 'nez');
  nez.position.set(0, -0.01, 0.08); masque.add(nez);

  const tab = spot('tabouret', 'le tabouret sculpté', -0.62, FLOOR_Y, 0.98);
  tab.add(tabouretBois());

  const aw = spot('awale', 'le jeu d’awalé', 0.18, FLOOR_Y + 0.04, 1.02, 0.36);
  const plateau = mesh(new THREE.BoxGeometry(0.52, 0.07, 0.2), mat.boisClair, 'plateau_awale');
  plateau.position.y = 0.035; aw.add(plateau);
  for (let i = 0; i < 12; i++) {
    const c = mesh(new THREE.SphereGeometry(0.032, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat.ombre, 'godet_' + i);
    c.position.set(-0.21 + (i % 6) * 0.084, 0.069, i < 6 ? -0.045 : 0.045); c.scale.y = 0.5; aw.add(c);
  }

  const nat = spot('natte', 'la natte roulée', 1.02, FLOOR_Y + 0.12, -0.86, 0.36);
  const rouleau = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.94, 20), mat.natte, 'natte_roulee');
  rouleau.rotation.set(0, 0.5, Math.PI / 2); nat.add(rouleau);

  const cal = spot('calebasse', 'les calebasses', -1.24, FLOOR_Y, -0.58);
  [[0, 0, 0.17], [0.28, 0.16, 0.13]].forEach(([x, z, r]) => {
    const c = lathe([[0.02, 0], [r * 0.8, 0.02], [r, r * 0.55], [r * 0.86, r * 0.95], [r * 0.9, r]], mat.calebasse, 'calebasse');
    c.position.set(x, 0, z); cal.add(c);
  });

  // trésor sous le foyer
  const tresor = new THREE.Group(); tresor.name = 'tresor'; tresor.visible = false;
  tresor.position.set(-0.52, FLOOR_Y, -0.34);
  const fosse = mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.26, 28, 1, true), mat.ombre, 'fosse');
  fosse.material.side = THREE.DoubleSide; fosse.position.y = -0.1; tresor.add(fosse);
  const pot = lathe([[0.02, 0], [0.13, 0.02], [0.2, 0.11], [0.21, 0.22], [0.15, 0.3], [0.16, 0.33]], mat.terreCuite, 'jarre_au_tresor');
  pot.position.y = -0.2; tresor.add(pot);
  const tas = mesh(new THREE.SphereGeometry(0.15, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat.or, 'poudre_dor');
  tas.position.y = 0.09; tas.scale.y = 0.45; tresor.add(tas);
  for (let i = 0; i < 18; i++) {
    const a = i * 1.7, r = 0.05 + (i % 5) * 0.032;
    const c = mesh(new THREE.SphereGeometry(0.028, 10, 8), i % 3 ? mat.cauri : mat.or, 'cauri_' + i);
    c.position.set(Math.cos(a) * r, 0.1 + (i % 3) * 0.018, Math.sin(a) * r);
    c.scale.set(1, 0.55, 0.72); tresor.add(c);
  }
  G.add(tresor);
  G.userData.tresor = tresor; G.userData.cendres = cendres; G.userData.marmite = marmite;
  G.userData.braises = braises;
  G.userData.foyerPos = [-0.52, FLOOR_Y, -0.34];
  G.userData.solY = FLOOR_Y;

  return { group: G, spots, cam: { pos: [1.5, 5.9, 2.6], target: [0, 0.3, 0] }, nabaStart: [0.2, FLOOR_Y, 1.12] };
}

/* ═══════════ 2. LE CHAMP DE MIL ═══════════ */
export function buildChamp() {
  const G = new THREE.Group(); G.name = 'le_champ_de_mil';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(6.2, 6.4, 0.12, 56), mat.terre, 'terre_du_champ');
  sol.position.y = -0.06; G.add(sol);
  for (let i = 0; i < 5; i++) {
    const s = mesh(new THREE.BoxGeometry(9, 0.03, 0.5), mat.solBattu, 'sillon_' + i);
    s.position.set(0, 0.01, -2 + i); G.add(s);
  }
  function tige(mur) {
    const g = new THREE.Group();
    const t = mesh(new THREE.CylinderGeometry(0.028, 0.038, 1.5, 8), mat.milVert, 'tige');
    t.position.y = 0.75; g.add(t);
    for (let i = 0; i < 4; i++) {
      const f = mesh(new THREE.BoxGeometry(0.02, 0.5, 0.09), mat.milVert, 'feuille_' + i);
      f.position.set(0, 0.45 + i * 0.28, 0);
      f.rotation.set(0.5, i * 1.7, 0.55 * (i % 2 ? 1 : -1)); g.add(f);
    }
    const e = mesh(new THREE.CapsuleGeometry(0.055, 0.3, 6, 12), mur ? mat.milMur : mat.milVert, 'epi');
    e.position.y = 1.7; g.add(e);
    if (mur) { const b = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8), mat.corde, 'lien_epi'); b.position.y = 1.52; g.add(b); }
    return g;
  }
  // 7 épis mûrs (dorés) — les autres verts
  const MURS = 7;
  const murs = spot('epis_murs', 'les épis mûrs', 0, 0, 0, 0.01);
  murs.userData.halo.visible = false;
  let placed = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const x = -3.6 + c * 1.2 + (r % 2) * 0.3, z = -2 + r;
      const mur = placed < MURS && (r * 7 + c) % 5 === 1;
      if (mur) placed++;
      const t = tige(mur);
      t.position.set(x, 0.02, z);
      t.rotation.y = Math.random() * 3;
      (mur ? murs : G).add(t);
    }
  }
  G.userData.nbEpisMurs = placed;

  const herbe = spot('mauvaise_herbe', 'la mauvaise herbe', -1.15, 0.02, 1.85, 0.42);
  for (let i = 0; i < 9; i++) {
    const b = mesh(new THREE.BoxGeometry(0.02, 0.42, 0.05), mat.herbe, 'brin_' + i);
    b.position.set((Math.random() - 0.5) * 0.35, 0.21, (Math.random() - 0.5) * 0.35);
    b.rotation.set((Math.random() - 0.5) * 0.7, Math.random() * 3, (Math.random() - 0.5) * 0.7); herbe.add(b);
  }
  const houe = spot('houe', 'la houe (daba)', 2.5, 0.02, 2.1, 0.4);
  const manche = mesh(new THREE.CylinderGeometry(0.028, 0.032, 1.15, 10), mat.boisClair, 'manche');
  manche.position.set(0, 0.5, 0); manche.rotation.z = 0.42; houe.add(manche);
  const lame = mesh(new THREE.BoxGeometry(0.22, 0.16, 0.02), mat.pierre, 'lame_de_fer');
  lame.position.set(-0.25, 0.06, 0); lame.rotation.z = 0.5; houe.add(lame);

  const eau = spot('gourde', 'la calebasse d’eau', 3.3, 0.02, 0.7, 0.36);
  eau.add(lathe([[0.02, 0], [0.16, 0.03], [0.2, 0.16], [0.15, 0.28], [0.06, 0.32], [0.07, 0.4]], mat.calebasse, 'gourde'));

  const panier = spot('panier', 'le panier de récolte', -3.2, 0.02, 1.9, 0.42);
  const p = lathe([[0.02, 0], [0.26, 0.02], [0.3, 0.24], [0.32, 0.34], [0.29, 0.35], [0.27, 0.06]], mat.natte, 'panier');
  panier.add(p);
  for (let i = 0; i < 5; i++) {
    const e = mesh(new THREE.CapsuleGeometry(0.05, 0.26, 6, 10), mat.milMur, 'epi_recolte_' + i);
    e.position.set((Math.random() - 0.5) * 0.24, 0.36, (Math.random() - 0.5) * 0.2);
    e.rotation.set(Math.random(), Math.random() * 3, Math.random() * 1.2); panier.add(e);
  }

  // 3 tisserins voleurs
  const ois = spot('oiseaux', 'les tisserins voleurs', 0, 0, 0, 0.01);
  ois.userData.halo.visible = false;
  [[-2.3, 1.75, -1.1], [1.1, 1.8, -0.1], [2.2, 1.7, 1.05]].forEach(([x, y, z], i) => {
    const o = oiseau({ corps: mat.milMur, taille: 0.55, nom: 'tisserin_' + i });
    o.position.set(x, y, z); o.rotation.y = i * 2; ois.add(o);
  });
  G.userData.nbOiseaux = 3;

  const b1 = buisson(0.7); b1.position.set(-4.6, 0.02, -1.5); G.add(b1);
  const a1 = arbre(2.6, 0.14, 4); a1.position.set(4.6, 0.02, -2.2); G.add(a1);
  for (let i = 0; i < 4; i++) {
    const pa = papillon(i % 2 ? mat.or : mat.tissuOcre);
    pa.position.set(-2 + i * 1.4, 1.1 + (i % 2) * 0.4, 2.4); pa.rotation.y = i; G.add(pa);
  }
  return { group: G, spots, cam: { pos: [0.4, 6.0, 8.0], target: [0, 0.6, 0] }, nabaStart: [0, 0.02, 3.1] };
}

/* ═══════════ 3. L'ENCLOS DES ANIMAUX ═══════════ */
export function buildEnclos() {
  const G = new THREE.Group(); G.name = 'l_enclos';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(5.6, 5.8, 0.12, 56), mat.sable, 'sol_de_l_enclos');
  sol.position.y = -0.06; G.add(sol);
  const R = 3.6;
  for (let i = 0; i < 34; i++) {
    const a = i * (Math.PI * 2 / 34);
    if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.24) continue;
    const p = mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.05, 8), mat.bois, 'piquet_' + i);
    p.position.set(Math.cos(a) * R, 0.5, Math.sin(a) * R);
    p.rotation.z = (Math.random() - 0.5) * 0.1; G.add(p);
  }
  [0.4, 0.78].forEach((y, i) => {
    const t = mesh(new THREE.TorusGeometry(R, 0.022, 6, 60), mat.boisClair, 'traverse_' + i);
    t.rotation.x = Math.PI / 2; t.position.y = y; G.add(t);
  });

  const abreuvoir = spot('abreuvoir', 'l’abreuvoir', -2.1, 0.02, 1.5, 0.5);
  const cuve = lathe([[0.02, 0], [0.42, 0.02], [0.45, 0.24], [0.42, 0.26], [0.4, 0.05]], mat.terreCuite, 'cuve');
  abreuvoir.add(cuve);
  const surface = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 24), mat.eau, 'eau');
  surface.position.y = 0.2; abreuvoir.add(surface);

  const paille = spot('paille', 'le tas de paille', 2.3, 0.02, 1.4, 0.62);
  for (let i = 0; i < 26; i++) {
    const b = mesh(new THREE.BoxGeometry(0.07, 0.55, 0.03), i % 2 ? mat.chaume : mat.chaumeClair, 'botte_' + i);
    b.position.set((Math.random() - 0.5) * 0.7, 0.24 + Math.random() * 0.12, (Math.random() - 0.5) * 0.7);
    b.rotation.set(Math.random() * 1.4 - 0.7, Math.random() * 3, Math.random() * 1.4 - 0.7); paille.add(b);
  }
  const gren = spot('grenier', 'le petit grenier', -1.9, 0.02, -1.9, 0.7);
  gren.add(grenierSurPilotis());
  const buis = spot('buisson', 'le buisson épineux', 1.75, 0.02, -1.65, 0.62);
  buis.add(buisson(1.05));
  const arb = spot('arbre', 'l’arbre à l’ombre', 0.1, 0.02, -2.7, 0.6);
  arb.add(arbre(2.9, 0.16, 5));

  const chevre1 = spot('chevre', 'les chèvres', -0.7, 0.02, 0.5, 0.55);
  const c1 = quadrupede({ corps: mat.poil, cornes: 1, oreilles: 'tombantes', nom: 'chevre_1', longueur: 0.42, hauteur: 0.38, epaisseur: 0.2 });
  chevre1.add(c1);
  const c2 = quadrupede({ corps: mat.poilBrun, cornes: 1, oreilles: 'tombantes', nom: 'chevre_2', longueur: 0.4, hauteur: 0.34, epaisseur: 0.19 });
  c2.position.set(0.62, 0, -0.34); c2.rotation.y = 1.1; chevre1.add(c2);

  const zebu = spot('zebu', 'le zébu', 1.5, 0.02, 0.3, 0.75);
  const z = quadrupede({ corps: mat.poilGris, cornes: 1, bosse: true, oreilles: 'courtes', queue: 'longue', nom: 'zebu', longueur: 0.78, hauteur: 0.62, epaisseur: 0.34 });
  z.rotation.y = -0.5; zebu.add(z);

  const ane = spot('ane', 'l’âne', -2.5, 0.02, -0.5, 0.62);
  const a = quadrupede({ corps: mat.poilGris, oreilles: 'longues', criniere: true, queue: 'longue', nom: 'ane', longueur: 0.6, hauteur: 0.55, epaisseur: 0.26 });
  a.rotation.y = 0.7; ane.add(a);

  const chien = spot('chien', 'le chien du village', 0.9, 0.02, 1.9, 0.45);
  const ch = quadrupede({ corps: mat.poilBrun, oreilles: 'tombantes', nom: 'chien', longueur: 0.34, hauteur: 0.3, epaisseur: 0.16 });
  ch.rotation.y = -1.4; chien.add(ch);

  const poules = spot('poules', 'les poules et les poussins', -0.2, 0.02, 2.4, 0.55);
  [[0, 0, 1, true], [0.5, 0.25, 0.95, false], [-0.45, 0.3, 0.9, false]].forEach(([x, z, t, cr], i) => {
    const o = oiseau({ corps: i ? mat.plume : mat.plumeRousse, taille: t, crete: cr, nom: 'poule_' + i });
    o.position.set(x, 0, z); o.rotation.y = i * 2.1; poules.add(o);
  });
  for (let i = 0; i < 4; i++) {
    const p = oiseau({ corps: mat.milMur, taille: 0.42, nom: 'poussin_' + i, queueHaute: false });
    p.position.set(-0.3 + i * 0.24, 0, 0.62 + (i % 2) * 0.16); p.rotation.y = i; poules.add(p);
  }
  const pintades = spot('pintades', 'les pintades', 2.6, 0.02, -0.8, 0.5);
  [[0, 0], [0.42, 0.3]].forEach(([x, z], i) => {
    const o = oiseau({ corps: mat.plumePintade, taille: 0.85, huppe: true, nom: 'pintade_' + i, queueHaute: false });
    o.position.set(x, 0, z); o.rotation.y = 1 + i; pintades.add(o);
  });

  // le chevreau qui se cache (placé par le jeu)
  const chevreau = quadrupede({ corps: mat.poil, cornes: 0, oreilles: 'tombantes', nom: 'chevreau', longueur: 0.24, hauteur: 0.24, epaisseur: 0.13 });
  chevreau.visible = false; G.add(chevreau);
  G.userData.chevreau = chevreau;
  G.userData.cachettes = ['paille', 'grenier', 'buisson', 'arbre', 'abreuvoir'];

  return { group: G, spots, cam: { pos: [0.4, 4.4, 8.0], target: [0, 0.6, 0] }, nabaStart: [0, 0.02, 3.0] };
}

/* ═══════════ 4. L'ARBRE À PALABRES ═══════════ */
export function buildBaobab() {
  const G = new THREE.Group(); G.name = 'l_arbre_a_palabres';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(6, 6.2, 0.12, 56), mat.terre, 'place_du_village');
  sol.position.y = -0.06; G.add(sol);
  const cercle = mesh(new THREE.TorusGeometry(2.6, 0.03, 6, 64), mat.sable, 'cercle_de_palabre');
  cercle.rotation.x = Math.PI / 2; cercle.position.y = 0.03; G.add(cercle);

  const tronc = lathe([[0.9, 0], [1.05, 0.4], [0.98, 1.4], [0.8, 2.4], [0.62, 3.2], [0.5, 3.7], [0.3, 4.0]], mat.ecorce, 'tronc_du_baobab', 40);
  G.add(tronc);
  const dirs = [[1, 0.55, 0.35], [-0.9, 0.6, 0.5], [0.3, 0.7, -1], [-0.6, 0.55, -0.85], [1, 0.62, -0.45]];
  const pied = new THREE.Vector3(0, 3.45, 0);
  dirs.forEach(([x, y, z], i) => {
    const d = new THREE.Vector3(x, y, z).normalize(), len = 2.0;
    const b = mesh(new THREE.CylinderGeometry(0.085, 0.2, len, 10), mat.ecorce, 'branche_' + i);
    b.position.copy(pied).add(d.clone().multiplyScalar(len / 2));
    b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    G.add(b);
    const f = mesh(new THREE.SphereGeometry(1.05, 18, 14), i % 2 ? mat.feuille : mat.feuilleSombre, 'feuillage_' + i);
    f.scale.set(1.22, 0.6, 1.22);
    f.position.copy(pied).add(d.clone().multiplyScalar(len * 1.02));
    G.add(f);
  });
  const haut = mesh(new THREE.SphereGeometry(1.3, 20, 14), mat.feuille, 'feuillage_central');
  haut.scale.set(1.18, 0.6, 1.18); haut.position.y = 4.9; G.add(haut);
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05;
    const f = mesh(new THREE.CapsuleGeometry(0.06, 0.2, 6, 10), mat.calebasse, 'fruit_de_baobab_' + i);
    f.position.set(Math.cos(a) * 1.5, 3.7 + (i % 3) * 0.3, Math.sin(a) * 1.5); G.add(f);
  }

  const baton = spot('baton', 'le bâton de parole', 1.15, 0.02, 1.85, 0.34);
  const bat = mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.25, 10), mat.masque, 'baton_de_parole');
  bat.position.y = 0.62; bat.rotation.z = 0.18; baton.add(bat);
  const tetebat = mesh(new THREE.SphereGeometry(0.075, 14, 12), mat.or, 'pommeau');
  tetebat.position.set(-0.12, 1.24, 0); baton.add(tetebat);

  const tabourets = spot('tabourets', 'les tabourets des anciens', 0, 0.02, 0, 0.01);
  tabourets.userData.halo.visible = false;
  const NB_TAB = 5;
  for (let i = 0; i < NB_TAB; i++) {
    const a = -0.6 + i * 0.72;
    const t = tabouretBois();
    t.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2);
    t.rotation.y = -a; tabourets.add(t);
  }
  G.userData.nbTabourets = NB_TAB;

  const nat = spot('natte', 'la natte des enfants', -1.9, 0.03, 1.4, 0.55);
  const n = mesh(new THREE.BoxGeometry(1.3, 0.04, 0.9), mat.natte, 'natte');
  n.rotation.y = 0.4; nat.add(n);

  const cal = spot('calebasse', 'la calebasse de bissap', 0.15, 0.02, 1.5, 0.36);
  cal.add(lathe([[0.02, 0], [0.2, 0.02], [0.24, 0.14], [0.19, 0.24], [0.2, 0.26]], mat.calebasse, 'calebasse_de_bissap'));

  const dj = spot('djembe', 'le djembé du griot', -1.3, 0.02, -1.6, 0.4);
  dj.add(djembeBois());

  const aw = spot('awale', 'le jeu d’awalé', 1.7, 0.06, -1.3, 0.4);
  const plateau = mesh(new THREE.BoxGeometry(0.52, 0.07, 0.2), mat.boisClair, 'plateau_awale');
  plateau.position.y = 0.035; aw.add(plateau);
  for (let i = 0; i < 12; i++) {
    const c = mesh(new THREE.SphereGeometry(0.032, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat.ombre, 'godet_' + i);
    c.position.set(-0.21 + (i % 6) * 0.084, 0.069, i < 6 ? -0.045 : 0.045); c.scale.y = 0.5; aw.add(c);
  }

  const kora = spot('kora', 'la kora', -2.4, 0.02, -0.4, 0.42);
  const caisse = mesh(new THREE.SphereGeometry(0.26, 18, 14), mat.calebasse, 'caisse_de_kora');
  caisse.scale.y = 0.8; caisse.position.y = 0.26; kora.add(caisse);
  const peauKora = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 20), mat.peau, 'peau_de_kora');
  peauKora.position.set(0, 0.42, 0.02); peauKora.rotation.x = 0.25; kora.add(peauKora);
  const manche = mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.25, 10), mat.bois, 'manche_de_kora');
  manche.position.set(0, 0.85, -0.1); manche.rotation.x = 0.25; kora.add(manche);
  for (let i = 0; i < 7; i++) {
    const c = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.95, 4), mat.cauri, 'corde_' + i);
    c.position.set(-0.06 + i * 0.02, 0.78, 0.05); c.rotation.x = 0.22; kora.add(c);
  }

  for (let i = 0; i < 3; i++) {
    const o = oiseau({ corps: mat.plumePintade, taille: 0.5, nom: 'tisserin_' + i });
    o.position.set(-1 + i * 1.1, 3.3 + (i % 2) * 0.3, 1.1 - i * 0.6); o.rotation.y = i * 2; G.add(o);
  }
  const b = buisson(0.8); b.position.set(-4.2, 0.02, 2.4); G.add(b);
  const b2 = buisson(0.65); b2.position.set(4.1, 0.02, 1.6); G.add(b2);

  return { group: G, spots, cam: { pos: [0.5, 4.6, 8.2], target: [0, 1.9, 0] }, nabaStart: [0.4, 0.02, 2.9] };
}

/* ═══ Naba ═══ */
export function buildNaba() {
  const g = new THREE.Group(); g.name = 'naba';
  const jambeG = new THREE.Group(), jambeD = new THREE.Group();
  [[-0.055, jambeG, 'g'], [0.055, jambeD, 'd']].forEach(([x, grp, s]) => {
    grp.position.set(x, 0.3, 0); g.add(grp);
    const l = mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.3, 10), mat.peauEnfant, 'jambe_' + s);
    l.position.y = -0.15; grp.add(l);
    const p = mesh(new THREE.SphereGeometry(0.05, 10, 8), mat.peauEnfant, 'pied_' + s);
    p.position.set(0, -0.3, 0.02); p.scale.set(1, 0.55, 1.3); grp.add(p);
  });
  const pagne = mesh(new THREE.CylinderGeometry(0.115, 0.14, 0.17, 18), mat.tissu, 'pagne');
  pagne.position.y = 0.37; g.add(pagne);
  const torse = mesh(new THREE.SphereGeometry(0.14, 20, 16), mat.peauEnfant, 'torse');
  torse.scale.set(1, 1.25, 0.8); torse.position.y = 0.55; g.add(torse);
  const brasG = new THREE.Group(), brasD = new THREE.Group();
  [[-0.14, brasG, 'g'], [0.14, brasD, 'd']].forEach(([x, grp, s]) => {
    grp.position.set(x, 0.66, 0); g.add(grp);
    const b = mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.29, 10), mat.peauEnfant, 'bras_' + s);
    b.position.y = -0.145; grp.add(b);
    const m = mesh(new THREE.SphereGeometry(0.04, 10, 8), mat.peauEnfant, 'main_' + s);
    m.position.y = -0.3; grp.add(m);
  });
  const cou = mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.06, 10), mat.peauEnfant, 'cou');
  cou.position.y = 0.73; g.add(cou);
  const tete = new THREE.Group(); tete.position.y = 0.85; g.add(tete);
  const crane = mesh(new THREE.SphereGeometry(0.115, 22, 16), mat.peauEnfant, 'tete');
  crane.scale.set(1, 1.06, 0.96); tete.add(crane);
  for (const s of [-1, 1]) {
    const b = mesh(new THREE.SphereGeometry(0.022, 10, 8), mat.cauri, 'blanc_oeil');
    b.position.set(s * 0.042, 0.015, 0.098); b.scale.z = 0.5; tete.add(b);
    const p = mesh(new THREE.SphereGeometry(0.011, 8, 6), mat.ombre, 'pupille');
    p.position.set(s * 0.045, 0.014, 0.112); tete.add(p);
    const o = mesh(new THREE.SphereGeometry(0.028, 10, 8), mat.peauEnfant, 'oreille');
    o.position.set(s * 0.112, 0.005, -0.005); o.scale.set(0.4, 1, 0.9); tete.add(o);
  }
  const touffe = mesh(new THREE.SphereGeometry(0.055, 12, 10), mat.ombre, 'touffe');
  touffe.position.set(0, 0.11, -0.01); touffe.scale.y = 0.8; tete.add(touffe);
  const collier = mesh(new THREE.TorusGeometry(0.058, 0.011, 8, 20), mat.cauri, 'collier_de_cauris');
  collier.rotation.x = Math.PI / 2 - 0.2; collier.position.y = 0.7; g.add(collier);
  return { group: g, jambeG, jambeD, brasG, brasD, tete };
}

/* ═══ animaux du second lot ═══ */
export function singe(taille = 1) {
  const g = new THREE.Group(); g.name = 'singe';
  const corps = mesh(new THREE.SphereGeometry(0.13 * taille, 16, 12), mat.poilBrun, 'singe_corps');
  corps.scale.set(0.85, 1.1, 0.8); corps.position.y = 0.3 * taille; g.add(corps);
  const tete = mesh(new THREE.SphereGeometry(0.085 * taille, 16, 12), mat.poilBrun, 'singe_tete');
  tete.position.y = 0.47 * taille; g.add(tete);
  const face = mesh(new THREE.SphereGeometry(0.05 * taille, 12, 10), mat.calebasse, 'singe_face');
  face.scale.set(1, 0.8, 0.6); face.position.set(0, 0.45 * taille, 0.065 * taille); g.add(face);
  for (const s of [-1, 1]) {
    const o = mesh(new THREE.SphereGeometry(0.03 * taille, 10, 8), mat.poilBrun, 'singe_oreille');
    o.scale.z = 0.4; o.position.set(s * 0.085 * taille, 0.48 * taille, 0); g.add(o);
    const oe = mesh(new THREE.SphereGeometry(0.011 * taille, 8, 6), mat.ombre, 'singe_oeil');
    oe.position.set(s * 0.026 * taille, 0.47 * taille, 0.095 * taille); g.add(oe);
    const b = mesh(new THREE.CylinderGeometry(0.02 * taille, 0.016 * taille, 0.2 * taille, 8), mat.poilBrun, 'singe_bras');
    b.position.set(s * 0.12 * taille, 0.3 * taille, 0); b.rotation.z = s * 0.4; g.add(b);
    const p = mesh(new THREE.CylinderGeometry(0.022 * taille, 0.018 * taille, 0.16 * taille, 8), mat.poilBrun, 'singe_jambe');
    p.position.set(s * 0.06 * taille, 0.1 * taille, 0); g.add(p);
  }
  const q = mesh(new THREE.TorusGeometry(0.1 * taille, 0.014 * taille, 6, 18, Math.PI * 1.2), mat.poilBrun, 'singe_queue');
  q.position.set(0, 0.26 * taille, -0.13 * taille); q.rotation.set(1.2, 0, 0.4); g.add(q);
  return g;
}
export function poisson(couleur = mat.pierre, taille = 1) {
  const g = new THREE.Group(); g.name = 'poisson';
  const c = mesh(new THREE.SphereGeometry(0.09 * taille, 14, 10), couleur, 'poisson_corps');
  c.scale.set(0.55, 0.9, 1.7); g.add(c);
  const q = mesh(new THREE.ConeGeometry(0.06 * taille, 0.1 * taille, 4), couleur, 'poisson_queue');
  q.rotation.x = -Math.PI / 2; q.position.z = -0.19 * taille; g.add(q);
  const d = mesh(new THREE.ConeGeometry(0.035 * taille, 0.08 * taille, 4), couleur, 'poisson_nageoire');
  d.position.y = 0.07 * taille; g.add(d);
  return g;
}
function gerbeDeMil(n = 12, h = 0.8) {
  const g = new THREE.Group(); g.name = 'gerbe_de_mil';
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 0.1;
    const t = mesh(new THREE.CylinderGeometry(0.012, 0.014, h, 6), mat.milMur, 'tige_' + i);
    t.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    t.rotation.set((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2); g.add(t);
    const e = mesh(new THREE.CapsuleGeometry(0.035, 0.16, 5, 8), mat.milMur, 'epi_' + i);
    e.position.set(Math.cos(a) * r * 1.3, h + 0.1, Math.sin(a) * r * 1.3); g.add(e);
  }
  const lien = mesh(new THREE.TorusGeometry(0.11, 0.014, 6, 18), mat.corde, 'lien');
  lien.rotation.x = Math.PI / 2; lien.position.y = h * 0.55; g.add(lien);
  return g;
}
function etal(x, z, rot, couleurAuvent) {
  const g = new THREE.Group(); g.name = 'etal';
  g.position.set(x, 0.02, z); g.rotation.y = rot;
  for (const [sx, sz] of [[-0.5, -0.32], [0.5, -0.32], [-0.5, 0.32], [0.5, 0.32]]) {
    const p = mesh(new THREE.CylinderGeometry(0.028, 0.032, 1.1, 8), mat.bois, 'poteau');
    p.position.set(sx, 0.55, sz); g.add(p);
  }
  const table = mesh(new THREE.BoxGeometry(1.15, 0.06, 0.72), mat.boisClair, 'table');
  table.position.y = 0.62; g.add(table);
  const auvent = mesh(new THREE.BoxGeometry(1.32, 0.04, 0.52), couleurAuvent, 'auvent');
  auvent.position.set(0, 1.12, -0.3); auvent.rotation.x = 0.16; g.add(auvent);
  const frange = mesh(new THREE.BoxGeometry(1.32, 0.11, 0.02), couleurAuvent, 'frange');
  frange.position.set(0, 1.1, -0.05); g.add(frange);
  return g;
}
function tas(parent, n, r, couleur, y = 0) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 7, d = Math.random() * r;
    const b = mesh(new THREE.SphereGeometry(r * 0.34, 10, 8), couleur, 'grain_' + i);
    b.position.set(Math.cos(a) * d, y + r * 0.22 + Math.random() * r * 0.2, Math.sin(a) * d);
    parent.add(b);
  }
}

/* ═══════════ 5. LE MARCHÉ ═══════════ */
export function buildMarche() {
  const G = new THREE.Group(); G.name = 'le_marche';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(5.8, 6, 0.12, 56), mat.sable, 'place_du_marche');
  sol.position.y = -0.06; G.add(sol);
  const rond = mesh(new THREE.TorusGeometry(3.1, 0.03, 6, 64), mat.terre, 'cercle_du_marche');
  rond.rotation.x = Math.PI / 2; rond.position.y = 0.03; G.add(rond);

  const places = [[-2.1, -1.2, 0.6], [0, -2.3, 0], [2.1, -1.2, -0.6], [2.1, 1.2, -2.5], [0, 2.3, Math.PI], [-2.1, 1.2, 2.5]];
  places.forEach(([x, z, rot], i) => G.add(etal(x, z, rot, i % 2 ? mat.tissuOcre : mat.tissu)));

  const mil = spot('mil', 'les mesures de mil', -2.1, 0.64, -1.2, 0.34);
  const cal1 = lathe([[0.02, 0], [0.18, 0.02], [0.2, 0.13], [0.17, 0.16]], mat.calebasse, 'mesure');
  mil.add(cal1); tas(mil, 14, 0.16, mat.milMur, 0.12);
  const sac = lathe([[0.02, 0], [0.18, 0.02], [0.2, 0.22], [0.12, 0.3], [0.14, 0.32]], mat.natte, 'sac_de_mil');
  sac.position.set(0.42, -0.62, 0.1); mil.add(sac);

  const arachide = spot('arachide', 'les arachides', 0, 0.64, -2.3, 0.34);
  const panier1 = lathe([[0.02, 0], [0.22, 0.02], [0.24, 0.14], [0.22, 0.15]], mat.natte, 'panier');
  arachide.add(panier1); tas(arachide, 18, 0.18, mat.calebasse, 0.1);

  const poisson_ = spot('poisson', 'les poissons séchés', 2.1, 0.64, -1.2, 0.34);
  for (let i = 0; i < 6; i++) {
    const p = poisson(mat.pierre, 0.8);
    p.position.set(-0.28 + (i % 3) * 0.28, 0.04 + Math.floor(i / 3) * 0.07, -0.1 + (i % 2) * 0.18);
    p.rotation.set(Math.PI / 2, i * 0.6, 0); poisson_.add(p);
  }

  const tissu = spot('tissu', 'les pagnes indigo', 2.1, 0.66, 1.2, 0.34);
  [0, 1, 2].forEach(i => {
    const t = mesh(new THREE.BoxGeometry(0.44, 0.07, 0.3), i % 2 ? mat.tissu : mat.tissuOcre, 'pagne_' + i);
    t.position.set(0, i * 0.075, 0); t.rotation.y = i * 0.12; tissu.add(t);
  });

  const cauris = spot('cauris', 'le tas de cauris', 0, 0.66, 2.3, 0.32);
  for (let i = 0; i < 16; i++) {
    const a = i * 1.7, r = 0.03 + (i % 4) * 0.03;
    const c = mesh(new THREE.SphereGeometry(0.028, 10, 8), mat.cauri, 'cauri_' + i);
    c.position.set(Math.cos(a) * r, 0.014 + (i % 3) * 0.014, Math.sin(a) * r);
    c.scale.set(1, 0.55, 0.72); cauris.add(c);
  }
  const bol = lathe([[0.02, 0], [0.14, 0.01], [0.16, 0.08], [0.14, 0.09]], mat.terreCuite, 'bol_a_cauris');
  bol.position.y = -0.02; cauris.add(bol);

  const calebasses = spot('calebasse', 'les calebasses à vendre', -2.1, 0.64, 1.2, 0.34);
  [[0, 0, 0.16], [0.3, 0.1, 0.13], [-0.3, -0.08, 0.12]].forEach(([x, z, r]) => {
    const c = lathe([[0.02, 0], [r * 0.8, 0.02], [r, r * 0.55], [r * 0.86, r * 0.95], [r * 0.9, r]], mat.calebasse, 'calebasse');
    c.position.set(x, 0, z); calebasses.add(c);
  });

  const a1 = arbre(3.2, 0.2, 5); a1.position.set(4.1, 0.02, 2.6); G.add(a1);
  const b1 = buisson(0.7); b1.position.set(-4.2, 0.02, 2.9); G.add(b1);
  [[3.2, -2.8], [-3.4, -2.4]].forEach(([x, z], i) => {
    const j = jarre(0.9); j.position.set(x, 0.02, z); G.add(j);
    const o = oiseau({ corps: mat.plumeRousse, taille: 0.7, crete: true, nom: 'poule_marche_' + i });
    o.position.set(x + 0.5, 0.02, z + 0.4); G.add(o);
  });
  return { group: G, spots, cam: { pos: [0.4, 4.8, 8.6], target: [0, 0.5, 0] }, nabaStart: [0, 0.02, 3.4] };
}

/* ═══════════ 6. LA FORÊT SACRÉE ═══════════ */
export function buildForet() {
  const G = new THREE.Group(); G.name = 'la_foret_sacree';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(6.4, 6.6, 0.12, 56), mat.solBattu, 'sol_de_la_foret');
  sol.position.y = -0.06; G.add(sol);
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * 7, r = Math.random() * 6;
    const f = mesh(new THREE.CircleGeometry(0.09 + Math.random() * 0.06, 6), i % 2 ? mat.feuille : mat.chaume, 'feuille_morte_' + i);
    f.rotation.x = -Math.PI / 2; f.position.set(Math.cos(a) * r, 0.011, Math.sin(a) * r); G.add(f);
  }
  [[-4.6, -3.2, 3.2, 6], [4.4, -3.4, 2.9, 5], [5.2, 1.6, 3.4, 6], [-5.2, 2.0, 2.8, 5],
   [-2.0, -5.2, 3.0, 5], [2.6, -5.2, 2.6, 4], [-3.4, 5.2, 2.9, 5]].forEach(([x, z, h, f]) => {
    const t = arbre(h, 0.2, f); t.position.set(x, 0.02, z); G.add(t);
  });

  const termitiere = spot('termitiere', 'la termitière', -1.9, 0.02, 1.2, 0.55);
  const cone = mesh(new THREE.ConeGeometry(0.5, 1.4, 18), mat.terre, 'termitiere');
  cone.position.y = 0.7; termitiere.add(cone);
  const cone2 = mesh(new THREE.ConeGeometry(0.26, 0.8, 14), mat.terre, 'cheminee');
  cone2.position.set(0.3, 0.4, 0.16); termitiere.add(cone2);

  const tronc = spot('tronc', 'le tronc creux', 1.7, 0.02, 1.6, 0.6);
  const bille = mesh(new THREE.CylinderGeometry(0.32, 0.34, 1.5, 20, 1, true), mat.bois, 'tronc_creux');
  bille.material.side = THREE.DoubleSide;
  bille.rotation.z = Math.PI / 2; bille.position.y = 0.34; tronc.add(bille);
  const noeud = mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 20), mat.boisClair, 'bord');
  noeud.rotation.y = Math.PI / 2; noeud.position.set(0.75, 0.34, 0); tronc.add(noeud);

  const rocher = spot('rocher', 'le grand rocher', -0.4, 0.02, -2.2, 0.62);
  const r1 = mesh(new THREE.SphereGeometry(0.6, 16, 12), mat.pierre, 'rocher');
  r1.scale.set(1, 0.7, 0.85); r1.position.y = 0.34; rocher.add(r1);
  const r2 = mesh(new THREE.SphereGeometry(0.34, 14, 10), mat.pierre, 'pierre');
  r2.scale.y = 0.7; r2.position.set(0.6, 0.18, 0.3); rocher.add(r2);

  const buis = spot('buisson', 'le buisson touffu', 2.4, 0.02, -1.2, 0.66);
  buis.add(buisson(1.15));

  const fougere = spot('fougere', 'les fougères', -2.6, 0.02, -0.9, 0.6);
  for (let i = 0; i < 16; i++) {
    const a = i * 0.9, r = 0.1 + (i % 4) * 0.12;
    const f = mesh(new THREE.BoxGeometry(0.035, 0.62, 0.1), i % 2 ? mat.feuille : mat.feuilleSombre, 'fronde_' + i);
    f.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
    f.rotation.set((Math.random() - 0.5) * 0.6, a, (Math.random() - 0.5) * 0.6); fougere.add(f);
  }

  [[-3.2, 0.9], [3.0, 0.4]].forEach(([x, z], i) => {
    const s = singe(1); s.position.set(x, 0.02, z); s.rotation.y = i * 2.2; G.add(s);
  });
  for (let i = 0; i < 5; i++) {
    const p = papillon(i % 2 ? mat.or : mat.tissuOcre);
    p.position.set(-2 + i * 1.1, 1.1 + (i % 3) * 0.35, 2.6 - (i % 2) * 0.8); p.rotation.y = i; G.add(p);
  }
  for (let i = 0; i < 3; i++) {
    const o = oiseau({ corps: mat.plumePintade, taille: 0.6, nom: 'oiseau_' + i });
    o.position.set(-1.6 + i * 1.7, 2.6 + (i % 2) * 0.4, -1.2 - (i % 2) * 0.6); o.rotation.y = i * 2; G.add(o);
  }
  const petit = singe(0.62); petit.visible = false; G.add(petit);
  G.userData.chevreau = petit;
  G.userData.cachettes = ['termitiere', 'tronc', 'buisson', 'rocher', 'fougere'];
  return { group: G, spots, cam: { pos: [0.4, 7.4, 9.6], target: [0, 0.5, 0] }, nabaStart: [0, 0.02, 3.6] };
}

/* ═══════════ 7. LA MARE ═══════════ */
export function buildMare() {
  const G = new THREE.Group(); G.name = 'la_mare';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(6.2, 6.4, 0.12, 56), mat.sable, 'berge');
  sol.position.y = -0.06; G.add(sol);
  const creux = mesh(new THREE.CylinderGeometry(3.3, 3.0, 0.16, 48), mat.solBattu, 'fond_de_la_mare');
  creux.position.y = -0.02; G.add(creux);
  const eau = mesh(new THREE.CylinderGeometry(3.24, 3.24, 0.04, 48), mat.eau, 'eau');
  eau.position.y = 0.06; G.add(eau);
  for (let i = 0; i < 3; i++) {
    const r = mesh(new THREE.TorusGeometry(1 + i * 0.75, 0.012, 6, 48), mat.calebasse, 'ride_' + i);
    r.rotation.x = Math.PI / 2; r.position.y = 0.085; r.material.transparent = true; G.add(r);
  }

  const poissons = spot('poissons', 'les poissons', 0, 0.11, 0, 0.01);
  poissons.userData.halo.visible = false;
  const NB_POISSONS = 5;
  [[-1.2, 0.5], [0.4, -0.9], [1.5, 0.7], [-0.6, -1.6], [1.9, -1.3]].forEach(([x, z], i) => {
    const p = poisson(i % 2 ? mat.plume : mat.calebasse, 1.3);
    p.position.set(x, 0, z); p.rotation.y = i * 1.3; poissons.add(p);
  });
  G.userData.nbPoissons = NB_POISSONS;

  const pirogues = spot('pirogue', 'les pirogues', 0, 0.02, 0, 0.01);
  pirogues.userData.halo.visible = false;
  const NB_PIROGUES = 2;
  [[-2.4, 2.0, 0.5], [2.6, 1.7, -0.6]].forEach(([x, z, rot], i) => {
    const p = new THREE.Group(); p.name = 'pirogue_' + i;
    const coque = mesh(new THREE.SphereGeometry(0.5, 18, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat.bois, 'coque');
    coque.scale.set(0.5, 0.6, 2.4); coque.position.y = 0.22; p.add(coque);
    const bord = mesh(new THREE.TorusGeometry(0.5, 0.035, 8, 26), mat.boisClair, 'bord');
    bord.rotation.x = Math.PI / 2; bord.scale.set(0.5, 2.4, 1); bord.position.y = 0.22; p.add(bord);
    const pagaie = mesh(new THREE.CylinderGeometry(0.022, 0.026, 1.2, 8), mat.boisClair, 'pagaie');
    pagaie.position.set(0.2, 0.4, 0.1); pagaie.rotation.set(0.4, 0, 0.5); p.add(pagaie);
    const pale = mesh(new THREE.BoxGeometry(0.13, 0.3, 0.02), mat.boisClair, 'pale');
    pale.position.set(0.48, 0.05, 0.34); pale.rotation.z = 0.5; p.add(pale);
    p.position.set(x, 0.02, z); p.rotation.y = rot; pirogues.add(p);
  });
  G.userData.nbPirogues = NB_PIROGUES;

  const filet = spot('filet', 'le filet de pêche', 1.4, 0.02, 3.2, 0.5);
  for (const s of [-1, 1]) {
    const p = mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.3, 8), mat.bois, 'perche');
    p.position.set(s * 0.55, 0.65, 0); p.rotation.z = s * 0.12; filet.add(p);
  }
  for (let i = 0; i < 7; i++) {
    const l = mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.1, 5), mat.corde, 'maille_h_' + i);
    l.rotation.z = Math.PI / 2; l.position.set(0, 0.35 + i * 0.13, 0); filet.add(l);
  }
  for (let i = 0; i < 8; i++) {
    const l = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.85, 5), mat.corde, 'maille_v_' + i);
    l.position.set(-0.5 + i * 0.14, 0.74, 0); filet.add(l);
  }

  const roseaux = spot('roseaux', 'les roseaux', -3.4, 0.02, -1.4, 0.6);
  for (let i = 0; i < 22; i++) {
    const a = i * 0.7, r = 0.1 + (i % 5) * 0.14;
    const t = mesh(new THREE.BoxGeometry(0.03, 0.9 + Math.random() * 0.5, 0.05), i % 2 ? mat.herbe : mat.feuille, 'roseau_' + i);
    t.position.set(Math.cos(a) * r, 0.5, Math.sin(a) * r);
    t.rotation.set((Math.random() - 0.5) * 0.4, a, (Math.random() - 0.5) * 0.4); roseaux.add(t);
  }

  const jarres = spot('jarre', 'les jarres à remplir', 2.9, 0.02, 2.6, 0.5);
  jarres.add(jarre(1));
  const j2 = jarre(0.8); j2.position.set(-0.4, 0, 0.3); jarres.add(j2);

  const oiseaux = spot('oiseaux', 'les oiseaux de la mare', 0, 0.02, 0, 0.01);
  oiseaux.userData.halo.visible = false;
  const NB_OISEAUX = 3;
  const petitHeron = oiseau({ corps: mat.plume, taille: 0.6, nom: 'petit_heron', queueHaute: false });
  petitHeron.visible = false; G.add(petitHeron);
  G.userData.chevreau = petitHeron;
  G.userData.cachettes = ['roseaux', 'pirogue', 'filet', 'jarre'];
  [[-2.9, -2.6], [3.3, -2.2], [-1.2, -3.4]].forEach(([x, z], i) => {
    const o = oiseau({ corps: i ? mat.plume : mat.plumePintade, taille: 1.1, huppe: i === 0, nom: 'heron_' + i, queueHaute: false });
    o.position.set(x, 0.02, z); o.rotation.y = i * 1.8; oiseaux.add(o);
  });
  G.userData.nbOiseaux = NB_OISEAUX;

  const a1 = arbre(3.4, 0.2, 5); a1.position.set(-4.4, 0.02, 2.4); G.add(a1);
  const b1 = buisson(0.8); b1.position.set(4.4, 0.02, -0.4); G.add(b1);
  for (let i = 0; i < 4; i++) {
    const p = papillon(i % 2 ? mat.or : mat.calebasse);
    p.position.set(-1.4 + i * 1.2, 0.9, 3.6); G.add(p);
  }
  return { group: G, spots, cam: { pos: [0.4, 5.2, 8.8], target: [0, 0.3, 0] }, nabaStart: [0, 0.02, 3.9] };
}

/* ═══════════ 8. LE GRENIER DU VILLAGE ═══════════ */
export function buildGrenier() {
  const G = new THREE.Group(); G.name = 'le_grenier_du_village';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(5.4, 5.6, 0.12, 56), mat.terre, 'aire_de_battage');
  sol.position.y = -0.06; G.add(sol);
  const aire = mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.03, 48), mat.solBattu, 'aire');
  aire.position.y = 0.015; G.add(aire);

  [[-2.6, -1.9, 1], [0.1, -2.9, 1.15], [2.7, -1.7, 0.95]].forEach(([x, z, s], i) => {
    const gr = grenierSurPilotis(); gr.position.set(x, 0.02, z); gr.scale.setScalar(s);
    gr.rotation.y = i * 0.7; G.add(gr);
  });

  const gerbes = spot('gerbes', 'les gerbes de mil', -1.5, 0.02, 0.9, 0.6);
  [[0, 0, 0], [0.34, 0.2, 0.4], [-0.3, 0.26, -0.3]].forEach(([x, z, rot], i) => {
    const g2 = gerbeDeMil(14, 0.8 + i * 0.05);
    g2.position.set(x, 0, z); g2.rotation.set(0.1, rot, 0.06); gerbes.add(g2);
  });

  const batte = spot('batte', 'les battes à grain', 1.4, 0.02, 1.1, 0.5);
  for (const s of [-1, 1]) {
    const b = mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.15, 8), mat.boisClair, 'batte');
    b.position.set(s * 0.14, 0.56, 0); b.rotation.set(0.1, 0, s * 0.14); batte.add(b);
  }
  const grain = mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.03, 24), mat.milMur, 'grain_battu');
  grain.position.set(0.1, 0.02, 0.4); batte.add(grain);

  const van = spot('van', 'le van à vanner', -0.2, 0.02, 2.1, 0.5);
  const plat = lathe([[0.02, 0], [0.4, 0.02], [0.46, 0.12], [0.44, 0.13]], mat.natte, 'van');
  plat.position.y = 0.3; plat.rotation.z = 0.3; van.add(plat);
  const trepied = mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.32, 8), mat.bois, 'support');
  trepied.position.y = 0.16; van.add(trepied);
  tas(van, 10, 0.18, mat.milMur, 0.32);

  const jarres = spot('jarre', 'la jarre du grenier', 2.4, 0.02, 0.4, 0.5);
  jarres.add(jarre(1.2));
  const couv = mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.04, 24), mat.terreCuite, 'couvercle');
  couv.position.y = 0.66; jarres.add(couv);

  const natte = mesh(new THREE.BoxGeometry(1.5, 0.03, 1.1), mat.natte, 'natte_de_sechage');
  natte.position.set(0.4, 0.03, -0.9); natte.rotation.y = 0.3; G.add(natte);
  tas(natte, 0, 0.1, mat.milMur);
  for (let i = 0; i < 16; i++) {
    const g2 = mesh(new THREE.SphereGeometry(0.03, 8, 6), mat.milMur, 'grain_' + i);
    g2.position.set(0.4 + (Math.random() - 0.5) * 1.2, 0.06, -0.9 + (Math.random() - 0.5) * 0.9);
    g2.scale.y = 0.6; G.add(g2);
  }
  const a1 = arbre(3, 0.18, 5); a1.position.set(4.2, 0.02, 2.2); G.add(a1);
  [[-3.8, 2.2], [3.6, -3.2]].forEach(([x, z], i) => {
    const o = oiseau({ corps: mat.plumeRousse, taille: 0.75, crete: i === 0, nom: 'poule_grenier_' + i });
    o.position.set(x, 0.02, z); G.add(o);
  });
  const ane = quadrupede({ corps: mat.poilGris, oreilles: 'longues', criniere: true, queue: 'longue', nom: 'ane', longueur: 0.6, hauteur: 0.55, epaisseur: 0.26 });
  ane.position.set(-3.4, 0.02, -0.8); ane.rotation.y = 1.2; G.add(ane);
  return { group: G, spots, cam: { pos: [0.4, 5.0, 8.2], target: [0, 0.7, 0] }, nabaStart: [0.2, 0.02, 3.3] };
}

/* ═══════════ 9. LA FORGE ═══════════ */
export function buildForge() {
  const G = new THREE.Group(); G.name = 'la_forge';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(4.8, 5, 0.12, 56), mat.sable, 'sol_de_la_forge');
  sol.position.y = -0.06; G.add(sol);
  const dalle = mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.04, 40), mat.solBattu, 'dalle');
  dalle.position.y = 0.02; G.add(dalle);

  // abri ouvert : quatre poteaux + toit de chaume
  for (const [x, z] of [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]]) {
    const p = mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.3, 10), mat.bois, 'poteau');
    p.position.set(x, 1.15, z); G.add(p);
  }
  const toit = mesh(new THREE.BoxGeometry(4.6, 0.12, 2.3), mat.chaume, 'toit_de_l_abri');
  toit.position.set(0, 2.3, -1.15); toit.rotation.x = -0.16; G.add(toit);
  for (let i = 0; i < 22; i++) {
    const b = mesh(new THREE.BoxGeometry(0.16, 0.05, 2.2), i % 2 ? mat.chaumeClair : mat.chaume, 'chaume_' + i);
    b.position.set(-2.2 + i * 0.21, 2.38, -1.15); b.rotation.x = -0.16; G.add(b);
  }
  const poutre = mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.9, 8), mat.bois, 'poutre_de_l_abri');
  poutre.rotation.z = Math.PI / 2; poutre.position.set(0, 2.05, -1.9); G.add(poutre);
  const planche = mesh(new THREE.BoxGeometry(3.8, 0.14, 0.06), mat.boisClair, 'planche_a_masque');
  planche.position.set(0, 1.52, -1.92); G.add(planche);

  const charbon = spot('charbon', 'le foyer de charbon', -0.9, 0.02, -0.7, 0.55);
  const cuve = lathe([[0.02, 0], [0.5, 0.02], [0.54, 0.34], [0.44, 0.38], [0.42, 0.1]], mat.terreCuite, 'foyer_de_forge');
  charbon.add(cuve);
  const braise = mesh(new THREE.SphereGeometry(0.38, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat.braise, 'braises');
  braise.scale.y = 0.3; braise.position.y = 0.3; charbon.add(braise);
  for (let i = 0; i < 9; i++) {
    const a = i * 0.8, r = Math.random() * 0.3;
    const c = mesh(new THREE.SphereGeometry(0.06, 8, 6), mat.ombre, 'charbon_' + i);
    c.position.set(Math.cos(a) * r, 0.34, Math.sin(a) * r); charbon.add(c);
  }

  const soufflet = spot('soufflet', 'le soufflet de peau', -1.9, 0.02, 0.5, 0.55);
  for (const s of [-1, 1]) {
    const sac = mesh(new THREE.SphereGeometry(0.26, 16, 12), mat.peau, 'outre');
    sac.scale.set(1, 0.8, 1.1); sac.position.set(0, 0.28, s * 0.3); soufflet.add(sac);
    const t = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.7, 10), mat.bois, 'tuyere');
    t.position.set(0.5, 0.2, s * 0.18); t.rotation.z = Math.PI / 2 - 0.12; soufflet.add(t);
    const b = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), mat.boisClair, 'bras_de_soufflet');
    b.position.set(-0.16, 0.55, s * 0.3); b.rotation.z = 0.4; soufflet.add(b);
  }

  const enclume = spot('enclume', 'l’enclume', 0.9, 0.02, 0.6, 0.5);
  const billot = mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.5, 16), mat.bois, 'billot');
  billot.position.y = 0.25; enclume.add(billot);
  const corps = mesh(new THREE.BoxGeometry(0.42, 0.16, 0.22), mat.pierre, 'enclume');
  corps.position.y = 0.58; enclume.add(corps);
  const corne = mesh(new THREE.ConeGeometry(0.09, 0.26, 12), mat.pierre, 'corne_de_l_enclume');
  corne.rotation.z = -Math.PI / 2; corne.position.set(0.32, 0.58, 0); enclume.add(corne);
  const bracelet = mesh(new THREE.TorusGeometry(0.11, 0.022, 10, 28), mat.or, 'bracelet_dor');
  bracelet.rotation.x = Math.PI / 2; bracelet.position.y = 0.69; bracelet.visible = false; enclume.add(bracelet);
  G.userData.recompense = bracelet;

  const marteau = spot('marteau', 'le marteau et les tenailles', 1.9, 0.02, -0.8, 0.5);
  const pierre2 = mesh(new THREE.SphereGeometry(0.3, 14, 10), mat.pierre, 'pierre_a_outils');
  pierre2.scale.set(1, 0.45, 0.9); pierre2.position.y = 0.12; marteau.add(pierre2);
  const manche = mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.5, 8), mat.boisClair, 'manche');
  manche.position.set(0, 0.26, 0.06); manche.rotation.z = Math.PI / 2 - 0.2; marteau.add(manche);
  const tete = mesh(new THREE.BoxGeometry(0.18, 0.09, 0.09), mat.pierre, 'tete_de_marteau');
  tete.position.set(0.26, 0.31, 0.06); marteau.add(tete);
  for (const s of [-1, 1]) {
    const t = mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.62, 8), mat.pierre, 'tenaille');
    t.position.set(-0.12, 0.24, s * 0.12); t.rotation.set(0, s * 0.16, Math.PI / 2 - 0.1); marteau.add(t);
  }

  const masque = spot('masque', 'le masque du forgeron', -0.1, 1.28, -1.84, 0.32);
  masque.userData.halo.rotation.x = 0; masque.userData.halo.position.set(0, 0, 0.14);
  const face = mesh(new THREE.SphereGeometry(0.22, 22, 16), mat.masque, 'face_du_masque');
  face.scale.set(0.8, 1.45, 0.4); masque.add(face);
  for (const s of [-1, 1]) {
    const o = mesh(new THREE.SphereGeometry(0.034, 10, 8), mat.ombre, 'oeil');
    o.position.set(s * 0.075, 0.06, 0.08); o.scale.z = 0.5; masque.add(o);
    const c = mesh(new THREE.ConeGeometry(0.03, 0.22, 10), mat.masque, 'corne');
    c.position.set(s * 0.1, 0.33, 0); c.rotation.z = -s * 0.3; masque.add(c);
  }
  const nez = mesh(new THREE.BoxGeometry(0.05, 0.2, 0.07), mat.masque, 'nez');
  nez.position.set(0, 0, 0.085); masque.add(nez);
  const cauris2 = mesh(new THREE.TorusGeometry(0.16, 0.014, 8, 24), mat.cauri, 'rang_de_cauris');
  cauris2.position.set(0, -0.24, 0.02); masque.add(cauris2);

  const fers = spot('fers', 'les barres de fer', 0.2, 0.02, 1.9, 0.5);
  for (let i = 0; i < 6; i++) {
    const b = mesh(new THREE.BoxGeometry(0.05, 0.05, 1.1), mat.pierre, 'barre_' + i);
    b.position.set(-0.14 + (i % 3) * 0.14, 0.04 + Math.floor(i / 3) * 0.06, 0);
    b.rotation.y = (i % 3) * 0.05; fers.add(b);
  }
  const seau = lathe([[0.02, 0], [0.18, 0.02], [0.2, 0.24], [0.18, 0.25]], mat.terreCuite, 'seau_a_tremper');
  seau.position.set(1.6, 0.02, 1.7); G.add(seau);
  const a1 = arbre(2.8, 0.16, 4); a1.position.set(-3.6, 0.02, 2.3); G.add(a1);
  const chien = quadrupede({ corps: mat.poilBrun, oreilles: 'tombantes', nom: 'chien', longueur: 0.34, hauteur: 0.3, epaisseur: 0.16 });
  chien.position.set(2.9, 0.02, 2.4); chien.rotation.y = -1.1; G.add(chien);
  G.userData.braises = braise;
  G.userData.foyerPos = [-0.9, 0.02, -0.7];
  return { group: G, spots, cam: { pos: [0.4, 4.6, 7.6], target: [0, 0.6, 0] }, nabaStart: [0, 0.02, 2.9] };
}

/* ═══════════ 10. L'ÉCOLE SOUS L'ARBRE ═══════════ */
export function buildEcole() {
  const G = new THREE.Group(); G.name = 'l_ecole_sous_l_arbre';
  const spots = {}; const spot = spotFactory(G, spots);
  const sol = mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.12, 56), mat.terre, 'cour_de_l_ecole');
  sol.position.y = -0.06; G.add(sol);
  const aire = mesh(new THREE.CylinderGeometry(2.9, 2.9, 0.03, 44), mat.solBattu, 'aire_balayee');
  aire.position.y = 0.015; G.add(aire);
  const grand = arbre(3.8, 0.24, 6); grand.position.set(-0.2, 0.02, -1.6); G.add(grand);

  const tableau = spot('tableau', 'le tableau noir', 0.1, 0.02, -0.5, 0.6);
  for (const s of [-1, 1]) {
    const p = mesh(new THREE.CylinderGeometry(0.05, 0.055, 1.5, 10), mat.bois, 'poteau');
    p.position.set(s * 0.72, 0.75, 0); tableau.add(p);
  }
  const ardoiseGeante = mesh(new THREE.BoxGeometry(1.5, 0.9, 0.06), mat.ombre, 'tableau_noir');
  ardoiseGeante.position.y = 1.0; tableau.add(ardoiseGeante);
  const cadre = mesh(new THREE.BoxGeometry(1.6, 1.0, 0.03), mat.boisClair, 'cadre');
  cadre.position.set(0, 1.0, -0.04); tableau.add(cadre);
  for (let i = 0; i < 3; i++) {
    const t = mesh(new THREE.BoxGeometry(0.5 + i * 0.16, 0.035, 0.01), mat.cauri, 'trait_de_craie_' + i);
    t.position.set(-0.2 + i * 0.05, 1.24 - i * 0.22, 0.035); tableau.add(t);
  }

  const bancs = spot('bancs', 'les bancs', 0, 0.02, 1.1, 0.01);
  bancs.userData.halo.visible = false;
  const NB_BANCS = 3;
  for (let i = 0; i < NB_BANCS; i++) {
    const b = new THREE.Group();
    const p = mesh(new THREE.BoxGeometry(1.6, 0.08, 0.3), mat.boisClair, 'planche_' + i);
    p.position.y = 0.3; b.add(p);
    for (const s of [-1, 1]) {
      const l = mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.3, 8), mat.bois, 'pied');
      l.position.set(s * 0.65, 0.15, 0); b.add(l);
    }
    b.position.set(0, 0, i * 0.7); b.rotation.y = (i - 1) * 0.06; bancs.add(b);
  }
  G.userData.nbBancs = NB_BANCS;

  const ardoises = spot('ardoises', 'les ardoises', -1.9, 0.02, 0.9, 0.44);
  for (let i = 0; i < 4; i++) {
    const a = mesh(new THREE.BoxGeometry(0.34, 0.03, 0.24), mat.ombre, 'ardoise_' + i);
    a.position.set(0, 0.03 + i * 0.035, 0); a.rotation.y = i * 0.12; ardoises.add(a);
  }
  const craie = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 8), mat.cauri, 'craie');
  craie.rotation.z = Math.PI / 2; craie.position.set(0.26, 0.04, 0.1); ardoises.add(craie);

  const livres = spot('livres', 'les cahiers', 1.9, 0.02, 0.8, 0.42);
  [mat.tissuOcre, mat.tissu, mat.terreCuite].forEach((m, i) => {
    const l = mesh(new THREE.BoxGeometry(0.3, 0.045, 0.22), m, 'cahier_' + i);
    l.position.set(0, 0.05 + i * 0.05, 0); l.rotation.y = i * 0.16; livres.add(l);
  });

  const cartable = spot('cartable', 'le cartable de paille', -1.4, 0.02, 2.2, 0.42);
  const sacEcole = lathe([[0.02, 0], [0.2, 0.02], [0.22, 0.26], [0.16, 0.3], [0.18, 0.32]], mat.natte, 'cartable');
  cartable.add(sacEcole);
  const bandouliere = mesh(new THREE.TorusGeometry(0.16, 0.014, 8, 20), mat.corde, 'bandouliere');
  bandouliere.rotation.y = Math.PI / 2; bandouliere.position.y = 0.38; cartable.add(bandouliere);

  const cloche = spot('cloche', 'la cloche de l’école', 1.6, 0.02, -1.9, 0.36);
  const perche = mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.8, 10), mat.bois, 'perche');
  perche.position.y = 0.9; cloche.add(perche);
  const bras = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), mat.bois, 'bras');
  bras.rotation.z = Math.PI / 2; bras.position.set(0.22, 1.74, 0); cloche.add(bras);
  const corpsCloche = mesh(new THREE.ConeGeometry(0.13, 0.24, 16), mat.pierre, 'cloche');
  corpsCloche.position.set(0.42, 1.56, 0); cloche.add(corpsCloche);
  const battant = mesh(new THREE.SphereGeometry(0.035, 10, 8), mat.ombre, 'battant');
  battant.position.set(0.42, 1.44, 0); cloche.add(battant);

  const calebasse = spot('calebasse', 'la calebasse d’eau', -2.4, 0.02, -0.6, 0.42);
  calebasse.add(lathe([[0.02, 0], [0.2, 0.03], [0.24, 0.18], [0.18, 0.3], [0.2, 0.32]], mat.calebasse, 'calebasse_d_eau'));
  const gobelet = lathe([[0.02, 0], [0.08, 0.01], [0.09, 0.1], [0.08, 0.11]], mat.calebasse, 'gobelet');
  gobelet.position.set(0.32, 0, 0.16); calebasse.add(gobelet);

  const natte = mesh(new THREE.BoxGeometry(1.6, 0.03, 1.0), mat.natte, 'natte_des_petits');
  natte.position.set(2.2, 0.03, 1.8); natte.rotation.y = -0.3; G.add(natte);
  for (let i = 0; i < 3; i++) {
    const o = oiseau({ corps: i ? mat.plumeRousse : mat.plumePintade, taille: 0.62, nom: 'oiseau_' + i });
    o.position.set(-2.6 + i * 0.9, 2.4 + (i % 2) * 0.4, -2.4); o.rotation.y = i * 2; G.add(o);
  }
  const chevreEcole = quadrupede({ corps: mat.poil, cornes: 1, oreilles: 'tombantes', nom: 'chevre', longueur: 0.4, hauteur: 0.34, epaisseur: 0.19 });
  chevreEcole.position.set(3.6, 0.02, -1.4); chevreEcole.rotation.y = -0.8; G.add(chevreEcole);
  const bEcole = buisson(0.7); bEcole.position.set(-3.9, 0.02, 2.6); G.add(bEcole);
  return { group: G, spots, cam: { pos: [0.4, 4.8, 8.0], target: [0, 0.8, 0] }, nabaStart: [0.2, 0.02, 3.1] };
}

export const LIEUX = {
  case: { nom: 'La case de Karfa', build: buildCase },
  champ: { nom: 'Le champ de mil', build: buildChamp },
  enclos: { nom: 'L’enclos des animaux', build: buildEnclos },
  baobab: { nom: 'L’arbre à palabres', build: buildBaobab },
  marche: { nom: 'Le marché', build: buildMarche },
  foret: { nom: 'La forêt sacrée', build: buildForet },
  mare: { nom: 'La mare et le fleuve', build: buildMare },
  grenier: { nom: 'Le grenier du village', build: buildGrenier },
  forge: { nom: 'La forge', build: buildForge },
  ecole: { nom: 'L’école sous l’arbre', build: buildEcole },
};
