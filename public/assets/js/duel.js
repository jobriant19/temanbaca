/* Duel Tambang — arena 3D (Three.js r128 global) + soal + podium.
   Pengaturan datang dari popup di beranda (duel-dialog.js) lewat sessionStorage 'duel'.
   Bank soal: HURUF & GAMBAR (kata = nama gambar). Jarak tarik: D (garis menang di x = ±D). Warna/tim: TIM. */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const cfg = (() => { try { return JSON.parse(sessionStorage.getItem('duel')); } catch { return null; } })();
  const beranda = $('#duel').dataset.beranda;
  if (!cfg?.pemain?.length) { location.replace(beranda); return; } // dibuka langsung tanpa popup → kembali ke beranda

  const acak = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }; // Fisher-Yates: posisi jawaban benar merata
  const HURUF = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  const GAMBAR = {
    kucing: "<path d=\"M12 28 14 8l15 11zM52 28 50 8 35 19z\" fill=\"#f6a94d\"/><path d=\"M16 24l1.5-9 7 5zM48 24l-1.5-9-7 5z\" fill=\"#ff9db5\"/><circle cx=\"32\" cy=\"37\" r=\"22\" fill=\"#f6a94d\"/><path d=\"M28 17v6M32 16v7M36 17v6\" stroke=\"#d9822b\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><ellipse cx=\"23.5\" cy=\"35\" rx=\"3.2\" ry=\"4.4\" fill=\"#2b1d38\"/><ellipse cx=\"40.5\" cy=\"35\" rx=\"3.2\" ry=\"4.4\" fill=\"#2b1d38\"/><circle cx=\"24.6\" cy=\"33.4\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"41.6\" cy=\"33.4\" r=\"1.2\" fill=\"#fff\"/><path d=\"M29 43h6l-3 3.6z\" fill=\"#ff6f91\"/><path d=\"M32 46.6v2.4m0 0q-3 3-6.5 1.4M32 49q3 3 6.5 1.4M8 41h11M9 47l10-3M56 41H45M55 47l-10-3\" stroke=\"#2b1d38\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"/>",
    ikan: "<path d=\"M44 32 61 18v28z\" fill=\"#1f8fe0\"/><ellipse cx=\"27\" cy=\"32\" rx=\"21\" ry=\"14\" fill=\"#3db7ff\"/><path d=\"M20 19q8-9 18-1-8 4-18 1z\" fill=\"#1f8fe0\"/><path d=\"M31 19v26M38 21v22\" stroke=\"#fff\" stroke-opacity=\".5\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><circle cx=\"15\" cy=\"29\" r=\"4\" fill=\"#fff\"/><circle cx=\"14\" cy=\"29\" r=\"2\" fill=\"#2b1d38\"/><path d=\"M8 36q3 2 6 0\" stroke=\"#1b5f9e\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/>",
    apel: "<path d=\"M32 19C24 12 9 16 9 33c0 14 10 26 23 22 13 4 23-8 23-22 0-17-15-21-23-14z\" fill=\"#ef3b3b\"/><path d=\"M32 19c0-6 2-10 7-13\" stroke=\"#7a4a1e\" stroke-width=\"3.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M37 12c6-7 15-5 17-1-6 5-13 5-17 1z\" fill=\"#3ecf6e\"/><ellipse cx=\"20\" cy=\"31\" rx=\"3.2\" ry=\"7\" fill=\"#fff\" opacity=\".45\" transform=\"rotate(15 20 31)\"/>",
    pisang: "<path d=\"M9 12C9 40 33 58 57 47c2-1 1-4-2-3C35 51 21 37 18 12z\" fill=\"#ffd93d\" stroke=\"#d9a300\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/><path d=\"M7 8h11l-1.5 7H8z\" fill=\"#7a5a1e\"/><path d=\"M21 22c3 12 12 21 24 24\" stroke=\"#fff\" stroke-opacity=\".5\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/>",
    rumah: "<rect x=\"13\" y=\"29\" width=\"38\" height=\"27\" rx=\"2\" fill=\"#ffd9a0\"/><rect x=\"43\" y=\"12\" width=\"7\" height=\"14\" fill=\"#a8613f\"/><path d=\"M6 33 32 9l26 24z\" fill=\"#e0503f\"/><rect x=\"26\" y=\"40\" width=\"12\" height=\"16\" rx=\"2\" fill=\"#8a5a2c\"/><circle cx=\"35\" cy=\"49\" r=\"1.2\" fill=\"#ffd34d\"/><rect x=\"16\" y=\"36\" width=\"8\" height=\"8\" rx=\"1\" fill=\"#8fd3ff\" stroke=\"#fff\" stroke-width=\"1.6\"/><rect x=\"40\" y=\"36\" width=\"8\" height=\"8\" rx=\"1\" fill=\"#8fd3ff\" stroke=\"#fff\" stroke-width=\"1.6\"/>",
    bulan: "<path d=\"M43 7A26 26 0 1 0 57 45 21 21 0 0 1 43 7z\" fill=\"#ffd34d\"/><circle cx=\"24\" cy=\"38\" r=\"4\" fill=\"#f2b705\" opacity=\".6\"/><circle cx=\"33\" cy=\"49\" r=\"2.6\" fill=\"#f2b705\" opacity=\".6\"/><path d=\"M50 14l1.8 4.2L56 20l-4.2 1.8L50 26l-1.8-4.2L44 20l4.2-1.8z\" fill=\"#ffb703\"/>",
    bintang: "<path d=\"M32 5l8 18 19 2-14 13 4 19-17-10-17 10 4-19L5 25l19-2z\" fill=\"#ffc928\" stroke=\"#f59e0b\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M32 14l4 10\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"3\" stroke-linecap=\"round\"/>",
    buku: "<rect x=\"13\" y=\"8\" width=\"38\" height=\"48\" rx=\"4\" fill=\"#3b7bff\"/><rect x=\"13\" y=\"8\" width=\"8\" height=\"48\" rx=\"3\" fill=\"#2457c9\"/><rect x=\"48\" y=\"10\" width=\"5\" height=\"44\" rx=\"2\" fill=\"#fff4d6\"/><rect x=\"26\" y=\"18\" width=\"19\" height=\"12\" rx=\"3\" fill=\"#ffd93d\"/><path d=\"M29 24h13\" stroke=\"#2457c9\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><path d=\"M26 40h19M26 46h12\" stroke=\"#fff\" stroke-opacity=\".7\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><path d=\"M38 56v6l3-2 3 2v-6z\" fill=\"#e0344f\"/>",
    pohon: "<rect x=\"28\" y=\"38\" width=\"8\" height=\"21\" rx=\"2\" fill=\"#8a5a2c\"/><circle cx=\"32\" cy=\"24\" r=\"15\" fill=\"#3ecf6e\"/><circle cx=\"19\" cy=\"35\" r=\"11\" fill=\"#2fb85c\"/><circle cx=\"45\" cy=\"35\" r=\"11\" fill=\"#2fb85c\"/><circle cx=\"27\" cy=\"20\" r=\"4\" fill=\"#7fe69b\" opacity=\".7\"/><circle cx=\"38\" cy=\"30\" r=\"3\" fill=\"#ef3b3b\"/><circle cx=\"24\" cy=\"32\" r=\"3\" fill=\"#ef3b3b\"/>",
    bola: "<circle cx=\"32\" cy=\"32\" r=\"25\" fill=\"#fff\" stroke=\"#2b1d38\" stroke-width=\"3\"/><path d=\"M32 21l10 7.5-4 11.5H26l-4-11.5z\" fill=\"#2b1d38\"/><path d=\"M32 21V8M42 28.5l12-4M38 40l8 10M26 40l-8 10M22 28.5l-12-4\" stroke=\"#2b1d38\" stroke-width=\"3\" stroke-linecap=\"round\"/>",
    balon: "<ellipse cx=\"32\" cy=\"26\" rx=\"17\" ry=\"21\" fill=\"#ff4f86\"/><path d=\"M28.5 46h7L32 51z\" fill=\"#d83a70\"/><path d=\"M32 51q-6 5 0 9t0 4\" stroke=\"#6b7280\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"24\" cy=\"17\" rx=\"3.2\" ry=\"7\" fill=\"#fff\" opacity=\".5\" transform=\"rotate(20 24 17)\"/>",
    bunga: "<path d=\"M32 42v19\" stroke=\"#2e9e57\" stroke-width=\"4.4\" stroke-linecap=\"round\"/><ellipse cx=\"42\" cy=\"53\" rx=\"8\" ry=\"3.4\" fill=\"#3ecf6e\" transform=\"rotate(-28 42 53)\"/><g fill=\"#ff6fa5\"><circle cx=\"32\" cy=\"17\" r=\"10\"/><circle cx=\"45.3\" cy=\"26.7\" r=\"10\"/><circle cx=\"40.2\" cy=\"42.3\" r=\"10\"/><circle cx=\"23.8\" cy=\"42.3\" r=\"10\"/><circle cx=\"18.7\" cy=\"26.7\" r=\"10\"/></g><circle cx=\"32\" cy=\"32\" r=\"9\" fill=\"#ffd93d\"/><circle cx=\"29\" cy=\"30\" r=\"2\" fill=\"#f2b705\"/><circle cx=\"35\" cy=\"34\" r=\"2\" fill=\"#f2b705\"/>",
    matahari: "<g stroke=\"#ffb703\" stroke-width=\"4.6\" stroke-linecap=\"round\"><path d=\"M32 4v9\"/><path d=\"M32 4v9\" transform=\"rotate(45 32 32)\"/><path d=\"M32 4v9\" transform=\"rotate(90 32 32)\"/><path d=\"M32 4v9\" transform=\"rotate(135 32 32)\"/><path d=\"M32 4v9\" transform=\"rotate(180 32 32)\"/><path d=\"M32 4v9\" transform=\"rotate(225 32 32)\"/><path d=\"M32 4v9\" transform=\"rotate(270 32 32)\"/><path d=\"M32 4v9\" transform=\"rotate(315 32 32)\"/></g><circle cx=\"32\" cy=\"32\" r=\"16\" fill=\"#ffc928\"/><circle cx=\"26\" cy=\"29\" r=\"2.2\" fill=\"#2b1d38\"/><circle cx=\"38\" cy=\"29\" r=\"2.2\" fill=\"#2b1d38\"/><path d=\"M26 36q6 6 12 0\" stroke=\"#2b1d38\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/>",
    mobil: "<path d=\"M15 33l8-13h19l10 13z\" fill=\"#ef4444\"/><rect x=\"5\" y=\"32\" width=\"54\" height=\"17\" rx=\"6\" fill=\"#ef4444\"/><path d=\"M20 32l5.5-9H33v9zM37 32v-9h5l7 9z\" fill=\"#bfe7ff\"/><rect x=\"54\" y=\"37\" width=\"5\" height=\"5\" rx=\"1.5\" fill=\"#ffe66d\"/><circle cx=\"18\" cy=\"50\" r=\"7.5\" fill=\"#2b1d38\"/><circle cx=\"18\" cy=\"50\" r=\"3\" fill=\"#cbd5e1\"/><circle cx=\"46\" cy=\"50\" r=\"7.5\" fill=\"#2b1d38\"/><circle cx=\"46\" cy=\"50\" r=\"3\" fill=\"#cbd5e1\"/>",
    ayam: "<path d=\"M13 31q-9-5-6-17 9 3 12 13z\" fill=\"#e09a2a\"/><ellipse cx=\"28\" cy=\"38\" rx=\"20\" ry=\"16\" fill=\"#f2b84b\"/><ellipse cx=\"25\" cy=\"40\" rx=\"10\" ry=\"7\" fill=\"#e09a2a\"/><circle cx=\"46\" cy=\"23\" r=\"11\" fill=\"#f2b84b\"/><g fill=\"#ef4444\"><circle cx=\"41\" cy=\"12\" r=\"3.6\"/><circle cx=\"46\" cy=\"10\" r=\"3.6\"/><circle cx=\"51\" cy=\"12.5\" r=\"3.6\"/><ellipse cx=\"53\" cy=\"33\" rx=\"2.6\" ry=\"4\"/></g><path d=\"M55 21l9 3.6-9 3.6z\" fill=\"#ff9f1c\"/><circle cx=\"49\" cy=\"21\" r=\"2\" fill=\"#2b1d38\"/><path d=\"M25 54v7m8-7v7M21 61h8m0 0h8\" stroke=\"#ff9f1c\" stroke-width=\"3\" stroke-linecap=\"round\"/>",
    bebek: "<path d=\"M3 56q7-6 14 0t14 0 14 0 14 0v8H3z\" fill=\"#3db7ff\"/><ellipse cx=\"29\" cy=\"42\" rx=\"23\" ry=\"14\" fill=\"#ffd93d\"/><circle cx=\"45\" cy=\"22\" r=\"12\" fill=\"#ffd93d\"/><path d=\"M54 24q11-1 9 5-4 3-11-1z\" fill=\"#ff9f1c\"/><circle cx=\"48.5\" cy=\"19\" r=\"2.2\" fill=\"#2b1d38\"/><path d=\"M14 40q11-9 22 0-9 9-22 0z\" fill=\"#f5b800\"/>",
    pensil: "<g transform=\"rotate(38 32 32)\"><rect x=\"25\" y=\"3\" width=\"14\" height=\"8\" rx=\"3\" fill=\"#ff7a9a\"/><rect x=\"25\" y=\"10\" width=\"14\" height=\"5\" fill=\"#cbd5e1\"/><rect x=\"25\" y=\"15\" width=\"14\" height=\"30\" fill=\"#ffc928\"/><rect x=\"25\" y=\"15\" width=\"5\" height=\"30\" fill=\"#f5a700\"/><path d=\"M25 45h14L32 60z\" fill=\"#ffe0b3\"/><path d=\"M29.6 53.5h4.8L32 60z\" fill=\"#2b1d38\"/></g>"
  }; // ilustrasi SVG 64x64 per kata
  const KATA = Object.keys(GAMBAR);
  const TIM = {
    k: { nama: 'Tim Kiri', warna: '#2f6fed', cape: '#2a47a8', cover: ['#e8b95f', '#58b9d3', '#cfa25d'] },
    r: { nama: 'Tim Kanan', warna: '#ef4444', cape: '#c92a2a', cover: ['#e0a63a', '#a8613f', '#e0503f'] }
  };
  const D = 5.5;
  const S = { soal: cfg.soal, jenis: cfg.jenis };
  let G, bisu = false, ac, tumpukan = {};
  const muat = () => cfg.pemain.map((p, i) => ({ id: i, nama: p.nama, tim: p.tim, skor: 0 }));

  /* ================= IKON (SVG, bukan emoji) ================= */
  const svg = d => `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const SPK = '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/>';
  const IK = {
    suara: svg(SPK + '<path d="M15.5 8.5a5 5 0 0 1 0 7M18.2 5.8a9 9 0 0 1 0 12.4"/>'),
    bisu: svg(SPK + '<path d="m16 9 5 6m0-6-5 6"/>'),
    piala: svg('<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8.5 20h7"/>'),
    seri: svg('<path d="M5 9h14M5 15h14"/>')
  };

  /* ================= SUARA ================= */
  const suaraAda = 'speechSynthesis' in window;
  const bicara = t => { if (bisu || !suaraAda) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'id-ID'; u.rate = .85; speechSynthesis.speak(u); };
  const nada = (f, d = .15, t = 0, tp = 'sine') => {
    if (bisu) return;
    ac ||= new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain(), w = ac.currentTime + t;
    o.type = tp; o.frequency.value = f; g.gain.setValueAtTime(.15, w); g.gain.exponentialRampToValueAtTime(.001, w + d);
    o.connect(g).connect(ac.destination); o.start(w); o.stop(w + d);
  };
  const sfx = { benar: () => [523, 659, 784].forEach((f, i) => nada(f, .14, i * .1)), salah: () => nada(160, .35, 0, 'sawtooth'),
    menang: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => nada(f, .2, i * .16)) };

  const tampil = id => { $('#panel').hidden = id === 'akhir'; $('#akhir').hidden = id !== 'akhir'; };

  /* ================= 3D: DASAR ================= */
  const THREE = window.THREE; // dari CDN; bila gagal dimuat, game tetap jalan tanpa arena (lihat init3d)
  let R, U, P, pemain3d = [], aktif = null;
  const A = { x: 0, v: 0, tarik: 0, sorak: 0, salah: 0 };
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const mat = (c, o) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const basic = (c, o) => new THREE.MeshBasicMaterial({ color: c, ...o });
  const mesh = (g, m, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx) => {
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = o.receiveShadow = true; return o;
  };
  const kanvas = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return new THREE.CanvasTexture(c); };
  const malam = () => (document.documentElement.dataset.tema || document.body.dataset.tema) === 'gelap';
  const ruas = (a, b, r, m) => { // silinder dari titik a ke b (lengan, tali balon)
    const d = b.clone().sub(a), l = d.length(), c = new THREE.Mesh(U.cyl, m);
    c.scale.set(r, l, r); c.position.copy(a).addScaledVector(d, .5); c.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); c.castShadow = true; return c;
  };

  function init3d() {
    if (R) return true;
    let renderer;
    try { if (!THREE) throw 0; renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch { $('#arena').insertAdjacentHTML('afterbegin', '<p class="gagal">Arena 3D tidak bisa dimuat (Three.js / WebGL). Periksa internet atau pasang three.min.js lokal — soal tetap bisa dimainkan.</p>'); return false; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    $('#arena').prepend(renderer.domElement);
    const pita = new THREE.Shape(), jubah = new THREE.Shape();
    pita.moveTo(-.2, 0); pita.lineTo(.2, 0); pita.lineTo(.2, -.7); pita.lineTo(0, -.5); pita.lineTo(-.2, -.7);
    jubah.moveTo(-.46, 0); jubah.lineTo(.46, 0); jubah.lineTo(.8, -1.5); jubah.lineTo(-.8, -1.5);
    U = { box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 14), sph: new THREE.SphereGeometry(1, 18, 14), tor: new THREE.TorusGeometry(1, .34, 10, 20),
      kerucut: new THREE.ConeGeometry(1, 1, 8), piramid: new THREE.CylinderGeometry(0, .7071, 1, 4).rotateY(Math.PI / 4), pita: new THREE.ShapeGeometry(pita), jubah: new THREE.ShapeGeometry(jubah) };
    P = { box: U.box, cyl: new THREE.CylinderGeometry(1, 1, 1, 8), sph: new THREE.SphereGeometry(1, 8, 6), kerucut: new THREE.ConeGeometry(1, 1, 8), // geometri ringan untuk penonton
      busur: new THREE.TorusGeometry(1, .1, 5, 10, Math.PI), tor: new THREE.TorusGeometry(1, .14, 5, 12), setengah: new THREE.CircleGeometry(1, 10, Math.PI, Math.PI), jubah: U.jubah };
    R = { el: $('#arena'), renderer, scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(38, 2, .1, 400), cp: V3(0, 5, 16), look: V3(0, 2, 0), camTo: V3(), lookTo: V3(), mode: 'game', awan: [], balon: [], blok: [], jarak: 16 };
    dunia(); latar(); aturTema(); aturKamera(true);
    new ResizeObserver(ukur).observe(R.el);
    requestAnimationFrame(loop);
    return true;
  }
  function ukur() {
    if (!R && !init3d()) return;
    const w = R.el.clientWidth, h = R.el.clientHeight;
    if (!w || !h) return;
    R.renderer.setSize(w, h); R.camera.aspect = w / h; R.jarak = Math.min(34, Math.max(12.5, 18.5 / R.camera.aspect)); R.camera.updateProjectionMatrix(); aturKamera();
  }
  function aturKamera(langsung) {
    const p = R.mode === 'podium', j = R.jarak;
    R.camTo.set(0, p ? 4.4 : 4.6 + j * .05, p ? Math.max(16.5, j * 1.1) : j); R.lookTo.set(0, p ? 4.2 : 3, 0);
    if (langsung) { R.cp.copy(R.camTo); R.look.copy(R.lookTo); }
  }
  function aturTema() { // siang/malam mengikuti tema situs (data-tema="gelap")
    const m = malam(), [a, b, c] = m ? ['#040720', '#121150', '#5b2b7c'] : ['#4aaeff', '#8fd3ff', '#fff2c2'];
    R.scene.background = kanvas(2, 256, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, a); l.addColorStop(.6, b); l.addColorStop(1, c); g.fillStyle = l; g.fillRect(0, 0, w, h); });
    R.scene.fog = new THREE.Fog(m ? 0x2c1b68 : 0xcfeeff, 70, 175);
    R.hemi.color.set(m ? 0x8a8aff : 0xffffff); R.hemi.intensity = m ? .65 : .85; R.sun.color.set(m ? 0x9aa8ff : 0xffffff); R.sun.intensity = m ? .45 : .7;
    R.bola.material.color.set(m ? 0xeef0ff : 0xffd23f); R.glow.material.color.set(m ? 0x9aa8ff : 0xffc94d);
    R.bintang.visible = m; R.awanMat.color.set(m ? 0x6f6bd0 : 0xffffff);
  }

  /* ================= 3D: PANGGUNG & PENONTON BUKU ================= */
  const gabung = bagian => { // gabungkan banyak bentuk berwarna menjadi satu geometri (agar bisa di-instance)
    const pos = [], nor = [], col = [], idx = [], c = new THREE.Color(); let off = 0;
    bagian.forEach(([g0, w, m]) => {
      const g = g0.clone().applyMatrix4(m), p = g.attributes.position, n = g.attributes.normal; c.set(w);
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(c.r, c.g, c.b); }
      if (g.index) g.index.array.forEach(v => idx.push(v + off)); else for (let i = 0; i < p.count; i++) idx.push(i + off);
      off += p.count;
    });
    const r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); r.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); r.setIndex(idx);
    return r;
  };
  const bp = (g, c, x, y, z, sx, sy = sx, sz = sx, rx = 0, ry = 0, rz = 0) => [g, c, new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V3(sx, sy, sz))];
  // 12 gaya penonton: warna sampul, topi/aksesori, jubah, ekspresi
  const GAYA = [
    { cv: '#58b9d3', topi: 'wisuda', kacamata: '#222', mulut: 'senyum' }, { cv: '#e0503f', jubah: '#27408b', mulut: 'buka' },
    { cv: '#7bc96f', topi: 'penyihir', w: '#7a5cff', mulut: 'senyum' }, { cv: '#9a6bff', headphone: '#ffd34d', mulut: 'buka' },
    { cv: '#ffd34d', syal: '#ef4444', mulut: 'senyum' }, { cv: '#ff8fb8', pita: '#ff2f7a', kacamata: '#ff2f7a', mulut: 'senyum' },
    { cv: '#2fb4c9', mahkota: 1, jubah: '#c92a2a', mulut: 'buka' }, { cv: '#ff9f43', topi: 'pesta', w: '#3b7bff', mulut: 'o' },
    { cv: '#a8613f', topi: 'baret', w: '#e0344f', syal: '#ffffff', mulut: 'senyum' }, { cv: '#f2f2f2', topi: 'tinggi', w: '#2a2a3a', mulut: 'senyum' },
    { cv: '#2a47a8', syal: '#ffc928', jubah: '#ffc928', mulut: 'buka' }, { cv: '#b6e35a', topi: 'pesta', w: '#ef4444', kacamata: '#222', mulut: 'senyum' }
  ];
  function buatPenonton(s) {
    const cv = s.cv, gl = new THREE.Color(cv).multiplyScalar(.6).getHex(), w = s.w, g = [
      bp(P.box, cv, 0, 0, .17, 1, 1.5, .12), bp(P.box, cv, 0, 0, -.17, 1, 1.5, .12), bp(P.box, gl, -.5, 0, 0, .12, 1.52, .5), bp(P.box, 0xfff4d6, .03, 0, 0, .86, 1.38, .26), // buku
      bp(P.cyl, 0x6b4423, -.22, -1.03, 0, .1, .56, .1), bp(P.cyl, 0x6b4423, .22, -1.03, 0, .1, .56, .1), bp(P.box, 0x35210f, -.22, -1.3, .07, .27, .15, .42), bp(P.box, 0x35210f, .22, -1.3, .07, .27, .15, .42), // kaki
      bp(P.sph, 0xffffff, -.2, .15, .235, .14, .18, .05), bp(P.sph, 0xffffff, .2, .15, .235, .14, .18, .05), bp(P.sph, 0x2a1a10, -.2, .14, .27, .07, .09, .04), bp(P.sph, 0x2a1a10, .2, .14, .27, .07, .09, .04), // mata
      bp(P.sph, 0xff8fa8, -.34, -.05, .235, .07, .05, .02), bp(P.sph, 0xff8fa8, .34, -.05, .235, .07, .05, .02)]; // pipi
    if (s.mulut === 'buka') g.push(bp(P.setengah, 0x8a1f2f, 0, -.08, .24, .17), bp(P.sph, 0xff7a96, 0, -.16, .243, .08, .04, .01));
    else if (s.mulut === 'o') g.push(bp(P.sph, 0x8a1f2f, 0, -.12, .24, .07, .09, .03));
    else g.push(bp(P.busur, 0x4a3320, 0, -.04, .24, .15, .15, .15, 0, 0, Math.PI));
    if (s.kacamata) g.push(bp(P.tor, s.kacamata, -.2, .15, .255, .2), bp(P.tor, s.kacamata, .2, .15, .255, .2), bp(P.box, s.kacamata, 0, .17, .255, .1, .025, .025));
    if (s.jubah) g.push(bp(P.jubah, s.jubah, 0, .7, -.27, 1, 1, 1, .22, 0, 0));
    if (s.syal) g.push(bp(P.box, s.syal, 0, -.35, 0, 1.08, .17, .54), bp(P.box, s.syal, .3, -.58, .3, .16, .42, .08));
    if (s.headphone) g.push(bp(P.busur, s.headphone, 0, .62, 0, .56), bp(P.cyl, 0x222222, -.57, .62, 0, .16, .1, .16, 0, 0, Math.PI / 2), bp(P.cyl, 0x222222, .57, .62, 0, .16, .1, .16, 0, 0, Math.PI / 2));
    if (s.pita) g.push(bp(P.sph, s.pita, -.13, .82, 0, .16, .1, .08), bp(P.sph, s.pita, .13, .82, 0, .16, .1, .08), bp(P.sph, s.pita, 0, .82, 0, .07));
    if (s.mahkota) g.push(bp(P.cyl, 0xffc928, 0, .8, 0, .4, .1, .2), ...[-.3, -.15, 0, .15, .3].map(x => bp(P.kerucut, 0xffc928, x, .95, 0, .07, .2, .07)));
    if (s.topi === 'wisuda') g.push(bp(P.box, 0x1f1f2e, 0, .79, 0, 1.15, .06, 1.15), bp(P.box, 0x1f1f2e, 0, .73, 0, .6, .1, .6), bp(P.cyl, 0xffc928, .5, .62, .3, .015, .34, .015), bp(P.sph, 0xffc928, .5, .43, .3, .05));
    if (s.topi === 'penyihir') g.push(bp(P.kerucut, w, 0, 1.15, 0, .38, .8, .38), bp(P.cyl, w, 0, .77, 0, .62, .04, .62), bp(P.sph, 0xffe066, .1, 1, .33, .06));
    if (s.topi === 'pesta') g.push(bp(P.kerucut, w, 0, 1, 0, .3, .55, .3), bp(P.sph, 0xffe066, 0, 1.3, 0, .07));
    if (s.topi === 'tinggi') g.push(bp(P.cyl, w, 0, .96, 0, .32, .4, .3), bp(P.cyl, w, 0, .77, 0, .52, .03, .52), bp(P.cyl, 0xff4f86, 0, .82, 0, .33, .06, .31));
    if (s.topi === 'baret') g.push(bp(P.sph, w, 0, .8, 0, .5, .16, .46, 0, 0, .15), bp(P.cyl, w, 0, .95, 0, .03, .08, .03));
    return gabung(g);
  }

  function dunia() {
    const { scene } = R;
    R.hemi = new THREE.HemisphereLight(0xffffff, 0x88cc99, .85); scene.add(R.hemi);
    R.sun = new THREE.DirectionalLight(0xffffff, .7); R.sun.position.set(-9, 18, 12); R.sun.castShadow = true;
    Object.assign(R.sun.shadow.camera, { left: -16, right: 16, top: 10, bottom: -10, near: 1, far: 50 }); R.sun.shadow.camera.updateProjectionMatrix(); R.sun.shadow.mapSize.set(1024, 1024); scene.add(R.sun);

    const rumput = mesh(new THREE.PlaneGeometry(400, 400), mat(0x6cce8c), 0, -.41, 0); rumput.rotation.x = -Math.PI / 2; rumput.castShadow = false; scene.add(rumput);
    const kayu = kanvas(512, 256, (g, w, h) => {
      g.fillStyle = '#ecc07c'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) { g.fillStyle = `hsla(30,60%,${40 + Math.random() * 14}%,.2)`; g.fillRect(0, y, w, 32); g.fillStyle = 'rgba(110,62,18,.4)'; g.fillRect(0, y, w, 3); g.fillRect(Math.random() * w, y, 3, 32); }
    });
    kayu.wrapS = kayu.wrapT = THREE.RepeatWrapping; kayu.repeat.set(3, 1);
    const sisi = mat(0xb9803f); scene.add(mesh(U.box, [sisi, sisi, mat(0xffffff, { map: kayu }), sisi, sisi, sisi], 0, -.2, 0, 28, .4, 11));
    const garis = (x, c, w) => { const m = new THREE.Mesh(U.box, basic(c)); m.scale.set(w, .02, 10.6); m.position.set(x, .012, 0); scene.add(m); };
    garis(0, 0xffffff, .3); garis(-D, 0x2f6fed, .34); garis(D, 0xef4444, .34);
    [-1, 1].forEach(s => { // zona menang berwarna + tiang bendera di tiap garis
      const w = 14 - D, z = new THREE.Mesh(U.box, basic(s < 0 ? 0x2f6fed : 0xef4444, { transparent: true, opacity: .26 })); z.scale.set(w, .02, 10.6); z.position.set(s * (D + w / 2), .01, 0); scene.add(z);
      [-5.3, 5.3].forEach(zz => { scene.add(mesh(U.cyl, mat(0xffffff), s * D, 1.3, zz, .08, 2.6, .08), mesh(U.box, mat(s < 0 ? 0x2f6fed : 0xef4444), s * D + .35, 2.2, zz, .7, .42, .04)); });
    });

    // tribun 3 tingkat (belakang + samping) berisi penonton berwujud buku
    const ungu = [0x6a58a8, 0x7d6bbd, 0x9080cf], kursi = [], pilih = () => Math.floor(Math.random() * GAYA.length);
    for (let r = 0; r < 3; r++) {
      const h = (r + 1) * .7, y = h / 2 - .4, top = h - .4;
      scene.add(mesh(U.box, mat(ungu[r]), 0, y, -6.6 - r * 1.7, 36, h, 1.7));
      for (let c = 0; c < 34; c++) kursi.push({ x: -16.5 + c * 1.02 + Math.random() * .2, y: top, z: -6.6 - r * 1.7 + (Math.random() - .5) * .4, ph: Math.random() * 6, ry: (Math.random() - .5) * .5, sp: pilih() });
      [-1, 1].forEach(s => {
        scene.add(mesh(U.box, mat(ungu[r]), s * (14.8 + r * 1.7), y, -.6, 1.7, h, 12.4));
        for (let c = 0; c < 11; c++) kursi.push({ x: s * (14.8 + r * 1.7) + (Math.random() - .5) * .3, y: top, z: -5.6 + c * 1.1 + Math.random() * .2, ph: Math.random() * 6, ry: -s + (Math.random() - .5) * .4, sp: pilih() });
      });
    }
    const grup = GAYA.map(() => []); kursi.forEach(k => grup[k.sp].push(k));
    const bahan = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), o = new THREE.Object3D();
    R.penonton = grup.map((arr, s) => { if (!arr.length) return null; const im = new THREE.InstancedMesh(buatPenonton(GAYA[s]), bahan, arr.length); im.frustumCulled = false; scene.add(im); return { im, arr }; }).filter(Boolean);
    R.sorak = (t, riuh) => R.penonton.forEach(({ im, arr }) => { // goyang pelan; melompat dan melambai saat jawaban benar
      arr.forEach((k, i) => {
        const w = Math.sin(t * (riuh ? 9 : 3) + k.ph);
        o.position.set(k.x, k.y + .85 + Math.abs(w) * (riuh ? .4 : .04), k.z); o.rotation.set(0, k.ry, riuh ? w * .14 : 0); o.scale.setScalar(.62); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    });
    const spanduk = kanvas(1024, 64, (g, w, h) => {
      const l = g.createLinearGradient(0, 0, w, 0); l.addColorStop(0, '#2f6fed'); l.addColorStop(.5, '#8b5cf6'); l.addColorStop(1, '#ef4444'); g.fillStyle = l; g.fillRect(0, 0, w, h);
      g.font = '38px "Lilita One", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let i = 0; i < 3; i++) { g.fillStyle = '#fff'; g.fillText('DUEL TAMBANG', 171 + i * 341, 34); g.fillStyle = '#ffc928'; g.beginPath(); g.arc(i * 341, 34, 7, 0, 7); g.fill(); }
    });
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(26, .62), basic(0xffffff, { map: spanduk })); sp.position.set(0, -.05, -5.73); scene.add(sp);

    // rumbai bendera
    const tri = new THREE.Shape(); tri.moveTo(-.3, 0); tri.lineTo(.3, 0); tri.lineTo(0, -.65); const triG = new THREE.ShapeGeometry(tri), wb = [0xff5e7e, 0xffc23c, 0x3ecf6e, 0x2f9bff].map(c => mat(c, { side: THREE.DoubleSide })), tali = [];
    for (let i = 0; i <= 28; i++) { const u = i / 28, x = -13.5 + u * 27, y = 5.2 - 1.1 * (1 - (2 * u - 1) ** 2); tali.push(V3(x, y, -5.2)); const f = new THREE.Mesh(triG, wb[i % 4]); f.position.set(x, y, -5.2); scene.add(f); }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(tali), new THREE.LineBasicMaterial({ color: 0x3a2a55 })));
    [-13.5, 13.5].forEach(x => scene.add(mesh(U.cyl, mat(0xffffff), x, 2.6, -5.2, .12, 5.2, .12)));
  }

  /* ================= 3D: LATAR BELAKANG (tanpa pelangi) ================= */
  function latar() {
    const { scene } = R, bangun = (g, m, x, y, z, sx, sy = sx, sz = sx) => { const o = mesh(g, m, x, y, z, sx, sy, sz); o.castShadow = false; scene.add(o); return o; };
    // matahari/bulan + bintang malam
    R.bola = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16), basic(0xffd23f, { fog: false })); R.bola.position.set(-34, 17, -96);
    const gl = kanvas(128, 128, (g, w) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.4)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
    R.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: gl, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); R.glow.scale.set(40, 40, 1); R.glow.position.copy(R.bola.position);
    const st = []; for (let i = 0; i < 300; i++) { const a = Math.random() * 6.28, e = Math.random() * 1.2 + .1; st.push(Math.cos(a) * 150 * Math.cos(e), Math.sin(e) * 150, -Math.abs(Math.sin(a)) * 150 - 20); }
    R.bintang = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(st, 3)), new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, fog: false }));
    scene.add(R.bola, R.glow, R.bintang);
    // pegunungan jauh (puncak salju) dan bukit berlapis
    [[-100, 0xa9cfe9, 54, 40], [-28, 0xb8d8ee, 70, 50], [60, 0xa9cfe9, 60, 42], [125, 0xb8d8ee, 56, 38]].forEach(([x, c, w, h]) => {
      bangun(U.kerucut, mat(c), x, h / 2 - 12, -150, w / 2, h, w / 3); bangun(U.kerucut, mat(0xffffff), x, h - 12 - h * .14, -150, w * .14, h * .28, w * .1);
    });
    const bk = [[-62, -8.5, -80, 58, 13, 22, 0x58c987], [8, -9, -78, 62, 12, 20, 0x4fbf7d], [72, -8.5, -80, 56, 13, 22, 0x58c987], [-30, -10, -112, 92, 20, 28, 0x8bdca9], [62, -10, -114, 92, 18, 28, 0x7bd29b]];
    bk.forEach(([x, y, z, sx, sy, sz, c]) => bangun(U.sph, mat(c), x, y, z, sx, sy, sz));
    const puncak = x => Math.max(...bk.slice(0, 3).map(([cx, cy, , sx, sy]) => { const u = (x - cx) / sx; return Math.abs(u) < 1 ? cy + sy * Math.sqrt(1 - u * u) : -99; }));
    // hutan: pinus bertingkat, pohon rindang (ada sakura & musim gugur), semak
    const o = new THREE.Object3D(), c = new THREE.Color(), im = (g, n) => { const m = new THREE.InstancedMesh(g, mat(0xffffff), n); m.frustumCulled = false; scene.add(m); return m; };
    const taruh = (m, i, x, y, z, sx, sy, sz) => { o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.updateMatrix(); m.setMatrixAt(i, o.matrix); };
    const cari = (n, lebar) => Array.from({ length: n }, () => { // titik di bukit, sisakan ruang untuk kastil & kincir
      for (let k = 0; k < 20; k++) { const x = -105 + Math.random() * 210, y0 = puncak(x); if (y0 > -3 && !(x > -8 && x < 24) && !(x > -56 && x < -36)) return { x, y: y0 - .5, z: -80 + (Math.random() - .5) * lebar, s: 1 + Math.random() * .9 }; }
      return { x: 0, y: -99, z: -80, s: 1 };
    });
    const pinus = cari(70, 12), pB = im(U.cyl, 70), pA = [1, 2, 3].map(() => im(U.kerucut, 70));
    pinus.forEach((p, n) => {
      const { x, y, z, s } = p; taruh(pB, n, x, y + .7 * s, z, .25 * s, 1.4 * s, .25 * s);
      [[1.7, 2.2, 3.1], [1.35, 2, 4.3], [.95, 1.8, 5.4]].forEach(([r, h, yy], k) => { taruh(pA[k], n, x, y + yy * s * .8 + .2, z, r * s, h * s, r * s); pA[k].setColorAt(n, c.setHSL(.3 + Math.random() * .06, .6, .26 + k * .05 + Math.random() * .06)); });
    });
    const rindang = cari(50, 14), rB = im(U.cyl, 50), rA = [0, 1, 2].map(() => im(U.sph, 50)), warna = [0x3ecf6e, 0x2fb85c, 0x58c987, 0x7fd36b, 0xffa8c8, 0xf59e3b];
    rindang.forEach((p, n) => {
      const { x, y, z, s } = p, w = warna[Math.floor(Math.random() * warna.length)];
      taruh(rB, n, x, y + .9 * s, z, .3 * s, 1.8 * s, .3 * s);
      [[0, 2.5, 0, 1.6], [-1, 2.1, .3, 1.15], [1, 2.2, -.2, 1.25]].forEach(([dx, dy, dz, r], k) => { taruh(rA[k], n, x + dx * s, y + dy * s, z + dz * s, r * s, r * s * .9, r * s); rA[k].setColorAt(n, c.set(w).offsetHSL(0, 0, (k - 1) * .04)); });
    });
    const semak = cari(45, 16), sA = [0, 1].map(() => im(U.sph, 45));
    semak.forEach((p, n) => { const { x, y, z, s } = p, w = c.setHSL(.28 + Math.random() * .08, .55, .3 + Math.random() * .1); [[-.5, .7], [.5, .55]].forEach(([dx, r], k) => { taruh(sA[k], n, x + dx * s, y + .4 * s, z + 4, r * s, r * s * .8, r * s); sA[k].setColorAt(n, w); }); });
    for (let n = 0; n < 70; n++) pB.setColorAt(n, c.set(0x7a4f26)); // warna batang
    for (let n = 0; n < 50; n++) rB.setColorAt(n, c.set(0x8a5a2c));

    // perpustakaan berbentuk kastil
    const ks = new THREE.Group(); ks.position.set(8, 2.5, -72); ks.scale.setScalar(.8); scene.add(ks);
    const krem = mat(0xfff1d0), merah = mat(0xe0503f), kaca = basic(0xffe9a8), kb = (g, m, x, y, z, sx, sy = sx, sz = sx) => { const t = mesh(g, m, x, y, z, sx, sy, sz); t.castShadow = false; ks.add(t); return t; };
    kb(U.box, krem, 0, 4, 0, 16, 8, 6); kb(U.piramid, merah, 0, 9.6, 0, 16.8, 3.4, 7); kb(U.cyl, krem, 0, 10, 0, 3.2, 20, 3.2); kb(U.kerucut, merah, 0, 22.5, 0, 4.2, 5, 4.2);
    [-9.5, 9.5].forEach(x => { kb(U.cyl, krem, x, 7, 0, 2.2, 14, 2.2); kb(U.kerucut, merah, x, 16.5, 0, 3, 5, 3); kb(U.cyl, mat(0xffffff), x, 20.5, 0, .08, 3, .08); const b = new THREE.Mesh(U.pita, new THREE.MeshLambertMaterial({ color: x < 0 ? 0x2f6fed : 0xef4444, side: THREE.DoubleSide })); b.scale.set(2.2, 2.2, 1); b.rotation.z = Math.PI / 2; b.position.set(x + .1, 21.8, 0); ks.add(b); kb(U.box, kaca, x, 9, 2.25, .9, 1.8, .2); kb(U.box, kaca, x, 12.5, 2.25, .9, 1.8, .2); });
    kb(U.box, mat(0x8a5a2c), 0, 2.2, 3.05, 3.4, 4.4, .3); [-6, -3.2, 3.2, 6].forEach(x => kb(U.box, kaca, x, 5.2, 3.05, 1.2, 2.2, .2));
    const jam = new THREE.Mesh(new THREE.CircleGeometry(1, 24), basic(0xffffff)); jam.scale.setScalar(1.8); jam.position.set(0, 14.5, 3.25); ks.add(jam);
    [[0, 1.2, 0, 0], [.7, 0, 0, -.6]].forEach(([x, y, , r]) => { const j = new THREE.Mesh(U.box, basic(0x2b1d38)); j.scale.set(.18, 1.2, .05); j.position.set(x * .5, 14.5 + y * .4, 3.3); j.rotation.z = r; ks.add(j); });
    // kincir angin
    const kn = new THREE.Group(); kn.position.set(-46, 3, -72); scene.add(kn);
    const kk = (g, m, x, y, z, sx, sy, sz) => { const t = mesh(g, m, x, y, z, sx, sy, sz); t.castShadow = false; kn.add(t); return t; };
    kk(new THREE.CylinderGeometry(1.1, 2, 11, 10), krem, 0, 5.5, 0, 1, 1, 1); kk(U.kerucut, merah, 0, 13, 0, 1.9, 3.2, 1.9); kk(U.sph, mat(0x8a5a2c), 0, 10.5, 1.6, .7, .7, .7); kk(U.box, mat(0x8a5a2c), 0, 1.2, 2, 1.1, 2.2, .2);
    R.baling = new THREE.Group(); R.baling.position.set(0, 10.5, 2.1); kn.add(R.baling);
    for (let i = 0; i < 4; i++) { const b = new THREE.Group(); b.rotation.z = i * Math.PI / 2; const t1 = mesh(U.box, mat(0x8a5a2c), 0, 3.6, 0, .25, 7.2, .2), t2 = mesh(U.box, mat(0xfff7e6), .55, 4.4, .1, 1, 4.6, .08); t1.castShadow = t2.castShadow = false; b.add(t1, t2); R.baling.add(b); }
    // balon udara
    const balon = (x, y, z, w1, w2) => {
      const g = new THREE.Group(), tx = kanvas(128, 8, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? w1 : w2; c.fillRect(i * 16, 0, 16, h); } }); tx.wrapS = THREE.RepeatWrapping;
      g.add(mesh(U.sph, mat(0xffffff, { map: tx }), 0, 0, 0, 3.6, 4.4, 3.6), mesh(U.box, mat(0x8a5a2c), 0, -6.3, 0, 1.5, 1.1, 1.5));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(ruas(V3(a * .7, -5.7, b * .7), V3(a * 1.6, -3.8, b * 1.6), .04, mat(0x5b4a3a))));
      g.position.set(x, y, z); g.scale.setScalar(1.2); g.userData = { y, ph: Math.random() * 6 }; scene.add(g); R.balon.push(g);
    };
    balon(28, 11, -62, '#ff4f86', '#ffd34d'); balon(-26, 13, -72, '#3b7bff', '#ffffff');
    // balok huruf melayang
    ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((h, i) => {
      const w = ['#ff4f86', '#3b7bff', '#0fa968', '#8b5cf6', '#ff8a3d', '#12a9d9', '#d946b0'][i];
      const tx = kanvas(128, 128, (g, s) => { g.fillStyle = w; g.fillRect(0, 0, s, s); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 8; g.strokeRect(6, 6, s - 12, s - 12); g.fillStyle = '#fff'; g.font = '84px "Lilita One", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(h, 64, 70); });
      const b = mesh(U.box, mat(0xffffff, { map: tx }), -50 + i * 16 + (Math.random() - .5) * 6, 8 + (i % 3) * 3.2, -46 - (i % 4) * 4, 2.2); b.castShadow = false; b.userData = { y: b.position.y, ph: i * 1.7 }; scene.add(b); R.blok.push(b);
    });
    // awan
    R.awanMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 6; i++) {
      const aw = new THREE.Group();
      [[0, 0, 2.6], [2.5, .4, 2.1], [-2.4, -.2, 1.9], [.7, 1, 1.8]].forEach(([x, y, r]) => { const m = new THREE.Mesh(U.sph, R.awanMat); m.scale.setScalar(r); m.position.set(x, y, 0); aw.add(m); });
      aw.position.set(-80 + i * 32, 12 + (i % 3) * 4, -70 - (i % 2) * 15); aw.scale.setScalar(1.4); R.awan.push(aw); scene.add(aw);
    }
  }

  /* ================= 3D: MASKOT BUKU (PEMAIN) ================= */
  const wajah = (() => { // tekstur muka di sampul buku (di-cache per tim/warna/suasana)
    const cache = {};
    return (t, cover, mood) => cache[t + cover + mood] ||= kanvas(256, 384, (g, w, h) => {
      const kiri = t === 'k', dir = kiri ? 1 : -1, cy = 190, bulat = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 7); };
      g.fillStyle = cover; g.fillRect(0, 0, w, h);
      const sh = g.createLinearGradient(0, 0, w, 0); sh.addColorStop(0, 'rgba(0,0,0,.22)'); sh.addColorStop(.2, 'rgba(255,255,255,.12)'); sh.addColorStop(1, 'rgba(0,0,0,.1)'); g.fillStyle = sh; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#f7d96b'; g.lineWidth = 9; g.strokeRect(22, 22, w - 44, h - 44); g.strokeStyle = 'rgba(90,50,10,.5)'; g.lineWidth = 3; g.strokeRect(34, 34, w - 68, h - 68);
      [[34, 34], [w - 34, 34], [34, h - 34], [w - 34, h - 34]].forEach(([x, y]) => { g.fillStyle = '#f7d96b'; bulat(x, y, 13); g.fill(); g.strokeStyle = '#8a5a12'; g.lineWidth = 3; g.stroke(); });
      g.fillStyle = 'rgba(255,105,140,.5)'; [60, 196].forEach(x => { g.beginPath(); g.ellipse(x, cy + 56, 20, 13, 0, 0, 7); g.fill(); });
      [88, 168].forEach(x => { // mata menatap ke arah tali
        g.fillStyle = '#fff'; g.strokeStyle = '#3b2412'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, cy, 31, 37, 0, 0, 7); g.fill(); g.stroke();
        g.fillStyle = '#2a1a10'; bulat(x + dir * 9, cy + 4, 17); g.fill(); g.fillStyle = '#fff'; bulat(x + dir * 9 + 6, cy - 3, 6); g.fill();
      });
      if (kiri) { g.strokeStyle = '#2fb4c9'; g.lineWidth = 8; g.fillStyle = 'rgba(170,235,255,.28)'; [88, 168].forEach(x => { bulat(x, cy, 44); g.fill(); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 5; g.beginPath(); g.arc(x, cy, 34, 3.6, 4.5); g.stroke(); g.strokeStyle = '#2fb4c9'; g.lineWidth = 8; }); }
      g.strokeStyle = kiri ? '#5a3a1a' : '#3b140c'; g.lineWidth = kiri ? 8 : 11; g.lineCap = 'round'; g.beginPath(); // alis
      const alis = mood === 'senang' ? [-56, -60] : mood === 'cemas' || (kiri && mood === 'usaha') ? [-40, -66] : [-66, -40], dy = kiri ? -8 : 0;
      g.moveTo(50, cy + alis[0] + dy); g.lineTo(114, cy + alis[1] + dy); g.moveTo(206, cy + alis[0] + dy); g.lineTo(142, cy + alis[1] + dy); g.stroke();
      g.strokeStyle = '#4a3320'; g.lineWidth = 6; g.fillStyle = '#8a1f2f';
      if (mood === 'senang') { g.beginPath(); g.moveTo(92, 256); g.quadraticCurveTo(128, 318, 164, 256); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#ff7a96'; g.beginPath(); g.ellipse(128, 284, 20, 10, 0, 0, 7); g.fill(); }
      else if (mood === 'cemas') { g.beginPath(); g.ellipse(128, 272, 16, 21, 0, 0, 7); g.fill(); g.stroke(); }
      else if (kiri) { g.beginPath(); g.moveTo(98, 278); g.quadraticCurveTo(128, 252, 158, 278); g.stroke(); }
      else { g.fillStyle = '#fff'; g.fillRect(94, 258, 68, 28); g.strokeRect(94, 258, 68, 28); g.lineWidth = 3; g.beginPath(); [111, 128, 145].forEach(x => { g.moveTo(x, 258); g.lineTo(x, 286); }); g.stroke(); }
      g.fillStyle = 'rgba(247,217,107,.95)'; g.font = '40px "Lilita One", sans-serif'; g.textAlign = 'center'; g.fillText('ABC', 128, 338);
    });
  })();

  function buatBuku(p, i, menang) {
    const s = p.tim === 'k' ? 1 : -1, cv = TIM[p.tim].cover[i % 3], cp = TIM[p.tim].cape, g3 = new THREE.Group(), B = new THREE.Group(); g3.add(B);
    const sm = mat(cv), depan = mat(0xffffff, { map: wajah(p.tim, cv, 'usaha') });
    B.add(mesh(U.box, [sm, sm, sm, sm, depan, sm], 0, 0, .17, 1, 1.5, .12), mesh(U.box, sm, 0, 0, -.17, 1, 1.5, .12), // sampul depan (bermuka) & belakang
      mesh(U.box, mat(new THREE.Color(cv).multiplyScalar(.6)), -.5, 0, 0, .12, 1.52, .5), // punggung buku
      mesh(U.box, mat(0xfff4d6), .03, 0, 0, .86, 1.38, .26), // halaman
      mesh(U.box, mat(0xe0344f), .22, -.88, .2, .1, .34, .03)); // pita pembatas
    const jubah = new THREE.Group(); jubah.position.set(0, .7, -.25); jubah.rotation.x = .22;
    const kj = new THREE.Mesh(U.jubah, new THREE.MeshLambertMaterial({ color: cp, side: THREE.DoubleSide })); kj.castShadow = true; jubah.add(kj); B.add(jubah);
    [-.22, .22].forEach(x => B.add(mesh(U.cyl, mat(0x6b4423), x, -1.03, 0, .1, .56, .1), mesh(U.box, mat(0x35210f), x, -1.3, .07, .27, .15, .42))); // kaki + sepatu
    // badan menghadap tali (3/4) sehingga muka terlihat; titik pegangan tangan (pivot g3) ada di tali
    menang ? B.position.set(0, .325, 0) : (B.position.set(-.55 * s, .325, -.42), B.rotation.y = s * .62);
    B.updateMatrix();
    const lg = mat(cp), kul = mat(0xffd9ae), sg = mat(0xfff7e6), bahu = x => V3(x * .5, .42, 0).applyMatrix4(B.matrix);
    let sb = [bahu(1), bahu(-1)], tg;
    if (menang) tg = sb.map((b, k) => b.clone().add(V3((k ? -1 : 1) * .5, .8, .08))); // tangan diangkat
    else { sb.sort((a, b) => (b.x - a.x) * s); tg = [V3(.3 * s), V3(-.14 * s)]; } // dua tangan di tali: depan & belakang
    sb.forEach((a, k) => {
      const b = tg[k], sk = a.clone().lerp(b, .5).add(menang ? V3((a.x < 0 ? -1 : 1) * .22, .05, 0) : V3(-s * .08, -.16, .2));
      g3.add(ruas(a, sk, .085, lg), ruas(sk, b, .075, lg), mesh(U.sph, lg, sk.x, sk.y, sk.z, .1), mesh(U.sph, kul, b.x, b.y, b.z, .15));
      if (!menang) { const r = mesh(U.tor, sg, b.x, b.y, b.z, .19); r.rotation.y = Math.PI / 2; g3.add(r); } // sarung tangan melingkari tali
    });
    const lab = document.createElement('div'); lab.className = 'nama ' + p.tim; lab.textContent = p.nama; $('#label').append(lab);
    return { G: g3, B, cape: jubah, front: depan, p, s, i, cv, lean: .12, menang, lab };
  }

  function bersih3d() {
    if (!R) return;
    ['TG', 'PG'].forEach(k => { R[k] && R.scene.remove(R[k]); R[k] = null; }); // shortcut: geometri/material tidak di-dispose, kebocoran kecil per ronde
    $('#label').innerHTML = ''; pemain3d = []; aktif = null; R.mode = 'game'; aturKamera();
  }
  function pasangPemain() {
    bersih3d();
    const TG = new THREE.Group(); R.scene.add(TG); R.TG = TG;
    const sisi = (arr, s) => arr.map((p, i) => { const r = buatBuku(p, i, false); r.G.position.set(-s * (1.25 + i * 1.6), 1.05, 0); TG.add(r.G); return r; });
    pemain3d = [...sisi(G.kiri, 1), ...sisi(G.kanan, -1)];
    const a = -(1.25 + (G.kiri.length - 1) * 1.6) - 1, b = 1.25 + (G.kanan.length - 1) * 1.6 + 1, pts = [];
    for (let x = a; x <= b + .001; x += .25) pts.push(V3(x, 1.05 - .11 * Math.max(0, 1 - (x / .9) ** 2), 0)); // tali lurus, melorot sedikit di tengah
    const tex = kanvas(64, 16, (g, w, h) => { g.fillStyle = '#c9a05c'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a6a38'; for (let x = -16; x < w; x += 16) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 8, h); g.lineTo(x + 16, 0); g.lineTo(x + 8, 0); g.fill(); } });
    tex.wrapS = THREE.RepeatWrapping; tex.repeat.set((b - a) * 3, 1);
    TG.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, .075, 8), mat(0xffffff, { map: tex })));
    [a, b].forEach(x => TG.add(mesh(U.sph, mat(0x7a5a2c), x, 1.05, 0, .11)));
    const pita = new THREE.Mesh(U.pita, new THREE.MeshLambertMaterial({ color: 0xe0344f, side: THREE.DoubleSide })); pita.position.set(0, .95, .02); pita.castShadow = true;
    R.ring = new THREE.Mesh(new THREE.RingGeometry(.5, .72, 36), new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: .9, side: THREE.DoubleSide })); R.ring.rotation.x = -Math.PI / 2; R.ring.visible = false;
    TG.add(pita, mesh(U.sph, mat(0xffc23c), 0, .96, 0, .14), R.ring);
    Object.assign(A, { x: 0, v: 0, tarik: 0, sorak: 0, salah: 0 }); suasana();
  }
  function suasana() { // ekspresi muka: unggul = senang, tertinggal = cemas
    const lead = G ? G.pos / 100 : 0;
    pemain3d.forEach(r => {
      const u = r.p.tim === 'k' ? lead : -lead, m = wajah(r.p.tim, r.cv, r.menang || u > .001 ? 'senang' : u < -.001 ? 'cemas' : 'usaha');
      if (r.front.map !== m) r.front.map = m;
    });
  }
  function fokus(p) {
    aktif = pemain3d.find(r => r.p === p); pemain3d.forEach(r => r.lab.classList.toggle('aktif', r === aktif));
    if (aktif && R.ring) { R.ring.visible = true; R.ring.position.set(aktif.G.position.x - .55 * aktif.s, .04, -.42); }
  }

  function podium3d(top) {
    if (!R) return;
    R.TG.visible = false; $('#label').innerHTML = ''; pemain3d = []; aktif = null; R.mode = 'podium'; aturKamera();
    const PG = new THREE.Group(); R.scene.add(PG); R.PG = PG;
    const tinggi = [2.3, 1.6, 1.1], warna = [0xf5b301, 0xb8c2d1, 0xc9803f], xs = [0, -2.7, 2.7];
    top.forEach((p, r) => {
      PG.add(mesh(U.box, mat(warna[r]), xs[r], tinggi[r] / 2, 0, 2.3, tinggi[r], 2.1));
      const angka = kanvas(128, 128, g => { g.font = '100px "Lilita One", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,.35)'; g.fillStyle = '#fff'; g.strokeText(r + 1, 64, 70); g.fillText(r + 1, 64, 70); });
      const plat = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), basic(0xffffff, { map: angka, transparent: true })); plat.position.set(xs[r], tinggi[r] / 2, 1.07); PG.add(plat);
      const b = buatBuku(p, p.id, true); b.base = tinggi[r] + 1.05; b.G.position.set(xs[r], b.base, 0); b.lab.insertAdjacentHTML('beforeend', `<small>${p.skor} benar</small>`); PG.add(b.G); pemain3d.push(b);
    });
    const sinar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3.4, 12, 24, 1, true), basic(0xffe98a, { transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false })); sinar.position.set(0, 6, -1.4); PG.add(sinar);
    suasana();
  }

  /* ================= 3D: LOOP ================= */
  const vt = V3();
  function loop(ms) {
    requestAnimationFrame(loop);
    if (!R || !R.el.clientWidth) return;
    const t = ms / 1000, dt = Math.min(.05, t - (R.t0 ?? t)); R.t0 = t;
    A.tarik = Math.max(0, A.tarik - dt); A.sorak = Math.max(0, A.sorak - dt); A.salah = Math.max(0, A.salah - dt);
    R.sorak(t, A.sorak > 0 || R.mode === 'podium');
    R.awan.forEach(a => { a.position.x += dt * .9; if (a.position.x > 100) a.position.x = -100; });
    R.baling.rotation.z -= dt * .7;
    R.balon.forEach(b => { b.position.x += dt * .5; if (b.position.x > 90) b.position.x = -90; b.position.y = b.userData.y + Math.sin(t * .6 + b.userData.ph) * .8; });
    R.blok.forEach(b => { b.rotation.y += dt * .4; b.rotation.x = Math.sin(t * .5 + b.userData.ph) * .3; b.position.y = b.userData.y + Math.sin(t * .8 + b.userData.ph) * .7; });
    const k = 1 - Math.exp(-dt * 3); R.cp.lerp(R.camTo, k); R.look.lerp(R.lookTo, k);
    R.camera.position.set(R.cp.x + Math.sin(t * .35) * .35, R.cp.y + Math.sin(t * .5) * .08, R.cp.z); R.camera.lookAt(R.look);
    if (R.TG?.visible && G) { // tali & pemain: pegas bergerak ke posisi tarik
      A.v += (-G.pos / 100 * D - A.x) * 55 * dt; A.v *= Math.exp(-5.5 * dt); A.x += A.v * dt; R.TG.position.x = A.x;
      const e = Math.min(1, A.tarik), lead = G.pos / 100;
      pemain3d.forEach(r => {
        const u = r.p.tim === 'k' ? lead : -lead;
        r.lean += (.12 + .22 * Math.max(u, 0) - r.lean) * Math.min(1, dt * 4);
        r.G.rotation.z = r.s * (r.lean + Math.sin(t * 20 + r.i) * .03 * e) + (A.salah > 0 && r === aktif ? Math.sin(t * 40) * .07 : 0);
        r.cape.rotation.x = .22 + Math.sin(t * 6 + r.i) * (.05 + .1 * e);
        r.B.position.y = .325 + (r === aktif ? Math.abs(Math.sin(t * 5)) * .09 : 0);
      });
      if (R.ring.visible) R.ring.scale.setScalar(1 + Math.sin(t * 6) * .08);
    }
    if (R.PG) { pemain3d.forEach(r => { r.G.position.y = r.base + Math.abs(Math.sin(t * 4 + r.i * 1.3)) * .22; r.cape.rotation.x = .2 + Math.sin(t * 8 + r.i) * .12; }); }
    const w = R.el.clientWidth, h = R.el.clientHeight;
    pemain3d.forEach(r => { // label nama mengikuti kepala maskot
      r.B.getWorldPosition(vt); vt.y += r.menang ? 1.7 : 1.05; vt.project(R.camera);
      r.lab.style.translate = `${(vt.x * .5 + .5) * w}px ${(-vt.y * .5 + .5) * h - (r.menang ? 0 : (r.i % 2) * 24)}px`;
    });
    R.renderer.render(R.scene, R.camera);
  }

  /* ================= PERMAINAN ================= */
  function mulai(pl) {
    suaraAda && speechSynthesis.cancel(); tumpukan = {};
    const kiri = pl.filter(p => p.tim === 'k'), kanan = pl.filter(p => p.tim === 'r');
    G = { pl, kiri, kanan, pos: 0, i: 0, total: S.soal, step: 100 / Math.ceil(S.soal / 2), kunci: false };
    tampil('main');
    if (init3d()) { aturTema(); ukur(); pasangPemain(); aturKamera(true); }
    hud(); tanya();
  }
  const jml = t => t.reduce((a, p) => a + p.skor, 0);
  function hud() {
    $('#sk').textContent = `Kiri ${jml(G.kiri)}`; $('#sr').textContent = `Kanan ${jml(G.kanan)}`;
    $('#info').textContent = `Soal ${Math.min(G.i + 1, G.total)} / ${G.total}`; $('#bar').style.width = (G.i / G.total * 100) + '%';
  }
  const undi = (kunci, arr) => (tumpukan[kunci] = tumpukan[kunci]?.length ? tumpukan[kunci] : acak([...arr])).pop(); // tidak ada soal ganda sampai bank habis
  const lain = (arr, x, n) => acak(arr.filter(v => v !== x)).slice(0, n);

  function buatSoal() {
    const jenis = S.jenis === 'gabungan' ? (Math.random() < .5 ? 'huruf' : 'kata') : S.jenis;
    if (jenis === 'kata') {
      const k = undi('kata', KATA);
      return { label: 'Tebak Kata', besar: `<svg viewBox="0 0 64 64" aria-hidden="true">${GAMBAR[k]}</svg>`, teks: 'Gambar apa ini?', sub: 'Pilih kata yang tepat', suara: 'Gambar apakah ini? Pilih katanya!', benar: k, opsi: acak([k, ...lain(KATA, k, 3)]) };
    }
    const h = undi('huruf', HURUF);
    if (!bisu && suaraAda && Math.random() < .5) // mode dengar hanya bila suara aktif
      return { label: 'Dengar Huruf', besar: `<span class="besar__ikon">${IK.suara}</span>`, teks: 'Huruf apa yang disebut?', sub: 'Dengarkan baik-baik', suara: `Huruf apa yang kamu dengar? Huruf ${h}`, benar: h, opsi: acak([h, ...lain(HURUF, h, 3)]) };
    const kecil = h.toLowerCase();
    return { label: 'Tebak Huruf', besar: `<span class="abjad">${h}</span>`, teks: 'Mana huruf kecilnya?', sub: 'Pilih pasangan huruf ini', suara: `Pilih huruf kecil dari huruf ${h}`, benar: kecil, opsi: acak([kecil, ...lain(HURUF, h, 3).map(x => x.toLowerCase())]) };
  }

  function tanya() {
    const tim = G.i % 2 ? G.kanan : G.kiri, p = tim[(G.i >> 1) % tim.length]; // giliran selang-seling antar tim, pemain berputar
    G.p = p; G.s = buatSoal(); G.kunci = false; hud();
    const g = $('#giliran'); g.innerHTML = '<b></b><span></span>'; g.firstChild.textContent = p.nama; g.lastChild.textContent = `${TIM[p.tim].nama} — giliranmu!`;
    g.style.background = `linear-gradient(135deg, ${TIM[p.tim].warna}, ${p.tim === 'k' ? '#12a9d9' : '#ff8a3d'})`;
    $('#tJenis').textContent = G.s.label; $('#tBesar').innerHTML = G.s.besar; $('#tBesar').classList.toggle('besar--huruf', G.s.label === 'Tebak Huruf'); $('#tTeks').textContent = G.s.teks; $('#tSub').textContent = G.s.sub;
    const o = $('#opsi'); o.innerHTML = ''; o.classList.toggle('abjad', G.s.opsi[0].length === 1); // pilihan huruf dibuat lebih besar
    G.s.opsi.forEach((v, n) => { const b = document.createElement('button'); b.dataset.v = v; b.innerHTML = `<span class="kunci">${'ABCD'[n]}</span><span class="teks"></span>`; b.lastChild.textContent = v; b.onclick = () => jawab(b, v); o.append(b); });
    R && fokus(p);
    bicara(`Giliran ${p.nama}. ${G.s.suara}`);
  }

  function jawab(btn, v) {
    if (G.kunci) return; G.kunci = true; suaraAda && speechSynthesis.cancel();
    const ok = v === G.s.benar, p = G.p, g = G;
    $$('#opsi button').forEach(b => { b.disabled = true; b.classList.toggle('benar', b.dataset.v === G.s.benar); });
    if (!ok) btn.classList.add('salah');
    if (ok) { // tim yang benar menarik tali ke sisinya
      p.skor++; G.pos = Math.max(-100, Math.min(100, G.pos + (p.tim === 'k' ? 1 : -1) * G.step)); A.tarik = 1.4; A.sorak = 1.8; sfx.benar(); suasana();
    } else { A.salah = .7; sfx.salah(); }
    hud();
    setTimeout(() => { if (g !== G) return; Math.abs(G.pos) >= 100 || ++G.i >= G.total ? akhir() : tanya(); }, 1700);
  }

  /* ================= PODIUM ================= */
  function akhir() {
    const seri = G.pos === 0, kiri = G.pos > 0, tim = seri ? G.pl : kiri ? G.kiri : G.kanan;
    const top = [...tim].sort((a, b) => b.skor - a.skor).slice(0, 3); // pemenang: anggota tim menang, urut skor (seri: 3 terbaik kedua tim)
    $('#juaraIk').innerHTML = seri ? IK.seri : IK.piala;
    $('#juara').textContent = seri ? 'Seri!' : `${TIM[kiri ? 'k' : 'r'].nama} Menang!`;
    $('#skorAkhir').textContent = `Kiri ${jml(G.kiri)} — ${jml(G.kanan)} Kanan`;
    $('#konfeti').innerHTML = Array.from({ length: 50 }, () => `<i style="--x:${Math.random() * 100}%;--d:${(-Math.random() * 3).toFixed(2)}s;--c:hsl(${Math.random() * 360 | 0} 90% 60%)"></i>`).join('');
    tampil('akhir'); podium3d(top); sfx.menang(); bicara(seri ? 'Seri! Kalian sama hebat!' : `${TIM[kiri ? 'k' : 'r'].nama} menang! Selamat!`);
  }
  $('#lagi').onclick = () => { $('#konfeti').innerHTML = ''; mulai(muat()); }; // main lagi dengan pemain & pengaturan yang sama
  $('#kembali').onclick = () => $('#dlgKeluar').showModal(); // konfirmasi keluar berupa popup
  $('#keluarBatal').onclick = () => $('#dlgKeluar').close();
  $('#keluarYa').onclick = () => { suaraAda && speechSynthesis.cancel(); G = null; location.href = beranda; };
  $('#ulang').onclick = () => G && bicara(`Giliran ${G.p.nama}. ${G.s.suara}`);
  $('#bisu').onclick = e => { bisu = !bisu; e.currentTarget.innerHTML = bisu ? IK.bisu : IK.suara; suaraAda && speechSynthesis.cancel(); };
  addEventListener('keydown', e => { // pilih jawaban dengan tombol 1-4 atau A-D
    if (!G || G.kunci || $('#panel').hidden || document.querySelector('dialog[open]')) return;
    const n = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
    if (e.key.length === 1 && n >= 0) $$('#opsi button')[n]?.click();
  });
  requestAnimationFrame(() => mulai(muat()));
})();