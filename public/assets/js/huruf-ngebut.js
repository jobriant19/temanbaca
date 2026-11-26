/* Huruf Ngebut: seluruh logika game dalam satu berkas.
 *  1. Soal   : data huruf/kata & pembuat soal (tanpa DOM)
 *  2. Suara  : ucapan bahasa Indonesia (Web Speech) + efek bunyi (WebAudio)
 *  3. Dunia  : arena, karakter, gerbang, efek 3D (three.js)
 *  4. Game   : alur permainan, HUD, dialog, kendali
 * Dimuat malas oleh huruf-ngebut.blade.php saat tombol Bermain disentuh/diklik. */
import * as THREE from '../vendor/three/three.module.js';

/* ============================================================
   1. SOAL
   ============================================================ */
// Jarak (satuan dunia 3D) gerbang pertama dan antar-baris gerbang
const JARAK_AWAL = 70, JARAK_BARIS = 56;

export const TINGKAT = {
    mudah:  { nama: 'Mudah',  nyawa: 5, gerbang: 8,  laju: 10,   mirip: 0 },
    sedang: { nama: 'Sedang', nyawa: 4, gerbang: 12, laju: 12.5, mirip: 1 },
    sulit:  { nama: 'Sulit',  nyawa: 3, gerbang: 16, laju: 15,   mirip: 2 },
};

// Cara baca nama huruf dalam bahasa Indonesia (dipakai untuk suara; ditulis agar mesin suara melafalkannya jelas)
const HURUF = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// Huruf yang bentuk/bunyinya mirip: dipakai sebagai pengecoh di tingkat sedang & sulit
const MIRIP_HURUF = ['BDPQ', 'MNW', 'UVY', 'ILJ', 'CEO', 'GQY', 'HNR', 'SZ', 'FTL', 'KXY', 'AEO'];

// shortcut: ~70 kata ditulis manual di sini; upgrade: pindahkan ke config/gamifikasi.php atau database bila butuh ratusan kata / tiap kelas berbeda.
// Kelompok kata yang ejaannya mirip (pengecoh tingkat sulit). Semua kata baku, ramah anak.
const KELOMPOK_KATA = [
    ['bola', 'bala', 'bulu', 'bila'], ['buku', 'buka', 'baku', 'kuku'], ['kaki', 'kali', 'kaku', 'kaca'],
    ['baju', 'bahu', 'batu', 'baru'], ['sapi', 'sapu', 'sapa', 'sari'], ['mata', 'mati', 'mama', 'mana'],
    ['tali', 'tapi', 'tari', 'tiba'], ['kuda', 'kubu', 'kuas', 'kutu'], ['ayam', 'ayah', 'ayat', 'ayun'],
    ['roti', 'rata', 'rasa', 'rawa'], ['daun', 'dadu', 'dasi', 'dana'], ['ikan', 'ikat', 'iman', 'ikal'],
    ['nasi', 'nada', 'nama', 'nusa'], ['rumah', 'ramah', 'rumput', 'rumbai'], ['tahu', 'tamu', 'tadi', 'tabu'],
    ['gula', 'guru', 'gulai', 'gurun'], ['topi', 'tipi', 'tepi', 'tolak'], ['meja', 'mega', 'maju', 'mulai'],
    ['pita', 'pipa', 'pita', 'pintu'], ['susu', 'sisi', 'sosis', 'sasa'],
].map((k) => [...new Set(k)]).filter((k) => k.length >= 3);
const SEMUA_KATA = [...new Set(KELOMPOK_KATA.flat())];

const acak = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const ambil = (a, n) => acak(a).slice(0, n);
const kapital = (k) => k[0].toUpperCase() + k.slice(1);

function pengecohHuruf(target, mirip) {
    const grup = MIRIP_HURUF.filter((g) => g.includes(target)).join('').split('');
    const dekat = [...new Set(grup)].filter((h) => h !== target);
    const jauh = HURUF.filter((h) => h !== target && !dekat.includes(h));
    const dekatDipakai = mirip === 2 ? 2 : mirip === 1 ? 1 : 0;
    return [...ambil(dekat, dekatDipakai), ...ambil(jauh, 2)].slice(0, 2);
}

function pengecohKata(target, mirip) {
    const grup = KELOMPOK_KATA.find((g) => g.includes(target)) || [];
    const dekat = grup.filter((k) => k !== target);
    const jauh = SEMUA_KATA.filter((k) => k !== target && !dekat.includes(k) && Math.abs(k.length - target.length) <= 1);
    const dekatDipakai = mirip === 2 ? 2 : mirip === 1 ? 1 : 0;
    const hasil = [...ambil(dekat, dekatDipakai)];
    return [...hasil, ...ambil(jauh, 2 - hasil.length)].slice(0, 2);
}

/** Buat daftar baris soal. Tiap target unik dalam satu permainan (tidak ada suara yang berulang). */
export function buatSoal({ jenis, tingkat }) {
    const t = TINGKAT[tingkat] || TINGKAT.mudah;
    const n = t.gerbang;
    const jumlahHuruf = jenis === 'huruf' ? n : jenis === 'kata' ? 0 : Math.ceil(n / 2);
    const tipe = acak([...Array(jumlahHuruf).fill('huruf'), ...Array(n - jumlahHuruf).fill('kata')]);
    const hurufPool = acak(HURUF), kataPool = acak(SEMUA_KATA);

    return tipe.map((jt) => {
        let target, label, ucapan, pengecoh;
        if (jt === 'huruf') {
            target = hurufPool.pop();
            const kecil = tingkat === 'sulit' && Math.random() < 0.5; // tingkat sulit: huruf kecil/besar diacak per baris
            const f = (h) => (kecil ? h.toLowerCase() : h);
            pengecoh = pengecohHuruf(target, t.mirip);
            label = [target, ...pengecoh].map(f);
            ucapan = `Cari huruf ${target}.`;   // huruf besar tunggal: mesin suara bahasa Indonesia mengejanya sebagai nama huruf Indonesia (be, ce, de, ...)
            target = f(target);
        } else {
            target = kataPool.pop();
            pengecoh = pengecohKata(target, t.mirip);
            label = [target, ...pengecoh].map(kapital);
            ucapan = `Cari kata, ${target}.`;
            target = kapital(target);
        }
        const urutan = acak([0, 1, 2]);                // posisi jalur acak
        const susunan = urutan.map((i) => label[i]);
        return { tipe: jt, label: susunan, benar: urutan.indexOf(0), teks: target, ucapan };
    });
}

/* ============================================================
   2. SUARA
   ============================================================ */
const suara = (() => {

    // shortcut: ucapan memakai Web Speech API bawaan peramban; ada tidaknya & mutu suara Indonesia bergantung perangkat (teks soal otomatis ditampilkan bila tidak ada).
    // upgrade: rekam audio per huruf/kata (berkas .mp3) bila pelafalan harus seragam di semua perangkat.
    const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    let suaraId = null, aktif = true, pengatur = 0, terakhir = { teks: '', waktu: 0 };
    let ctx = null, induk = null;

    const pilihSuara = () => {
        const daftar = synth ? synth.getVoices() : [];
        const norm = (v) => v.lang.toLowerCase().replace('_', '-');
        suaraId = daftar.find((v) => norm(v) === 'id-id') || daftar.find((v) => norm(v).startsWith('id')) || null;
        return suaraId;
    };
    if (synth) { pilihSuara(); synth.addEventListener?.('voiceschanged', pilihSuara); }

    const adaUcapan = () => !!synth;
    const adaSuaraIndonesia = () => !!suaraId;
    const namaSuara = () => (suaraId ? suaraId.name : '');
    const apakahAktif = () => aktif;
    const setAktif = (v) => { aktif = !!v; if (!aktif) diam(); if (induk) induk.gain.value = aktif ? 0.9 : 0; };

    /** Ucapkan satu kalimat. Selalu membatalkan ucapan sebelumnya, sehingga tidak pernah bertumpuk/ganda. */
    function ucap(teks, { paksa = false } = {}) {
        if (!synth || !aktif || !teks) return;
        const sekarang = performance.now();
        if (!paksa && terakhir.teks === teks && sekarang - terakhir.waktu < 700) return; // cegah panggilan ganda beruntun
        terakhir = { teks, waktu: sekarang };
        clearTimeout(pengatur);
        synth.cancel();
        pengatur = setTimeout(() => { // jeda singkat: Chrome kadang membuang ucapan yang dikirim tepat setelah cancel()
            const u = new SpeechSynthesisUtterance(teks);
            u.lang = 'id-ID';
            if (suaraId || pilihSuara()) u.voice = suaraId;
            u.rate = 0.82; u.pitch = 1.08; u.volume = 1;
            synth.speak(u);
        }, 90);
    }
    function diam() { clearTimeout(pengatur); synth?.cancel(); }

    /* ---------- Efek bunyi sintetis ---------- */
    function buka() { // panggil dari klik pengguna
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            ctx = new AC();
            induk = ctx.createGain(); induk.gain.value = aktif ? 0.9 : 0; induk.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') ctx.resume();
    }

    function nada(frek, mulai, dur, { tipe = 'triangle', vol = 0.25, ke = null, geser = 0 } = {}) {
        if (!ctx) return;
        const t = ctx.currentTime + mulai, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = tipe; o.frequency.setValueAtTime(frek, t);
        if (geser) o.frequency.exponentialRampToValueAtTime(Math.max(30, frek + geser), t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(induk); o.start(t); o.stop(t + dur + 0.05);
    }
    function desis(mulai, dur, { vol = 0.2, dari = 3000, ke = 300 } = {}) {
        if (!ctx) return;
        const t = ctx.currentTime + mulai, n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = buf; f.type = 'bandpass'; f.frequency.setValueAtTime(dari, t); f.frequency.exponentialRampToValueAtTime(ke, t + dur);
        g.gain.value = vol; s.connect(f); f.connect(g); g.connect(induk); s.start(t);
    }

    const bunyi = {
        geser: () => desis(0, 0.16, { vol: 0.12, dari: 1800, ke: 500 }),
        benar: () => { [523, 659, 784, 1047].forEach((f, i) => nada(f, i * 0.07, 0.35, { vol: 0.22 })); nada(1568, 0.3, 0.5, { tipe: 'sine', vol: 0.12 }); },
        salah: () => { desis(0, 0.28, { vol: 0.35, dari: 700, ke: 80 }); nada(180, 0, 0.45, { tipe: 'sawtooth', vol: 0.2, geser: -110 }); nada(130, 0.12, 0.4, { tipe: 'square', vol: 0.1, geser: -70 }); },
        hitung: (akhir) => nada(akhir ? 880 : 440, 0, akhir ? 0.5 : 0.18, { tipe: 'sine', vol: 0.25 }),
        menang: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => nada(f, i * 0.12, 0.3, { vol: 0.22 })); },
        kalah: () => { [392, 330, 262, 196].forEach((f, i) => nada(f, i * 0.2, 0.4, { tipe: 'sine', vol: 0.22 })); },
    };
    return { adaUcapan, adaSuaraIndonesia, namaSuara, apakahAktif, setAktif, ucap, diam, buka, bunyi };
})();

/* ============================================================
   3. DUNIA 3D
   ============================================================ */
const JALUR = [-2.8, 0, 2.8];
const PANJANG = 60, JUMLAH_CHUNK = 7, SLOT = 3;
const WARNA_JALUR = [0xff5d8f, 0x35b6ff, 0x5be37d];
const WARNA_PESTA = [0xff4f86, 0xffc400, 0x35b6ff, 0x5be37d, 0xb46bff, 0xff8a3d];
const FONT = '"Lilita One", "Fredoka", "Baloo 2", system-ui, sans-serif';

const rand = (a, b) => a + Math.random() * (b - a);
const pilih = (a) => a[Math.floor(Math.random() * a.length)];
const halus = (x) => x * x * (3 - 2 * x);
const tepi = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const kanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const tekstur = (c, o = {}) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return Object.assign(t, o); };
const bulat = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const bentukBulat = (w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
const bentukBintang = (r1, r2, n = 5) => { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return s; };

/** Gabungkan beberapa bentuk berwarna jadi satu geometri (warna per titik): satu pohon utuh = satu draw call. */
function gabung(bagian) {
    const pos = [], nor = [], col = [], mat = new THREE.Matrix4(), c = new THREE.Color();
    for (const { geo, warna, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] } of bagian) {
        const g = geo.index ? geo.toNonIndexed() : geo.clone();
        mat.compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s)); g.applyMatrix4(mat);
        c.set(warna).offsetHSL(rand(-.012, .012), 0, rand(-.035, .035));
        const P = g.attributes.position.array, N = g.attributes.normal.array;
        for (let i = 0; i < P.length; i += 3) { pos.push(P[i], P[i + 1], P[i + 2]); nor.push(N[i], N[i + 1], N[i + 2]); col.push(c.r, c.g, c.b); }
        g.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return out;
}
const bola = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);
const batang = (r1, r2, t, sisi = 7) => new THREE.CylinderGeometry(r1, r2, t, sisi);
/** Cabang yang miring: pangkal di (0,y,0), arah ditentukan sudut rz (samping) dan rx (depan). */
const cabang = (y, rz, rx, panjang, warna, r1 = .05, r2 = .1) => ({ geo: batang(r1, r2, panjang, 6), warna, p: [-Math.sin(rz) * panjang / 2, y + Math.cos(rz) * Math.cos(rx) * panjang / 2, Math.cos(rz) * Math.sin(rx) * panjang / 2], r: [rx, 0, rz] });
const titikKulit = (pusat, jari, kunci = 1) => { const a = Math.random() * 6.283, b = Math.acos(rand(.1, 1) * kunci); return [pusat[0] + Math.sin(b) * Math.cos(a) * jari, pusat[1] + Math.cos(b) * jari, pusat[2] + Math.sin(b) * Math.sin(a) * jari]; };

/** Pohon pinus bertingkat: batang berakar, 6 tingkat daun berpilin, bola hias warna-warni, bintang di puncak */
function pohonPinus() {
    const hijau = [0x1c8f50, 0x27ad63, 0x35c677, 0x4ad88a, 0x66e3a0], b = [{ geo: batang(.13, .24, 1.1), warna: 0x7a4a2a, p: [0, .55, 0] }];
    for (const a of [0, 2.1, 4.2]) b.push({ geo: batang(.04, .1, .5, 5), warna: 0x7a4a2a, p: [Math.cos(a) * .22, .1, Math.sin(a) * .22], r: [Math.sin(a) * .9, 0, -Math.cos(a) * .9] });   // akar
    for (let i = 0; i < 6; i++) {
        const rad = 1.2 - i * .17, tinggi = 1 - i * .06, y = .85 + i * .52; b.push({ geo: new THREE.ConeGeometry(rad, tinggi, 9), warna: hijau[i % 5], p: [0, y, 0], r: [0, i * .45, 0] });
        for (let k = 0; k < 2; k++) { const a = rand(0, 6.28); b.push({ geo: bola(.085, 0), warna: pilih([0xff4f86, 0xffd84a, 0x35b6ff, 0xff8a3d, 0xffffff]), p: [Math.cos(a) * rad * .72, y - tinggi / 2 + .18, Math.sin(a) * rad * .72] }); }   // bola hias
    }
    b.push({ geo: new THREE.OctahedronGeometry(.17), warna: 0xffd84a, p: [0, 3.95, 0], s: [1, 1.7, 1] });
    return gabung(b);
}
/** Pohon rindang: batang bercabang, tajuk dari gugusan bola, dahan daun kecil, buah & bunga */
function pohonRindang() {
    const b = [{ geo: batang(.17, .3, 1.6, 8), warna: 0x8a5a36, p: [0, .8, 0] }, cabang(1.2, .75, 0, 1.0, 0x8a5a36), cabang(1.3, -.8, .5, .9, 0x8a5a36), cabang(1.0, .2, -.8, .9, 0x8a5a36), cabang(1.4, -.3, .7, .8, 0x8a5a36)];
    for (const a of [0, 2.1, 4.2]) b.push({ geo: batang(.05, .12, .6, 5), warna: 0x7a4a2a, p: [Math.cos(a) * .3, .12, Math.sin(a) * .3], r: [Math.sin(a) * 1.0, 0, -Math.cos(a) * 1.0] });
    const hijau = [0x1f9d55, 0x2fbf71, 0x45d98a, 0x6be39f], gugus = [[0, 2.9, 0, 1.2], [-1, 2.4, .3, .85], [1, 2.5, -.2, .9], [.2, 2.3, 1, .8], [-.3, 2.6, -1, .85], [.6, 3.5, .4, .75], [-.6, 3.4, -.3, .75], [1.2, 2.0, .7, .55]];
    gugus.forEach(([x, y, z, r], i) => b.push({ geo: bola(r, 1), warna: hijau[i % 4], p: [x, y, z] }));
    for (let i = 0; i < 14; i++) { const [x, y, z, r] = pilih(gugus); b.push({ geo: bola(rand(.07, .12), 0), warna: pilih([0xff4f6b, 0xff8a3d, 0xffd84a, 0xff9ac8]), p: titikKulit([x, y, z], r * 1.02) }); }   // buah & bunga
    return gabung(b);
}
/** Pohon sakura: batang meliuk, tajuk merah muda berlapis, kelopak putih */
function pohonSakura() {
    const kayu = 0x6a3d2a, b = [{ geo: batang(.15, .26, 1.2, 8), warna: kayu, p: [0, .6, 0] }, { geo: batang(.1, .15, 1.0, 7), warna: kayu, p: [.28, 1.55, 0], r: [0, 0, -.5] }, { geo: batang(.08, .1, .9, 6), warna: kayu, p: [.72, 2.15, 0], r: [0, 0, .25] },
        cabang(1.2, -.8, .2, 1.1, kayu), cabang(1.6, .9, -.5, .8, kayu), cabang(1.4, -.2, .9, .8, kayu)];
    const merah = [0xff7fb5, 0xff9ac8, 0xffb8d9, 0xffd1e8, 0xf06aa6], gugus = [[.7, 2.9, 0, 1.15], [-.6, 2.4, .3, .9], [1.5, 2.5, -.3, .8], [.3, 2.4, 1.0, .75], [.2, 2.6, -1.0, .8], [1.0, 3.5, .5, .65], [-.2, 3.2, -.4, .7]];
    gugus.forEach(([x, y, z, r], i) => b.push({ geo: bola(r, 1), warna: merah[i % 5], p: [x, y, z] }));
    for (let i = 0; i < 16; i++) { const [x, y, z, r] = pilih(gugus); b.push({ geo: bola(rand(.05, .09), 0), warna: pilih([0xffffff, 0xfff0f6, 0xffe0ee]), p: titikKulit([x, y, z], r * 1.03) }); }
    for (let i = 0; i < 6; i++) b.push({ geo: bola(.05, 0), warna: 0xffd84a, p: [rand(-1.6, 1.8), rand(.3, 1.2), rand(-1.2, 1.2)], s: [1, .5, 1] });   // kelopak jatuh di tanah
    return gabung(b);
}
/** Hiasan tanah pulau: semak, jamur, bunga warna-warni */
function hiasanTanah(varian) {
    const b = [];
    for (let i = 0; i < 3; i++) { const a = rand(0, 6.28), d = rand(1.2, 2.9); b.push({ geo: bola(rand(.28, .45), 1), warna: pilih([0x2fbf71, 0x45d98a, 0x1f9d55]), p: [Math.cos(a) * d, .22, Math.sin(a) * d], s: [1.2, .8, 1.2] }); }
    for (let i = 0; i < 2; i++) { const a = rand(0, 6.28), d = rand(1.3, 2.7), x = Math.cos(a) * d, z = Math.sin(a) * d, tp = rand(.9, 1.3);
        b.push({ geo: batang(.05, .07, .3, 6), warna: 0xfff0cf, p: [x, .15 * tp, z], s: [tp, tp, tp] }, { geo: bola(.2, 1), warna: varian ? 0xff4f6b : 0xb46bff, p: [x, .32 * tp, z], s: [1.3 * tp, .75 * tp, 1.3 * tp] });
        for (let k = 0; k < 3; k++) { const aa = rand(0, 6.28); b.push({ geo: bola(.035, 0), warna: 0xffffff, p: [x + Math.cos(aa) * .15 * tp, .4 * tp, z + Math.sin(aa) * .15 * tp] }); } }
    for (let i = 0; i < 7; i++) { const a = rand(0, 6.28), d = rand(.8, 3.0), x = Math.cos(a) * d, z = Math.sin(a) * d, h = rand(.25, .45);
        b.push({ geo: batang(.012, .012, h, 4), warna: 0x2fa060, p: [x, h / 2, z] }, { geo: bola(.065, 0), warna: pilih([0xff4f86, 0xffd84a, 0x35b6ff, 0xffffff, 0xff8a3d]), p: [x, h + .03, z] }); }
    return gabung(b);
}

// shortcut: karakter & arena disusun dari bentuk dasar three.js (tanpa model .glb, tanpa shadow map/bloom agar ringan di HP); upgrade: ganti dengan model ilustrator bila ada aset.
/* ---------- Tekstur buatan (digambar dengan canvas, tanpa berkas gambar) ---------- */
function texCahaya() {
    const [c, g] = kanvas(128, 128), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return tekstur(c);
}
function texJalan() {
    const [c, g] = kanvas(512, 512);
    const l = g.createLinearGradient(0, 0, 512, 512); l.addColorStop(0, '#f6e6bd'); l.addColorStop(1, '#ecd5a0'); g.fillStyle = l; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(150,105,55,.35)'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 506);
    g.strokeStyle = 'rgba(150,105,55,.18)'; g.lineWidth = 2; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke(); }
    g.fillStyle = 'rgba(120,80,40,.22)'; for (let y = 40; y < 480; y += 34) for (let x = 40; x < 470; x += 120) { bulat(g, x, y, 40 + Math.random() * 60, 7, 3); g.fill(); }
    return tekstur(c, { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping });
}
function texBuku() {
    const [c, g] = kanvas(256, 256); g.fillStyle = '#3a2418'; g.fillRect(0, 0, 256, 256);
    const warna = ['#e24a6b', '#f2a33a', '#3aa6e8', '#53c47a', '#9a62e6', '#f2d24a', '#ff7a4d', '#2fb8b0'];
    for (let r = 0; r < 4; r++) {
        const y = r * 64 + 5; g.fillStyle = '#26160e'; g.fillRect(0, y + 52, 256, 8);
        for (let x = 6; x < 250;) { const w = 9 + Math.random() * 12, h = 38 + Math.random() * 14; g.fillStyle = pilih(warna); g.fillRect(x, y + 52 - h, w, h); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 2, y + 52 - h + 6, w - 4, 3); g.fillRect(x + 2, y + 52 - 8, w - 4, 2); x += w + 1.5; }
    }
    return tekstur(c, { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping });
}
function texHurufBulat(ch, warna) {
    const [c, g] = kanvas(128, 128); g.font = `900 92px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 16; g.strokeStyle = '#fff'; g.lineJoin = 'round'; g.strokeText(ch, 64, 70); g.fillStyle = warna; g.fillText(ch, 64, 70); return tekstur(c);
}
function texPlanet(a, b, c3) {
    const [c, g] = kanvas(256, 128), l = g.createLinearGradient(0, 0, 0, 128);
    [a, b, c3, b, a].forEach((w, i, arr) => l.addColorStop(i / (arr.length - 1), w)); g.fillStyle = l; g.fillRect(0, 0, 256, 128);
    g.globalAlpha = .25; for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? '#fff' : '#402060'; g.fillRect(0, Math.random() * 128, 256, 2 + Math.random() * 6); }
    return tekstur(c);
}
function texPortal() {
    const [c, g] = kanvas(128, 256), l = g.createLinearGradient(0, 256, 0, 0);
    l.addColorStop(0, 'rgba(255,255,255,.95)'); l.addColorStop(.55, 'rgba(255,255,255,.55)'); l.addColorStop(1, 'rgba(255,255,255,.18)'); g.fillStyle = l; g.fillRect(0, 0, 128, 256);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(8 + i * 18, 0); g.bezierCurveTo(30 + i * 10, 80, i * 20, 150, 12 + i * 17, 256); g.stroke(); }
    return tekstur(c, { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping });
}
function texSampulBelakang() {
    const [c, g] = kanvas(512, 640), l = g.createLinearGradient(0, 0, 512, 640); l.addColorStop(0, '#3f8cff'); l.addColorStop(1, '#2557d6'); g.fillStyle = l; g.fillRect(0, 0, 512, 640);
    g.strokeStyle = '#f6c441'; g.lineWidth = 14; bulat(g, 28, 28, 456, 584, 36); g.stroke(); g.lineWidth = 4; bulat(g, 54, 54, 404, 532, 24); g.stroke();
    g.fillStyle = '#f6c441'; g.beginPath(); g.arc(256, 300, 140, 0, 7); g.fill(); g.fillStyle = '#2b66e8'; g.beginPath(); g.arc(256, 300, 118, 0, 7); g.fill();
    g.fillStyle = '#ffe9a8'; g.font = `900 190px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A', 256, 312);
    g.fillStyle = '#f6c441'; for (const [x, y, r] of [[256, 118, 16], [118, 300, 10], [394, 300, 10], [256, 482, 16], [150, 170, 8], [362, 170, 8], [150, 430, 8], [362, 430, 8]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    return tekstur(c);
}
function texSampulDepan() {
    const [c, g] = kanvas(512, 640), l = g.createLinearGradient(0, 0, 512, 640); l.addColorStop(0, '#4a98ff'); l.addColorStop(1, '#2f66e6'); g.fillStyle = l; g.fillRect(0, 0, 512, 640);
    g.strokeStyle = '#f6c441'; g.lineWidth = 14; bulat(g, 28, 28, 456, 584, 36); g.stroke(); return tekstur(c);
}

/* ---------- Partikel (satu Points, dipakai bersama untuk konfeti, debu, percikan) ---------- */
class Partikel {
    constructor(scene, tex, maks = 700) {
        this.maks = maks; this.pos = new Float32Array(maks * 3).fill(-9999); this.warna = new Float32Array(maks * 3); this.vel = new Float32Array(maks * 3); this.umur = new Float32Array(maks); this.sisa = new Float32Array(maks); this.idx = 0;
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.warna, 3));
        this.titik = new THREE.Points(g, new THREE.PointsMaterial({ size: .42, map: tex, vertexColors: true, transparent: true, alphaTest: .3, depthWrite: false }));
        this.titik.frustumCulled = false; scene.add(this.titik); this.c = new THREE.Color();
    }
    ledak(x, y, z, n, palet = WARNA_PESTA, laju = 7, naik = 5, umur = 1.2) {
        for (let k = 0; k < n; k++) {
            const i = this.idx = (this.idx + 1) % this.maks, a = Math.random() * 6.283, b = Math.random() * 1.2, s = laju * (.35 + Math.random() * .65);
            this.pos.set([x, y, z], i * 3); this.vel.set([Math.cos(a) * s * Math.cos(b), Math.sin(b) * s + naik * Math.random(), Math.sin(a) * s * Math.cos(b)], i * 3);
            this.c.set(pilih(palet)); this.warna.set([this.c.r, this.c.g, this.c.b], i * 3); this.umur[i] = this.sisa[i] = umur * (.6 + Math.random() * .6);
        }
    }
    perbarui(dt) {
        for (let i = 0; i < this.maks; i++) {
            if (this.sisa[i] <= 0) continue; this.sisa[i] -= dt; const j = i * 3;
            if (this.sisa[i] <= 0) { this.pos[j + 1] = -9999; continue; }
            this.vel[j + 1] -= 9 * dt; this.pos[j] += this.vel[j] * dt; this.pos[j + 1] += this.vel[j + 1] * dt; this.pos[j + 2] += this.vel[j + 2] * dt;
            
        }
        this.titik.geometry.attributes.position.needsUpdate = true; this.titik.geometry.attributes.color.needsUpdate = true;
    }
}

/* ---------- Karakter: buku penyihir cilik (3D dari bentuk dasar) ---------- */
class Karakter {
    constructor(texCahayaGlobal) {
        const M = (o) => new THREE.MeshStandardMaterial(o);
        const biru = M({ color: 0x2f7cff, roughness: .38, metalness: .1 }), biruTua = M({ color: 0x1b47b8, roughness: .5 }), emas = M({ color: 0xf6c441, roughness: .26, metalness: .8, emissive: 0x3a2400 });
        const krem = M({ color: 0xfff0cf, roughness: .85 }), putih = M({ color: 0xffffff, roughness: .35 }), hitam = M({ color: 0x15102e, roughness: .3 }), coklat = M({ color: 0x7a4322, roughness: .6 });
        const sarung = M({ color: 0xffffff, roughness: .4 }), merah = M({ color: 0xff4f6b, roughness: .5 }), bajuLengan = M({ color: 0x3b86ff, roughness: .45 });
        const kulitSepatu = M({ color: 0x9a5528, roughness: .5 }), solSepatu = M({ color: 0x4a2612, roughness: .7 }), kaos = M({ color: 0xfff6e0, roughness: .8 }), garisKaos = M({ color: 0xff4f6b, roughness: .6 });
        const kapsul = (r, p, mat) => new THREE.Mesh(new THREE.CapsuleGeometry(r, p, 6, 14), mat);
        const letak = (o, x, y, z) => { o.position.set(x, y, z); return o; };

        this.root = new THREE.Group();                       // posisi di lintasan
        this.model = new THREE.Group(); this.root.add(this.model);   // lompatan / terpental
        this.badan = new THREE.Group(); this.badan.position.y = 1.5; this.model.add(this.badan);   // putar / miring

        // sampul depan (arah lari = -z) dan belakang (menghadap kamera = +z)
        const geoSampul = new THREE.ExtrudeGeometry(bentukBulat(1.4, 1.8, .17), { depth: .08, bevelEnabled: true, bevelThickness: .035, bevelSize: .035, bevelSegments: 3, curveSegments: 8 });
        geoSampul.translate(0, 0, -.04);
        const depan = new THREE.Mesh(geoSampul, biru); depan.position.z = -.2;
        const belakang = new THREE.Mesh(geoSampul, biru); belakang.position.z = .2;
        const halaman = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.7, .34), krem); halaman.position.x = .02;
        for (let i = 0; i < 5; i++) { const g = new THREE.Mesh(new THREE.BoxGeometry(1.31, .012, .35), M({ color: 0xe3c88f })); g.position.set(.02, -.7 + i * .35, 0); this.badan.add(g); }
        const punggung = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, 1.8, 18), biruTua); punggung.position.x = -.7;
        this.badan.add(depan, belakang, halaman, punggung);
        for (const y of [-.65, 0, .65]) { const cincin = new THREE.Mesh(new THREE.TorusGeometry(.255, .035, 8, 24), emas); cincin.rotation.x = Math.PI / 2; cincin.position.set(-.7, y, 0); this.badan.add(cincin); }
        const sudut = new THREE.BoxGeometry(.3, .3, .12);
        for (const sz of [-1, 1]) for (const sx of [-1, 1]) for (const sy of [-1, 1]) { if (sx < 0) continue; const s = new THREE.Mesh(sudut, emas); s.position.set(sx * .6, sy * .8, sz * .2); this.badan.add(s); }
        const hb = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 1.74), new THREE.MeshStandardMaterial({ map: texSampulBelakang(), roughness: .4, metalness: .05, transparent: true }));
        hb.position.z = .2 + .04 + .035 + .004; this.badan.add(hb);
        const hd = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 1.74), new THREE.MeshStandardMaterial({ map: texSampulDepan(), roughness: .4, transparent: true }));
        hd.rotation.y = Math.PI; hd.position.z = -.2 - .04 - .035 - .004; this.badan.add(hd);
        // sabuk kulit melingkari buku; gesper emas di DEPAN (sisi wajah), bagian belakang polos berpaku; pita-pita tetap di belakang
        const sabuk = new THREE.Mesh(new THREE.BoxGeometry(1.72, .17, .6), coklat); sabuk.position.set(-.13, -.62, 0); this.badan.add(sabuk);
        const gesper = new THREE.Mesh(new THREE.BoxGeometry(.3, .24, .05), emas); gesper.position.set(0, -.62, -.31); this.badan.add(gesper);
        const lubang = new THREE.Mesh(new THREE.BoxGeometry(.17, .12, .06), coklat); lubang.position.set(0, -.62, -.315); this.badan.add(lubang);
        const tongkat = new THREE.Mesh(new THREE.BoxGeometry(.05, .2, .02), emas); tongkat.position.set(0, -.62, -.34); this.badan.add(tongkat);
        for (const x of [-.62, -.17, .28, .6]) { const paku = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), emas); paku.position.set(x, -.62, .305); this.badan.add(paku); }
        // pita pembatas merah yang menjuntai
        this.pita = new THREE.Group(); this.pita.position.set(.3, .9, .12);
        const pitaMesh = new THREE.Mesh(new THREE.BoxGeometry(.1, .55, .02), merah); pitaMesh.position.y = -.28; this.pita.add(pitaMesh); this.badan.add(this.pita);

        // topi penyihir bermotif bintang di atas buku
        const [ct, gt] = kanvas(256, 128), lt = gt.createLinearGradient(0, 0, 0, 128); lt.addColorStop(0, '#3b2ba8'); lt.addColorStop(1, '#5a3fd0'); gt.fillStyle = lt; gt.fillRect(0, 0, 256, 128);
        gt.fillStyle = '#ffd84a'; for (const [x, y, r] of [[30, 30, 9], [95, 80, 7], [150, 28, 10], [205, 85, 8], [60, 100, 6], [230, 30, 6], [120, 55, 5]]) { gt.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, an = i * Math.PI / 5 - Math.PI / 2; gt.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } gt.closePath(); gt.fill(); }
        const matTopi = new THREE.MeshStandardMaterial({ map: tekstur(ct, { wrapS: THREE.RepeatWrapping }), roughness: .6 });
        this.topi = new THREE.Group(); this.topi.position.set(.02, .9, 0); this.badan.add(this.topi);
        const tepiTopi = new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, .06, 32), M({ color: 0x2a2f8f, roughness: .6 })); tepiTopi.position.y = .03;
        const kerucut = new THREE.Mesh(new THREE.CylinderGeometry(.14, .42, .72, 28), matTopi); kerucut.position.y = .42;
        const pitaTopi = new THREE.Mesh(new THREE.TorusGeometry(.42, .04, 8, 28), emas); pitaTopi.rotation.x = Math.PI / 2; pitaTopi.position.y = .1;
        this.ujungTopi = new THREE.Group(); this.ujungTopi.position.set(0, .76, 0);
        const ujung = new THREE.Mesh(new THREE.ConeGeometry(.15, .42, 20), matTopi); ujung.position.y = .2;
        const bola = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), emas); bola.position.y = .43; this.ujungTopi.add(ujung, bola);
        this.topi.add(tepiTopi, kerucut, pitaTopi, this.ujungTopi); this.topi.rotation.z = .1;

        // wajah di sampul depan (z negatif). Dilihat saat pembuka, selebrasi, dan akhir permainan.
        this.wajah = new THREE.Group(); this.wajah.rotation.y = Math.PI; this.wajah.position.set(.02, .1, -.2 - .04 - .035 - .01); this.badan.add(this.wajah);
        const plat = new THREE.Mesh(new THREE.ShapeGeometry(bentukBulat(1.12, 1.0, .3), 10), M({ color: 0xfff3d4, roughness: .8, emissive: 0x6a5a38, emissiveIntensity: .6 })); plat.position.z = .005; this.wajah.add(plat);
        this.mata = [];
        for (const sx of [-1, 1]) {
            const m = new THREE.Group(); m.position.set(sx * .3, .2, .02);
            const bolaMata = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 14), putih); bolaMata.scale.set(1, 1.15, .35);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(.105, 16, 12), hitam); pupil.position.set(0, -.01, .05); pupil.scale.z = .5;
            const kilau = new THREE.Mesh(new THREE.SphereGeometry(.036, 8, 6), putih); kilau.position.set(.04, .05, .09);
            const normal = new THREE.Group(); normal.add(pupil, kilau);
            const senang = new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 8, 16, Math.PI), hitam); senang.position.set(0, -.03, .07); senang.visible = false;
            const pusing = new THREE.Group(); pusing.position.z = .07; pusing.visible = false;
            for (const r of [.05, .11]) pusing.add(new THREE.Mesh(new THREE.TorusGeometry(r, .013, 6, 24), hitam));
            const kacamata = new THREE.Mesh(new THREE.TorusGeometry(.25, .03, 10, 30), M({ color: 0x3a2a1a, roughness: .35, metalness: .4 })); kacamata.position.z = .08;
            const alis = new THREE.Mesh(new THREE.BoxGeometry(.22, .045, .04), coklat); alis.position.set(0, .34, .08); alis.rotation.z = sx * .12;
            m.add(bolaMata, normal, senang, pusing, kacamata, alis); this.wajah.add(m); this.mata.push({ normal, senang, pusing, alis, sx });
            const pipi = new THREE.Mesh(new THREE.CircleGeometry(.09, 16), new THREE.MeshBasicMaterial({ color: 0xff8fa8, transparent: true, opacity: .7 })); pipi.position.set(sx * .47, -.04, .02); this.wajah.add(pipi);
        }
        const jembatan = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .16, 6), M({ color: 0x3a2a1a })); jembatan.rotation.z = Math.PI / 2; jembatan.position.set(0, .22, .1); this.wajah.add(jembatan);
        this.mulut = { senyum: new THREE.Mesh(new THREE.TorusGeometry(.17, .032, 8, 20, Math.PI), hitam), buka: new THREE.Group(), o: new THREE.Mesh(new THREE.TorusGeometry(.065, .024, 8, 16), hitam) };
        this.mulut.senyum.rotation.z = Math.PI; this.mulut.senyum.position.set(0, -.14, .05);
        const rongga = new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 12), M({ color: 0x6b0f2a, roughness: .5 })); rongga.scale.set(1, .78, .3); const lidah = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), M({ color: 0xff7b9c })); lidah.position.set(0, -.07, .03); lidah.scale.z = .5;
        this.mulut.buka.add(rongga, lidah); this.mulut.buka.position.set(0, -.2, .05); this.mulut.o.position.set(0, -.22, .06);
        this.mulut.buka.visible = false; this.mulut.o.visible = false; this.wajah.add(this.mulut.senyum, this.mulut.buka, this.mulut.o);

        // lengan: bahu -> lengan atas -> siku -> lengan bawah -> manset emas -> tangan bersarung putih berjari. Bahu berada DI LUAR badan buku.
        const buatLengan = (sx) => {
            const bahu = new THREE.Group(); bahu.position.set(sx < 0 ? -.99 : .8, .34, 0);   // buku tak simetris: punggung di kiri (sampai x=-.95), sampul kanan berakhir x=.73
            const cincinBahu = new THREE.Mesh(new THREE.TorusGeometry(.115, .03, 8, 20), emas); cincinBahu.rotation.x = Math.PI / 2; cincinBahu.position.y = -.03;
            bahu.add(new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), bajuLengan), cincinBahu, letak(kapsul(.085, .2, bajuLengan), 0, -.21, 0));
            const siku = new THREE.Group(); siku.position.y = -.4; bahu.add(siku);
            siku.add(new THREE.Mesh(new THREE.SphereGeometry(.095, 12, 8), bajuLengan), letak(kapsul(.074, .14, bajuLengan), 0, -.17, 0));
            const manset = new THREE.Mesh(new THREE.TorusGeometry(.08, .024, 8, 18), emas); manset.rotation.x = Math.PI / 2; manset.position.y = -.33; siku.add(manset);
            const tangan = new THREE.Group(); tangan.position.y = -.44; siku.add(tangan);
            const telapak = new THREE.Mesh(new THREE.SphereGeometry(.135, 14, 10), sarung); telapak.scale.set(1, 1.05, .85); tangan.add(telapak);
            for (const [fx, fy, rot] of [[-.062, -.115, .12], [0, -.13, 0], [.062, -.115, -.12]]) { const j = kapsul(.036, .06, sarung); j.position.set(fx, fy, -.01); j.rotation.set(-.15, 0, rot); tangan.add(j); }
            const ibu = kapsul(.038, .06, sarung); ibu.position.set(-sx * .12, -.02, -.025); ibu.rotation.z = sx * 1.0; tangan.add(ibu);
            this.badan.add(bahu); return { bahu, siku };
        };
        // kaki: paha -> lutut -> betis berkaus garis -> sepatu bot kulit bersol tebal
        const buatKaki = (sx) => {
            const pinggul = new THREE.Group(); pinggul.position.set(sx * .3, .79, 0);
            pinggul.add(letak(kapsul(.092, .1, kaos), 0, -.15, 0));
            const lutut = new THREE.Group(); lutut.position.y = -.3; pinggul.add(lutut);
            lutut.add(new THREE.Mesh(new THREE.SphereGeometry(.097, 12, 8), kaos), letak(kapsul(.082, .13, kaos), 0, -.16, 0));
            for (const y of [-.1, -.19]) { const g = new THREE.Mesh(new THREE.TorusGeometry(.085, .016, 6, 16), garisKaos); g.rotation.x = Math.PI / 2; g.position.y = y; lutut.add(g); }
            const kaki = new THREE.Group(); kaki.position.y = -.31; lutut.add(kaki);
            const sepatu = kapsul(.125, .13, kulitSepatu); sepatu.rotation.x = Math.PI / 2; sepatu.position.set(0, -.03, -.07); sepatu.scale.set(1.08, 1, 1); kaki.add(sepatu);
            const sol = new THREE.Mesh(new THREE.BoxGeometry(.3, .05, .44), solSepatu); sol.position.set(0, -.145, -.08); kaki.add(sol);
            const kerah = new THREE.Mesh(new THREE.TorusGeometry(.098, .02, 8, 18), emas); kerah.rotation.x = Math.PI / 2; kerah.position.y = .035; kaki.add(kerah);
            const tali = new THREE.Mesh(new THREE.BoxGeometry(.13, .035, .04), emas); tali.position.set(0, .04, -.2); kaki.add(tali);
            this.model.add(pinggul); return { pinggul, lutut, kaki };
        };
        const L = [buatLengan(-1), buatLengan(1)], K = [buatKaki(-1), buatKaki(1)];
        this.bahu = L.map((x) => x.bahu); this.siku = L.map((x) => x.siku); this.pinggul = K.map((x) => x.pinggul); this.lutut = K.map((x) => x.lutut); this.pergelangan = K.map((x) => x.kaki);

        // syal berkibar di belakang (menghadap kamera)
        const syalGeo = new THREE.PlaneGeometry(.2, 1.3, 1, 12); syalGeo.rotateX(-Math.PI / 2); syalGeo.translate(0, 0, .65);
        this.syalAsli = Float32Array.from(syalGeo.attributes.position.array);
        this.syal = [0, 1].map((i) => { const m = new THREE.Mesh(syalGeo.clone(), new THREE.MeshBasicMaterial({ color: i ? 0xffc400 : 0xff4f6b, side: THREE.DoubleSide })); m.position.set(-.34 + i * .68, -.62, .3); this.badan.add(m); return m; });

        // aura & bayangan
        this.aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCahayaGlobal, color: 0x7fd4ff, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false })); this.aura.scale.set(5.2, 5.2, 1); this.aura.position.y = 1.9; this.model.add(this.aura);
        const [cb, gb] = kanvas(128, 128), rb = gb.createRadialGradient(64, 64, 0, 64, 64, 64); rb.addColorStop(0, 'rgba(0,0,30,.55)'); rb.addColorStop(1, 'rgba(0,0,30,0)'); gb.fillStyle = rb; gb.fillRect(0, 0, 128, 128);
        this.bayangan = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: tekstur(cb), transparent: true, depthWrite: false })); this.bayangan.rotation.x = -Math.PI / 2; this.bayangan.position.y = .03; this.root.add(this.bayangan);

        // bintang pusing (melingkari topi)
        this.pusingGrup = new THREE.Group(); this.pusingGrup.position.y = 3.35; this.pusingGrup.visible = false; this.model.add(this.pusingGrup);
        const geoBintang = new THREE.ExtrudeGeometry(bentukBintang(.2, .09), { depth: .06, bevelEnabled: false });
        for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(geoBintang, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffe066 : 0xffb0d0 })); b.position.set(Math.cos(i * 1.571) * 1.05, Math.sin(i * 2) * .1, Math.sin(i * 1.571) * 1.05); b.rotation.y = -i * 1.571 + Math.PI / 2; this.pusingGrup.add(b); }

        this.fase = 0; this.aksi = { nama: 'lari', t: 0 }; this.ekspresi('normal');
        this.root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    }
    ekspresi(e) {
        for (const m of this.mata) { m.normal.visible = e === 'normal'; m.senang.visible = e === 'senang'; m.pusing.visible = e === 'pusing'; m.alis.position.y = e === 'senang' ? .38 : .34; m.alis.rotation.z = m.sx * (e === 'pusing' ? -.35 : .12); }
        this.mulut.senyum.visible = e === 'normal'; this.mulut.buka.visible = e === 'senang'; this.mulut.o.visible = e === 'pusing';
    }
    mulai(nama) { this.aksi = { nama, t: 0 }; }
    perbarui(dt, v, t, tilt, idle) {
        const a = this.aksi; a.t += dt; const b = this.badan, m = this.model;
        this.fase += dt * (idle ? 2.2 : 7.5 + v * .28);
        const f = this.fase, s = Math.sin(f);
        b.position.y = 1.5 + (idle ? Math.sin(f) * .03 : Math.abs(s) * .13);
        // dasar: berlari (kaki melangkah & menekuk lutut, lengan berayun dengan siku tertekuk)
        for (let i = 0; i < 2; i++) {
            const sg = i ? -1 : 1, sx = i ? 1 : -1, ayun = s * sg;
            this.pinggul[i].rotation.set(ayun * (idle ? .06 : .85), 0, 0);
            this.lutut[i].rotation.set(idle ? 0 : -Math.max(0, -ayun) * 1.25, 0, 0);
            this.bahu[i].rotation.set(-ayun * (idle ? .1 : .85), 0, sx * .1);
            this.siku[i].rotation.set(idle ? .12 : .55 + Math.max(0, -ayun) * .5, 0, 0);
        }
        m.position.set(0, 0, 0); m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1); b.rotation.set(idle ? 0 : -.1, 0, tilt);
        this.pusingGrup.visible = false; let tinggi = 0;
        const angkat = (alfa, goyang) => { for (let i = 0; i < 2; i++) { const sx = i ? 1 : -1; this.bahu[i].rotation.set(0, 0, sx * (Math.PI - alfa)); this.siku[i].rotation.set(0, 0, sx * goyang * (i ? 1 : -1)); } };   // lengan lurus ke atas & MENJAUH dari badan

        if (a.nama === 'lari' && idle) { this.bahu[1].rotation.set(0, 0, Math.PI - .85 + Math.sin(t * 8) * .25); this.siku[1].rotation.set(0, 0, Math.sin(t * 8) * .25); }   // melambai saat pembuka
        if (a.nama === 'hore') {
            const k = a.t, hop = k < .75 ? Math.abs(Math.sin(k / .75 * Math.PI)) * 1.1 : (k < 1.3 ? Math.abs(Math.sin((k - .75) / .55 * Math.PI)) * .5 : 0);
            tinggi = hop; const putar = k < .35 ? halus(k / .35) : k < 1.0 ? 1 : 1 - halus(tepi((k - 1) / .35));
            b.rotation.y = putar * Math.PI; angkat(.55 + Math.sin(k * 20) * .12, Math.sin(k * 20) * .3);
            m.scale.set(1, 1 + (hop > .05 ? .06 : -.03), 1); if (k > 1.6) this.mulai('lari');
        } else if (a.nama === 'tabrak') {
            const k = a.t, peluruh = Math.max(0, 1 - k / 2.1);
            m.position.z = k < .15 ? halus(k / .15) * 1.0 : Math.max(0, 1.0 * (1 - (k - .15) / .9));
            const hantam = k < .2 ? halus(k / .2) : Math.max(0, 1 - (k - .2) / .5);
            b.rotation.x = -.1 - hantam * .55; b.rotation.z = tilt + Math.sin(k * 13) * .42 * peluruh; b.rotation.y = Math.sin(k * 5.5) * .7 * peluruh;
            m.scale.set(1 + hantam * .18, 1 - hantam * .22, 1 + hantam * .18); tinggi = Math.max(0, Math.sin(k * 9) * .22 * peluruh);
            for (let i = 0; i < 2; i++) { const sx = i ? 1 : -1; this.bahu[i].rotation.set(-.9 + Math.sin(k * 16) * .6, 0, sx * 1.0); this.siku[i].rotation.set(.3, 0, 0); }
            this.pusingGrup.visible = true; this.pusingGrup.rotation.y += dt * 7; if (k > 2.1) this.mulai('lari');
        } else if (a.nama === 'pingsan') {          // kalah: tetap pusing, bintang berputar
            b.rotation.x = -.35; b.rotation.z = tilt + Math.sin(a.t * 3) * .14; this.pusingGrup.visible = true; this.pusingGrup.rotation.y += dt * 6;
            for (let i = 0; i < 2; i++) { this.pinggul[i].rotation.set(0, 0, 0); this.lutut[i].rotation.set(0, 0, 0); this.bahu[i].rotation.set(.2, 0, (i ? 1 : -1) * .5); this.siku[i].rotation.set(.2, 0, 0); }
        } else if (a.nama === 'pesta') {            // menang: melompat riang di depan kamera
            const k = a.t; tinggi = Math.abs(Math.sin(k * 5.2)) * .9; b.rotation.y = Math.sin(k * 2.2) * .35; b.rotation.z = Math.sin(k * 5.2) * .12;
            angkat(.5 + Math.sin(k * 14) * .15, Math.sin(k * 14) * .3);
            for (let i = 0; i < 2; i++) { this.pinggul[i].rotation.set(Math.sin(k * 10 + i * 3) * .5, 0, 0); this.lutut[i].rotation.set(-Math.max(0, Math.sin(k * 10 + i * 3 + 1.5)) * .6, 0, 0); }
        }
        for (let i = 0; i < 2; i++) this.pergelangan[i].rotation.x = -(this.pinggul[i].rotation.x + this.lutut[i].rotation.x) * .75;   // telapak sepatu tetap datar
        if (a.nama === 'hore' || a.nama === 'pesta') this.ekspresi('senang'); else if (a.nama === 'tabrak' || a.nama === 'pingsan') this.ekspresi('pusing'); else this.ekspresi('normal');
        if (a.nama === 'tabrak' || a.nama === 'pingsan') for (const e of this.mata) e.pusing.rotation.z += dt * 12 * e.sx;
        m.position.y += tinggi; this.bayangan.scale.setScalar(1 - tinggi * .22); this.bayangan.material.opacity = 1 - tinggi * .35;
        this.pita.rotation.z = Math.sin(t * 5) * .25 + .1; this.pita.rotation.x = Math.sin(t * 4 + 1) * .15;
        this.topi.rotation.z = .1 + Math.sin(t * 4) * (idle ? .01 : .035); this.ujungTopi.rotation.z = -.5 + Math.sin(t * 5.5) * .14;
        // syal berkibar
        for (const sl of this.syal) {
            const p = sl.geometry.attributes.position, asli = this.syalAsli;
            for (let i = 0; i < p.count; i++) { const z = asli[i * 3 + 2], u = z / 1.3; p.setY(i, Math.sin(z * 2.6 - t * 11) * .14 * u + u * u * (.1 + .25 * Math.min(1, v / 10))); p.setX(i, asli[i * 3] + Math.sin(z * 2 - t * 8) * .12 * u); }
            p.needsUpdate = true;
        }
        this.aura.material.opacity = .32 + Math.sin(t * 3) * .08 + (a.nama === 'hore' || a.nama === 'pesta' ? .25 : 0);
    }
}

/* ---------- Gerbang: dua tiang emas, lengkung, portal bercahaya, papan label ---------- */
class Gerbang {
    constructor(lane, bersama) {
        const { tiangGeo, matTiang, lengkungGeo, matBatu, portalGeo, texPortal, cincinGeo, permataGeo, glow } = bersama;
        this.g = new THREE.Group(); this.lane = lane; this.warna = new THREE.Color(WARNA_JALUR[lane]);
        for (const sx of [-1, 1]) { const t = new THREE.Mesh(tiangGeo, matTiang); t.position.set(sx * 1.12, 1.6, 0); this.g.add(t); const p = new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 10), matTiang); p.position.set(sx * 1.12, 3.3, 0); this.g.add(p); }
        const l = new THREE.Mesh(lengkungGeo, matTiang); l.position.y = 3.2; this.g.add(l);
        this.portalMat = new THREE.MeshBasicMaterial({ map: texPortal, color: this.warna, transparent: true, opacity: .42, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
        this.portal = new THREE.Mesh(portalGeo, this.portalMat); this.g.add(this.portal);
        this.cincin = new THREE.Mesh(cincinGeo, new THREE.MeshBasicMaterial({ color: this.warna, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); this.cincin.rotation.x = -Math.PI / 2; this.cincin.position.y = .05; this.g.add(this.cincin);
        this.permata = new THREE.Mesh(permataGeo, new THREE.MeshStandardMaterial({ color: this.warna, emissive: this.warna, emissiveIntensity: .8, roughness: .2 })); this.permata.position.y = 4.55; this.g.add(this.permata);
        this.cahaya = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: this.warna, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false })); this.cahaya.scale.set(5.5, 6.5, 1); this.cahaya.position.y = 2.2; this.g.add(this.cahaya);
        // papan label
        [this.kv, this.kg] = kanvas(512, 256); this.tex = tekstur(this.kv);
        this.papan = new THREE.Group(); this.papan.position.set(0, 2.05, .1);
        const bingkai = new THREE.Mesh(new THREE.ExtrudeGeometry(bentukBulat(2.1, 1.15, .22), { depth: .1, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 2 }), matTiang); bingkai.position.z = -.08; this.papan.add(bingkai);
        const muka = new THREE.Mesh(new THREE.PlaneGeometry(1.95, .98), new THREE.MeshBasicMaterial({ map: this.tex, transparent: true })); muka.position.z = .09; this.papan.add(muka); this.g.add(this.papan);
        this.status = null; this.t = 0; this.g.position.x = JALUR[lane]; this.g.traverse((o) => { o.frustumCulled = false; });
    }
    isi(label) {
        const g = this.kg, tebal = 22; g.clearRect(0, 0, 512, 256);
        const l = g.createLinearGradient(0, 0, 0, 256); l.addColorStop(0, '#fffdf3'); l.addColorStop(1, '#ffe9b8'); g.fillStyle = l; bulat(g, 6, 6, 500, 244, 56); g.fill();
        g.lineWidth = tebal; g.strokeStyle = '#' + this.warna.getHexString(); bulat(g, 16, 16, 480, 224, 48); g.stroke();
        let ukuran = label.length === 1 ? 190 : 150; g.textAlign = 'center'; g.textBaseline = 'middle';
        do { g.font = `${ukuran}px ${FONT}`; ukuran -= 6; } while (g.measureText(label).width > 400 && ukuran > 40);
        g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#fff'; g.strokeText(label, 256, 140); g.fillStyle = '#' + this.warna.clone().multiplyScalar(.55).getHexString(); g.fillText(label, 256, 140);
        this.tex.needsUpdate = true; this.status = null; this.t = 0; this.portalMat.color.copy(this.warna); this.portalMat.opacity = .42; this.g.scale.setScalar(1); this.papan.scale.setScalar(1); this.g.position.x = JALUR[this.lane]; this.g.rotation.z = 0;
    }
    reaksi(benar) { this.status = benar ? 'benar' : 'salah'; this.t = 0; }
    perbarui(dt, waktu) {
        this.t += dt; const n = this.status;
        this.permata.rotation.y += dt * 1.6; this.cincin.material.opacity = .55 + Math.sin(waktu * 3 + this.lane) * .2;
        if (!n) { this.portalMat.opacity = .38 + Math.sin(waktu * 3 + this.lane * 2) * .08; return; }
        const k = Math.min(1, this.t / .5);
        if (n === 'benar') { this.portalMat.color.lerpColors(this.warna, new THREE.Color(0x66ff9a), k); this.portalMat.opacity = .5 + k * .4; this.papan.scale.setScalar(1 + Math.sin(k * Math.PI) * .25); this.g.scale.setScalar(1 + Math.sin(k * Math.PI) * .06); }
        else { this.portalMat.color.lerpColors(this.warna, new THREE.Color(0xff3b4e), k); this.portalMat.opacity = .5 + k * .35; this.g.position.x = JALUR[this.lane] + Math.sin(this.t * 40) * .12 * (1 - k); this.g.rotation.z = Math.sin(this.t * 30) * .05 * (1 - k); }
    }
}

/* ---------- Dunia: arena + kamera + pengelola gerbang ---------- */
class Dunia {
    constructor(wadah) {
        this.wadah = wadah; this.t = 0; this.jalur = 1; this.mode = 'intro'; this.introP = 0; this.orbit = 0; this.getar = 0; this.pusingKamera = 0; this.zoomDenyut = 0;
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.12;
        this.renderer.domElement.setAttribute('aria-hidden', 'true'); wadah.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.horizon = new THREE.Color(0xd98ad8);
        this.scene.fog = new THREE.Fog(this.horizon.clone().convertLinearToSRGB(), 55, 270);   // fog diberi nilai sRGB agar sama dengan warna langit di cakrawala
        this.camera = new THREE.PerspectiveCamera(58, 1, .1, 1400);
        this.cahaya = texCahaya();
        this.pemain = { x: 0, z: 0 };

        this.scene.add(new THREE.HemisphereLight(0xcdbbff, 0x44307a, 1.35));
        this.matahari = new THREE.DirectionalLight(0xfff1d6, 2.8); this.scene.add(this.matahari, this.matahari.target);
        this.rim = new THREE.DirectionalLight(0x7fd4ff, 1.5); this.scene.add(this.rim, this.rim.target);

        this.bangunLangit(); this.bangunJalan(); this.bangunBurung(); this.bangunAtmosfer();
        this.karakter = new Karakter(this.cahaya); this.karakter.model.scale.setScalar(1); this.karakter.root.scale.setScalar(1.15); this.scene.add(this.karakter.root);
        this.partikel = new Partikel(this.scene, this.cahaya);
        this.bangunGerbang();
        this.ukuran(); this.reset();
    }

    /* ----- langit: gradasi, bintang, planet bercincin, bulan, nebula, bintang jatuh ----- */
    bangunLangit() {
        this.langit = new THREE.Group(); this.scene.add(this.langit);
        const R = 520, geo = new THREE.SphereGeometry(R, 28, 18), pos = geo.attributes.position, warna = new Float32Array(pos.count * 3);
        const atas = new THREE.Color(0x0a0432), tengah = new THREE.Color(0x4a2494), c = new THREE.Color();
        for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / R; if (y > .3) c.copy(tengah).lerp(atas, tepi((y - .3) / .7)); else if (y > 0) c.copy(this.horizon).lerp(tengah, tepi(y / .3)); else c.copy(this.horizon); warna.set([c.r, c.g, c.b], i * 3); }
        geo.setAttribute('color', new THREE.BufferAttribute(warna, 3));
        this.langit.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
        const n = 1700, p = new Float32Array(n * 3), w = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, b = Math.acos(Math.random() * .95), r = 480; p.set([Math.sin(b) * Math.cos(a) * r, Math.cos(b) * r, Math.sin(b) * Math.sin(a) * r], i * 3); c.set(pilih([0xffffff, 0xcfe3ff, 0xfff2b8, 0xffd0f0])); w.set([c.r, c.g, c.b], i * 3); }
        const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(p, 3)); g2.setAttribute('color', new THREE.BufferAttribute(w, 3));
        this.bintang = new THREE.Points(g2, new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, map: this.cahaya, vertexColors: true, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); this.langit.add(this.bintang);
        const planet = new THREE.Mesh(new THREE.SphereGeometry(34, 32, 20), new THREE.MeshBasicMaterial({ map: texPlanet('#ffcf8a', '#ff8a6b', '#ffe3b0'), fog: false })); planet.position.set(-190, 90, -340);
        const cg = new THREE.RingGeometry(46, 74, 64), cu = cg.attributes.uv, cp = cg.attributes.position; for (let i = 0; i < cu.count; i++) cu.setXY(i, (Math.hypot(cp.getX(i), cp.getY(i)) - 46) / 28, .5);
        const [cc, cg2] = kanvas(64, 4), lg = cg2.createLinearGradient(0, 0, 64, 0); lg.addColorStop(0, 'rgba(255,220,170,0)'); lg.addColorStop(.2, 'rgba(255,220,170,.9)'); lg.addColorStop(.5, 'rgba(210,150,120,.5)'); lg.addColorStop(.75, 'rgba(255,230,190,.85)'); lg.addColorStop(1, 'rgba(255,220,170,0)'); cg2.fillStyle = lg; cg2.fillRect(0, 0, 64, 4);
        const cincin = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ map: tekstur(cc), side: THREE.DoubleSide, transparent: true, fog: false, depthWrite: false })); cincin.position.copy(planet.position); cincin.rotation.set(-1.25, .25, .3);
        const planet2 = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ map: texPlanet('#7fe0d0', '#3aa6e8', '#b5f0ff'), fog: false })); planet2.position.set(210, 55, -300);
        const bulan = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 20), new THREE.MeshBasicMaterial({ color: 0xfff6dc, fog: false })); bulan.position.set(70, 160, -430);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cahaya, color: 0xfff0c0, transparent: true, opacity: .4, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); halo.scale.set(280, 280, 1); halo.position.copy(bulan.position);
        this.langit.add(planet, cincin, planet2, bulan, halo); this.planet = planet; this.cincin = cincin;
        for (const [x, y, z, s, w2] of [[-120, 40, -380, 520, 0xff6bd0], [160, 100, -400, 480, 0x35b6ff], [0, 20, -430, 600, 0xb46bff], [-260, 150, -250, 420, 0x5be3c0]]) {
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cahaya, color: w2, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sp.scale.set(s, s * .6, 1); sp.position.set(x, y, z); this.langit.add(sp);
        }
        this.meteor = [0, 1].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(40, .5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, fog: false, depthWrite: false })); m.userData = { t: -i * 4 - 2 }; this.langit.add(m); return m; });
    }

    /* ----- jalan: jembatan halaman buku + tiang lentera + menara rak buku + pulau + buku & huruf melayang ----- */
    bangunJalan() {
        this.chunks = [];
        const tJalan = texJalan(); tJalan.repeat.set(9.2 / 4, PANJANG / 4);
        this.m = {
            jalan: new THREE.MeshStandardMaterial({ map: tJalan, roughness: .85 }), bawah: new THREE.MeshStandardMaterial({ color: 0x3a2870, roughness: .9 }),
            emas: new THREE.MeshStandardMaterial({ color: 0xf0c15a, metalness: .6, roughness: .32, emissive: 0x2a1a00 }), garis: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6, blending: THREE.AdditiveBlending, depthWrite: false }),
            menara: new THREE.MeshStandardMaterial({ map: texBuku(), roughness: .85, emissive: 0x2a1840, emissiveIntensity: .6 }), kayu: new THREE.MeshStandardMaterial({ color: 0x5a3320, roughness: .8 }),
            atap: [0xe24a6b, 0x3aa6e8, 0x9a62e6, 0xf2a33a, 0x2fb8b0].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: .5, emissive: c, emissiveIntensity: .12 })),
            batu: new THREE.MeshStandardMaterial({ color: 0x8a6fb5, roughness: .95, flatShading: true }), rumput: new THREE.MeshStandardMaterial({ color: 0x5fe39a, roughness: .8, emissive: 0x0a3a20 }),
            pohon: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .7, flatShading: true }),
            kristal: [0xff6bd0, 0x35b6ff, 0xffd84a, 0x7dffb0].map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .9, roughness: .15, transparent: true, opacity: .92, flatShading: true })),
            lampu: new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), runa: new THREE.MeshBasicMaterial({ color: 0xffffff }), rusuk: new THREE.MeshBasicMaterial({ color: 0xf6c441, transparent: true, opacity: .4 }),
            buku: [0xe24a6b, 0x35b6ff, 0xf2a33a, 0x9a62e6, 0x53c47a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: .55 })), halamanBuku: new THREE.MeshStandardMaterial({ color: 0xfff1cf, roughness: .8, side: THREE.DoubleSide }),
        };
        const g = (this.g = {
            jalan: new THREE.BoxGeometry(9.2, .6, PANJANG), bawah: new THREE.BoxGeometry(8.6, 3.2, PANJANG), pagar: new THREE.BoxGeometry(.38, .55, PANJANG), garis: new THREE.BoxGeometry(.07, .025, PANJANG),
            tiang: new THREE.CylinderGeometry(.07, .1, 2.6, 8), lampu: new THREE.SphereGeometry(.25, 12, 10), runa: new THREE.BoxGeometry(.13, .09, .55), rusuk: new THREE.BoxGeometry(8.9, .03, .2),
            atap: new THREE.ConeGeometry(2.9, 3.4, 4), cincinMenara: new THREE.TorusGeometry(2.7, .09, 8, 36), batuBawah: new THREE.ConeGeometry(3.3, 4.8, 7), rumputAtas: new THREE.CylinderGeometry(3.5, 3.3, .7, 14),
            kristal: new THREE.OctahedronGeometry(.6),
        });
        g.menara = [10, 15, 21].map((h) => { const b = new THREE.BoxGeometry(3.6, h, 3.6), uv = b.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * h / 5); return b; });
        g.pohon = [pohonPinus(), pohonRindang(), pohonSakura()]; g.hiasan = [hiasanTanah(0), hiasanTanah(1)];
        const hurufWarna = ['#ff4f86', '#ff8a3d', '#12a9d9', '#0fa968', '#8b5cf6', '#e6a800']; this.texHuruf = 'ABCDEFGHIKLMNOPRSTU'.split('').map((h, i) => texHurufBulat(h, hurufWarna[i % 6]));
        for (let i = 0; i < JUMLAH_CHUNK; i++) { const c = this.buatChunk(); c.grup.position.z = -i * PANJANG + PANJANG / 2 - 10; c.acak(); this.chunks.push(c); }
    }

    buatChunk() {
        const { m, g } = this, grup = new THREE.Group(), animasi = [];
        const jalan = new THREE.Mesh(g.jalan, m.jalan); jalan.position.y = -.3; const bawah = new THREE.Mesh(g.bawah, m.bawah); bawah.position.y = -2.2; grup.add(jalan, bawah);
        for (const sx of [-1, 1]) {
            const p = new THREE.Mesh(g.pagar, m.emas); p.position.set(sx * 4.75, .25, 0); grup.add(p);
            const runa = new THREE.InstancedMesh(g.runa, m.runa, 20); const d = new THREE.Object3D(), w = new THREE.Color();
            for (let i = 0; i < 20; i++) { d.position.set(sx * 4.56, .56, -PANJANG / 2 + 1.5 + i * 3); d.updateMatrix(); runa.setMatrixAt(i, d.matrix); w.set(pilih(WARNA_PESTA)); runa.setColorAt(i, w); } grup.add(runa);
            for (const z of [-15, 15]) { const tiang = new THREE.Mesh(g.tiang, m.emas); tiang.position.set(sx * 4.75, 1.8, z); const lampu = new THREE.Mesh(g.lampu, m.lampu); lampu.position.set(sx * 4.75, 3.3, z);
                const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cahaya, color: 0xffd27a, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(4.2, 4.2, 1); sp.position.copy(lampu.position); grup.add(tiang, lampu, sp); }
        }
        for (const x of [-1.4, 1.4]) { const s = new THREE.Mesh(g.garis, m.garis); s.position.set(x, .02, 0); grup.add(s); }
        const rusuk = new THREE.InstancedMesh(g.rusuk, m.rusuk, 10), d = new THREE.Object3D(); for (let i = 0; i < 10; i++) { d.position.set(0, .03, -PANJANG / 2 + 3 + i * 6); d.updateMatrix(); rusuk.setMatrixAt(i, d.matrix); } grup.add(rusuk);

        const menara = [0, 1, 2, 3].map((i) => { const T = new THREE.Group(), tinggi = i % 3, h = [10, 15, 21][tinggi]; const b = new THREE.Mesh(g.menara[tinggi], m.menara); b.position.y = h / 2 - 3; const a = new THREE.Mesh(g.atap, pilih(m.atap)); a.rotation.y = Math.PI / 4; a.position.y = h - 3 + 1.7;
            const c = new THREE.Mesh(g.cincinMenara, m.emas); c.rotation.x = Math.PI / 2; c.position.y = h - 3 - .3; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cahaya, color: 0xffe0a0, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(9, 9, 1); sp.position.y = h - 3 + 3.6; T.add(b, a, c, sp); grup.add(T); animasi.push({ o: c, tipe: 'putar' }); return T; });
        const pulau = [0, 1, 2, 3].map((idx) => { const P = new THREE.Group(), batu = new THREE.Mesh(g.batuBawah, m.batu); batu.rotation.x = Math.PI; batu.position.y = -2.4; const rumput = new THREE.Mesh(g.rumputAtas, m.rumput); P.add(batu, rumput);
            [[-1.5, .9], [1.5, -.4], [.1, 1.9]].forEach(([x, z], k) => { const T = new THREE.Mesh(g.pohon[(k + idx) % 3], m.pohon); T.position.set(x, .35, z); T.scale.setScalar(.55 + rand(0, .22)); T.rotation.y = rand(0, 6.28); P.add(T); animasi.push({ o: T, tipe: 'goyang', fase: rand(0, 6) }); });
            const hias = new THREE.Mesh(g.hiasan[idx % 2], m.pohon); hias.position.y = .35; hias.rotation.y = rand(0, 6.28); P.add(hias);
            const kr = new THREE.Mesh(g.kristal, pilih(m.kristal)); kr.scale.set(.8, 1.9, .8); kr.position.set(.2, 1.3, -1.4); kr.rotation.z = .2; P.add(kr); grup.add(P); return P; });
        const hurufTerbang = [0, 1, 2, 3].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: pilih(this.texHuruf), transparent: true })); grup.add(s); animasi.push({ o: s, tipe: 'naikturun' }); return s; });

        const acak = () => {
            for (const T of menara) { const sx = Math.random() < .5 ? -1 : 1; T.position.set(sx * rand(11, 22), rand(-6, -2), rand(-27, 27)); T.rotation.y = rand(-.3, .3); T.scale.setScalar(rand(.9, 1.3)); }
            pulau.forEach((P, i) => { const dekat = i % 2 === 0, sx = Math.random() < .5 ? -1 : 1; P.scale.setScalar(dekat ? rand(.35, .5) : rand(.9, 1.5)); P.position.set(sx * (dekat ? rand(8, 12) : rand(24, 44)), dekat ? rand(-3.5, -1.5) : rand(-6, 9), rand(-28, 28)); });
            for (const s of hurufTerbang) { const sx = Math.random() < .5 ? -1 : 1, u = rand(1.7, 2.6); s.material.map = pilih(this.texHuruf); s.scale.set(u, u, 1); s.position.set(sx * rand(6.5, 18), rand(2, 10), rand(-28, 28)); s.userData.dasar = s.position.y; s.userData.fase = rand(0, 6); }
        };
        grup.traverse((o) => { o.frustumCulled = false; }); this.scene.add(grup);
        return { grup, acak, animasi };
    }

    /* ----- kawanan burung-buku: buku terbuka bersayap, berkepala & berekor, mengepak di sisi jalan ----- */
    bangunBurung() {
        const warna = [0xff4f86, 0x35b6ff, 0xffc400, 0x5be37d, 0xb46bff, 0xff8a3d, 0x2fe0d0, 0xff6bd0];
        const g = {
            tulang: new THREE.BoxGeometry(.22, .22, 1.1), kepala: new THREE.SphereGeometry(.26, 16, 12), paruh: new THREE.ConeGeometry(.09, .26, 10), mata: new THREE.SphereGeometry(.055, 8, 6),
            sampulDalam: new THREE.BoxGeometry(.95, .06, 1.05), halDalam: new THREE.BoxGeometry(.88, .05, .95), sampulLuar: new THREE.BoxGeometry(.8, .06, .95), halLuar: new THREE.BoxGeometry(.74, .05, .85), ekor: new THREE.BoxGeometry(.3, .04, .6),
        };
        g.paruh.rotateX(-Math.PI / 2);   // ujung runcing menghadap -z (arah terbang)
        const mHal = new THREE.MeshStandardMaterial({ color: 0xfff6dc, roughness: .8, emissive: 0x6a5a40, emissiveIntensity: .35 }), mMata = new THREE.MeshBasicMaterial({ color: 0x15102e });
        this.burung = warna.map((w, i) => {
            const mW = new THREE.MeshStandardMaterial({ color: w, roughness: .45, emissive: w, emissiveIntensity: .38 });
            const B = new THREE.Group(); B.scale.setScalar(rand(1.0, 1.45)); B.add(new THREE.Mesh(g.tulang, mW));
            const kepala = new THREE.Mesh(g.kepala, mHal); kepala.position.set(0, .06, -.72); B.add(kepala);
            const paruh = new THREE.Mesh(g.paruh, this.m.emas); paruh.position.set(0, 0, -.98); B.add(paruh);
            for (const sx of [-1, 1]) { const e = new THREE.Mesh(g.mata, mMata); e.position.set(sx * .11, .14, -.9); B.add(e); }
            for (const k of [-1, 0, 1]) { const t = new THREE.Mesh(g.ekor, i % 2 ? mW : mHal); t.position.set(k * .1, 0, .85); t.rotation.y = k * .35; B.add(t); }
            const sayap = [-1, 1].map((sx) => {
                const dalam = new THREE.Group(); dalam.position.set(sx * .1, .04, 0);
                const sd = new THREE.Mesh(g.sampulDalam, mW); sd.position.x = sx * .48; const hd = new THREE.Mesh(g.halDalam, mHal); hd.position.set(sx * .48, .05, 0); dalam.add(sd, hd);
                const luar = new THREE.Group(); luar.position.x = sx * .95;
                const sl = new THREE.Mesh(g.sampulLuar, mW); sl.position.x = sx * .4; const hl = new THREE.Mesh(g.halLuar, mHal); hl.position.set(sx * .4, .05, 0); luar.add(sl, hl); dalam.add(luar);
                B.add(dalam); return { dalam, luar, sx };
            });
            const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cahaya, color: w, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(5.5, 3.5, 1); B.add(halo);
            B.traverse((o) => { o.frustumCulled = false; }); this.scene.add(B);
            return { B, sayap, fase: rand(0, 6), x0: 0, y0: 0, z: 0, hidup: false };
        });
    }
    taruhBurung(b, cz, dekat) { b.x0 = (Math.random() < .5 ? -1 : 1) * rand(4.8, 11); b.y0 = rand(1.8, 4.6); b.z = cz - (dekat ? rand(18, 150) : rand(100, 200)); b.hidup = true; }
    perbaruiBurung(dt, v) {
        const cz = this.camera.position.z, t = this.t;
        for (const b of this.burung) {
            if (!b.hidup) this.taruhBurung(b, cz, true); else if (b.z > cz + 14 || b.z < cz - 260) this.taruhBurung(b, cz, false);
            b.z -= (2 + v * .15) * dt;                        // terbang searah pemain tapi jauh lebih lambat: terlihat besar & jelas saat dilewati
            const f = Math.sin(t * 7 + b.fase), f2 = Math.sin(t * 7 + b.fase - .8), a = f * .75 + .12, a2 = f2 * .55;
            for (const w of b.sayap) { w.dalam.rotation.z = w.sx * a; w.luar.rotation.z = w.sx * a2; }
            b.B.position.set(b.x0 + Math.sin(t * .5 + b.fase) * 1.6, b.y0 + Math.sin(t * 3.5 + b.fase) * .45, b.z);
            b.B.rotation.set(Math.cos(t * 3.5 + b.fase) * .06, Math.sin(t * .5 + b.fase) * .15, Math.sin(t * .7 + b.fase) * .18);
        }
    }

    /* ----- atmosfer: halaman terbang, kunang-kunang, garis kecepatan ----- */
    bangunAtmosfer() {
        this.halaman = new THREE.InstancedMesh(new THREE.PlaneGeometry(.55, .75), new THREE.MeshBasicMaterial({ color: 0xfff6dc, side: THREE.DoubleSide, transparent: true, opacity: .92, fog: true }), 70); this.halaman.frustumCulled = false;
        this.dataHalaman = Array.from({ length: 70 }, () => ({ x: rand(-26, 26), y: rand(.8, 14), z: 0, f: rand(0, 6), s: rand(.6, 1.6), r: rand(0, 6) })); this.scene.add(this.halaman);
        const n = 220, p = new Float32Array(n * 3), w = new Float32Array(n * 3), c = new THREE.Color(); this.kunang = { n, p, data: [] };
        for (let i = 0; i < n; i++) { this.kunang.data.push({ x: rand(-22, 22), y: rand(.5, 9), z: 0, f: rand(0, 6) }); c.set(pilih([0xfff2a8, 0xa8f0ff, 0xffb8e8])); w.set([c.r, c.g, c.b], i * 3); }
        const gk = new THREE.BufferGeometry(); gk.setAttribute('position', new THREE.BufferAttribute(p, 3)); gk.setAttribute('color', new THREE.BufferAttribute(w, 3));
        this.kunangTitik = new THREE.Points(gk, new THREE.PointsMaterial({ size: .32, map: this.cahaya, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); this.kunangTitik.frustumCulled = false; this.scene.add(this.kunangTitik);
        const gs = new THREE.BufferGeometry(), ps = new Float32Array(46 * 6); gs.setAttribute('position', new THREE.BufferAttribute(ps, 3)); this.garisKec = new THREE.LineSegments(gs, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .28, blending: THREE.AdditiveBlending, depthWrite: false })); this.garisKec.frustumCulled = false; this.scene.add(this.garisKec);
        this.dataGaris = Array.from({ length: 46 }, () => ({ x: rand(-14, 14), y: rand(.4, 9), z: rand(-150, 10), p: rand(3, 8) }));
    }

    /* ----- gerbang: 3 baris bergantian (pool) ----- */
    bangunGerbang() {
        const bersama = {
            tiangGeo: new THREE.CylinderGeometry(.16, .2, 3.2, 12), matTiang: new THREE.MeshStandardMaterial({ color: 0xf0c15a, metalness: .55, roughness: .3, emissive: 0x2a1a00 }), lengkungGeo: new THREE.TorusGeometry(1.12, .16, 12, 28, Math.PI), matBatu: null,
            portalGeo: (() => { const s = new THREE.Shape(); s.moveTo(-1.1, 0); s.lineTo(1.1, 0); s.lineTo(1.1, 3.2); s.absarc(0, 3.2, 1.1, 0, Math.PI, false); s.lineTo(-1.1, 0); const gg = new THREE.ShapeGeometry(s, 16), uv = gg.attributes.uv, ps = gg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (ps.getX(i) + 1.1) / 2.2, ps.getY(i) / 4.3); return gg; })(),
            texPortal: texPortal(), cincinGeo: new THREE.RingGeometry(.95, 1.7, 40), permataGeo: new THREE.OctahedronGeometry(.34), glow: this.cahaya,
        };
        this.texPortal = bersama.texPortal; this.baris = Array.from({ length: SLOT }, () => { const grup = new THREE.Group(), gerbang = [0, 1, 2].map((l) => { const x = new Gerbang(l, bersama); grup.add(x.g); return x; }); grup.visible = false; this.scene.add(grup); return { grup, gerbang, z: 0, aktif: false }; });
    }
    /** Pasang soal `indeks` ke slot baris; z mengikuti indeks. */
    pasangBaris(indeks, label) {
        const b = this.baris[indeks % SLOT]; b.z = -(JARAK_AWAL + indeks * JARAK_BARIS); b.grup.position.z = b.z; b.grup.visible = true; b.aktif = true; b.sembunyi = 0; b.indeks = indeks; label.forEach((t, i) => b.gerbang[i].isi(t)); return b;
    }
    reaksiBaris(indeks, jalurDipilih, benarIdx) {
        const b = this.baris[indeks % SLOT]; b.sembunyi = .45; b.gerbang[benarIdx].reaksi(true);   // gerbang yang sudah dilewati menghilang sebentar lagi agar karakter terlihat jelas
         if (jalurDipilih !== benarIdx) b.gerbang[jalurDipilih].reaksi(false);
        const g = b.gerbang[jalurDipilih]; this.partikel.ledak(JALUR[jalurDipilih], 2.2, b.z, jalurDipilih === benarIdx ? 70 : 40, jalurDipilih === benarIdx ? WARNA_PESTA : [0xff3b4e, 0xff8a3d, 0xffe066, 0x9a9ab0], jalurDipilih === benarIdx ? 7 : 6, 5);
    }

    /* ----- kontrol permainan ----- */
    reset() {
        this.pemain.x = 0; this.pemain.z = 0; this.jalur = 1; this.mode = 'intro'; this.introP = 0; this.orbit = 0; this.getar = 0; this.pusingKamera = 0; this.vAkhir = 0;
        this.karakter.mulai('lari'); this.baris.forEach((b) => { b.grup.visible = false; b.aktif = false; });
        this.chunks.forEach((c, i) => { c.grup.position.z = -i * PANJANG + PANJANG / 2 - 10; c.acak(); });
        this.burung.forEach((b) => { b.hidup = false; }); this.partikel.sisa.fill(0); this.partikel.pos.fill(-9999); this.kamera(0, true);
    }
    setJalur(j) { this.jalur = Math.max(0, Math.min(2, j)); }
    jalurSekarang() { return this.pemain.x < -1.4 ? 0 : this.pemain.x > 1.4 ? 2 : 1; }
    selebrasi() { this.karakter.mulai('hore'); this.zoomDenyut = 1; const p = this.karakter.root.position; this.partikel.ledak(p.x, 2.4, p.z, 90, WARNA_PESTA, 8, 7, 1.6); }
    tabrak() { this.karakter.mulai('tabrak'); this.getar = 1; this.pusingKamera = 1; const p = this.karakter.root.position; this.partikel.ledak(p.x, 1.2, p.z + .5, 36, [0xffe066, 0xff8a3d, 0xffffff], 5.5, 4, .8); }
    akhir(menang) { this.mode = 'akhir'; this.menang = menang; this.tAkhir = 0; this.karakter.mulai(menang ? 'pesta' : 'pingsan'); if (menang) { const p = this.karakter.root.position; this.partikel.ledak(p.x, 3, p.z - 1, 160, WARNA_PESTA, 10, 9, 2.4); } }

    ukuran() {
        const w = this.wadah.clientWidth || innerWidth, h = this.wadah.clientHeight || innerHeight, rasio = w / h;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 700 ? 1.75 : 2)); this.renderer.setSize(w, h, false);
        this.camera.aspect = rasio; this.fovDasar = rasio >= 1 ? 58 : Math.min(86, 58 + (1 - rasio) * 58); this.camera.fov = this.fovDasar; this.camera.updateProjectionMatrix();
        this.jarakKamera = rasio >= 1 ? 8.2 : 8.2 + (1 - rasio) * 5; this.tinggiKamera = rasio >= 1 ? 5 : 5 + (1 - rasio) * 1.6;
    }

    kamera(dt, langsung = false) {
        const c = this.camera, x = this.pemain.x, z = this.pemain.z; let px, py, pz, lx, ly, lz;
        const ikut = () => { px = x * .6; py = this.tinggiKamera; pz = z + this.jarakKamera; lx = x * .4; ly = 2.1; lz = z - 14; };
        if (this.mode === 'intro') {
            const p = halus(tepi(this.introP)), phi = Math.PI * (1 - p), R = 6.8 + (this.jarakKamera - 6.8) * p, tinggi = 2.7 + (this.tinggiKamera - 2.7) * p, q = halus(tepi((p - .45) / .55));
            px = Math.sin(phi) * R; py = tinggi; pz = z + Math.cos(phi) * R; lx = x * .4 * q; ly = 2.0 + .1 * q; lz = z - 14 * q;
        } else if (this.mode === 'akhir') {
            this.tAkhir += dt; const p = this.menang ? halus(tepi(this.tAkhir / 1.6)) : 0, phi = Math.PI * p, R = this.jarakKamera - 2.2 * p, tinggi = this.tinggiKamera - (this.tinggiKamera - 3) * p, q = 1 - p;
            px = Math.sin(phi) * R * .9 + x * .6 * q; py = tinggi; pz = z + Math.cos(phi) * R; lx = x * .4 * q; ly = 2.1 - .1 * p; lz = z - 14 * q;
        } else ikut();
        if (langsung) { this.cx = px; this.cy = py; this.cz = pz; } else { const s = Math.min(1, dt * 7); this.cx += (px - this.cx) * s; this.cy += (py - this.cy) * s; this.cz += (pz - this.cz) * s; }
        let gx = 0, gy = 0, roll = 0;
        if (this.getar > 0) { this.getar = Math.max(0, this.getar - dt * 1.6); gx = (Math.random() - .5) * .5 * this.getar; gy = (Math.random() - .5) * .5 * this.getar; }
        if (this.pusingKamera > 0) { this.pusingKamera = Math.max(0, this.pusingKamera - dt * .55); roll = Math.sin(this.t * 7) * .09 * this.pusingKamera; gx += Math.sin(this.t * 5) * .15 * this.pusingKamera; }
        if (this.zoomDenyut > 0) this.zoomDenyut = Math.max(0, this.zoomDenyut - dt * 2.2);
        c.fov = this.fovDasar + Math.sin(this.zoomDenyut * Math.PI) * 5 + (this.mode === 'main' ? Math.min(6, this.vSekarang * .25) : 0); c.updateProjectionMatrix();
        c.position.set(this.cx + gx, this.cy + gy, this.cz); c.up.set(Math.sin(roll), Math.cos(roll), 0); c.lookAt(lx, ly, lz);
    }

    /** dt dalam detik; v = laju lari (m/s) hanya dipakai saat mode 'main' */
    perbarui(dt, v = 0) {
        this.t += dt; this.vSekarang = v; const t = this.t, c = this.camera;
        if (this.mode === 'main') this.pemain.z -= v * dt;
        this.pemain.x += (JALUR[this.jalur] - this.pemain.x) * Math.min(1, dt * 9);
        const tilt = -(this.pemain.x - JALUR[this.jalur]) * .12; this.karakter.root.position.set(this.pemain.x, 0, this.pemain.z);
        this.karakter.perbarui(dt, this.mode === 'main' ? v : 0, t, tilt, this.mode === 'intro' || (this.mode === 'akhir' && !this.menang && false));
        const z = this.pemain.z;
        this.matahari.position.set(z * 0 + 8, 14, z + 6); this.matahari.target.position.set(0, 0, z - 4); this.rim.position.set(-8, 7, z - 16); this.rim.target.position.set(0, 1.5, z);
        // daur ulang potongan jalan yang sudah jauh di belakang
        let depan = Infinity; for (const k of this.chunks) depan = Math.min(depan, k.grup.position.z);
        for (const k of this.chunks) if (k.grup.position.z > z + PANJANG * 1.1) { k.grup.position.z = depan - PANJANG; depan = k.grup.position.z; k.acak(); }
        for (const k of this.chunks) for (const a of k.animasi) {
            if (a.tipe === 'putar') a.o.rotation.z = t * .5;             else if (a.tipe === 'goyang') a.o.rotation.z = Math.sin(t * 1.3 + a.fase) * .035;
            else if (a.tipe === 'naikturun') a.o.position.y = a.o.userData.dasar + Math.sin(t * 1.5 + a.o.userData.fase) * .5;
        }
        this.langit.position.copy(c.position); this.bintang.rotation.y = t * .004; this.planet.rotation.y = t * .03; this.cincin.rotation.z = .3 + t * .01;
        for (const m of this.meteor) { const d = m.userData; d.t += dt; const k = d.t / 1.2; if (k > 1) { d.t = -rand(3, 7); m.position.set(rand(-200, 200), rand(120, 300), -380); m.rotation.z = rand(-.7, -.3); } m.material.opacity = k > 0 && k < 1 ? Math.sin(k * Math.PI) * .9 : 0; m.position.x += -dt * 160; m.position.y -= dt * 60; }
        // gerbang
        for (const b of this.baris) if (b.aktif) { for (const g of b.gerbang) g.perbarui(dt, t); if (b.sembunyi > 0 && (b.sembunyi -= dt) <= 0) { b.grup.visible = false; b.aktif = false; b.sembunyi = 0; } }
        this.texPortal.offset.y -= dt * .25;
        this.perbaruiBurung(dt, this.mode === 'main' ? v : 0);
        if (this.mode === 'main' && v > 1 && (this.jejak = (this.jejak ?? 0) - dt) <= 0) { this.jejak = .05; this.partikel.ledak(this.pemain.x + rand(-.35, .35), rand(.7, 2.4), this.pemain.z + 1.1, 1, [0x7fd4ff, 0xffe066, 0xff9de0], .7, 1.1, .8); }   // jejak percikan sihir
        // atmosfer
        const dummy = this._d || (this._d = new THREE.Object3D()), cz = c.position.z;
        this.dataHalaman.forEach((h, i) => { if (!h.z || h.z > cz + 12) { h.z = cz - rand(10, 200); h.x = rand(-26, 26); h.y = rand(.8, 14); } h.z += dt * (3 + h.s * 3); dummy.position.set(h.x + Math.sin(t * h.s + h.f) * 1.2, h.y + Math.sin(t * 1.6 + h.f) * .6, h.z); dummy.rotation.set(t * h.s + h.r, t * .8 + h.f, Math.sin(t + h.f)); dummy.updateMatrix(); this.halaman.setMatrixAt(i, dummy.matrix); });
        this.halaman.instanceMatrix.needsUpdate = true;
        const kp = this.kunang.p; this.kunang.data.forEach((k, i) => { if (!k.z || k.z > cz + 12) { k.z = cz - rand(5, 160); k.x = rand(-22, 22); k.y = rand(.5, 9); } kp[i * 3] = k.x + Math.sin(t + k.f) * .8; kp[i * 3 + 1] = k.y + Math.sin(t * 1.2 + k.f) * .5; kp[i * 3 + 2] = k.z; }); this.kunangTitik.geometry.attributes.position.needsUpdate = true;
        const gp = this.garisKec.geometry.attributes.position, kec = this.mode === 'main' ? v : 0; this.garisKec.visible = kec > 1;
        if (kec > 1) { this.dataGaris.forEach((l, i) => { l.z += (kec * 2.2 + 10) * dt; if (l.z > cz + 6) { l.z = cz - rand(80, 170); l.x = rand(-14, 14); l.y = rand(.4, 9); } gp.setXYZ(i * 2, l.x, l.y, l.z); gp.setXYZ(i * 2 + 1, l.x, l.y, l.z - l.p * (kec / 12)); }); gp.needsUpdate = true; }
        this.partikel.perbarui(dt);
        this.kamera(dt);
    }
    gambar() { this.renderer.render(this.scene, this.camera); }
    destroy() { this.renderer.dispose(); this.renderer.domElement.remove(); }
}

/* ============================================================
   4. GAME
   ============================================================ */
let bukaSetupFn = null;
/** Dipanggil pemuat di Blade saat tombol Bermain diklik. */
export const bukaPengaturan = () => { if (!bukaSetupFn) return false; bukaSetupFn(); return true; };

function mulaiUI() {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const html = document.documentElement;
    const el = {
        setup: $('#hn-setup'), form: $('#hn-form'), namaInput: $('#hn-nama-input'), suaraInfo: $('#hn-suara-info'), cobaSuara: $('#hn-coba-suara'), mulai: $('#hn-mulai'),
        game: $('#hn-game'), kanvas: $('#hn-kanvas'), efek: $('#hn-efek'), nama: $('#hn-nama'), skor: $('#hn-skor'), nyawa: $('#hn-nyawa'), progresTeks: $('#hn-progres-teks'), progresBar: $('#hn-progres-bar'),
        tanya: $('#hn-tanya'), tanyaTeks: $('#hn-tanya-teks'), hitung: $('#hn-hitung'), pop: $('#hn-pop'), memuat: $('#hn-memuat'), memuatTeks: $('#hn-memuat-teks'), galatKeluar: $('#hn-galat-keluar'),
        btnJeda: $('#hn-btn-jeda'), btnUlang: $('#hn-btn-ulang'), btnSuara: $('#hn-btn-suara'), btnLayar: $('#hn-btn-layar'), kiri: $('#hn-kiri'), kanan: $('#hn-kanan'),
        jeda: $('#hn-jeda'), selesai: $('#hn-selesai'),
    };
    if (!el.setup || !el.game) return;

    const KUNCI = 'hn:pref';
    let dunia = null, muatJanji = null, g = null, raf = 0, terakhir = 0, ulangSuaraTs = 0;

    const simpan = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* mode privat: abaikan */ } };
    const baca = (k, awal) => { try { return JSON.parse(localStorage.getItem(k)) ?? awal; } catch (e) { return awal; } };
    const bersihNama = (n) => (n || '').replace(/\s+/g, ' ').trim().slice(0, 12) || 'Teman';
    const hati = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#hn-hati"/></svg>';

    /* ---------- Pengaturan ---------- */
    const pref = baca(KUNCI, { nama: '', tingkat: 'mudah', jenis: 'huruf' });
    const terapkanPref = () => {
        el.namaInput.value = pref.nama || '';
        for (const k of ['tingkat', 'jenis']) { const r = el.form.querySelector(`input[name="${k}"][value="${pref[k]}"]`); if (r) r.checked = true; }
    };
    const infoSuara = () => {
        const t = !suara.adaUcapan() ? 'Peramban ini belum bisa bersuara. Teks soal akan ditampilkan di layar.'
            : suara.adaSuaraIndonesia() ? `Suara bahasa Indonesia siap (${suara.namaSuara()}).`
            : 'Suara bahasa Indonesia belum ditemukan di perangkat ini. Teks soal akan ikut ditampilkan; pasang suara Indonesia di pengaturan perangkat.';
        el.suaraInfo.textContent = t;
    };
    infoSuara(); setTimeout(infoSuara, 800); setTimeout(infoSuara, 2500); // daftar suara dimuat belakangan oleh peramban
    window.speechSynthesis?.addEventListener?.('voiceschanged', infoSuara);

    const bukaSetup = () => { terapkanPref(); if (!el.setup.open) el.setup.showModal(); setTimeout(() => el.namaInput.focus({ preventScroll: true }), 50); };
    bukaSetupFn = bukaSetup;   // dipanggil dari pemuat di huruf-ngebut.blade.php saat tombol Bermain diklik
    el.setup.addEventListener('click', (e) => { if (e.target.closest('[data-tutup]')) el.setup.close(); });
    el.cobaSuara.addEventListener('click', () => { suara.buka(); suara.ucap(`Halo ${bersihNama(el.namaInput.value)}. Huruf A. Huruf B. Huruf C.`, { paksa: true }); });
    el.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(el.form);
        const opsi = { nama: bersihNama(data.get('nama')), tingkat: data.get('tingkat'), jenis: data.get('jenis') };
        if (!TINGKAT[opsi.tingkat] || !['huruf', 'kata', 'gabungan'].includes(opsi.jenis)) return;
        Object.assign(pref, opsi); simpan(KUNCI, pref);
        el.setup.close(); suara.buka(); mulaiGame(opsi);
    });

    /* ---------- Membuat dunia 3D (sekali, saat pertama dimulai) ---------- */
    const muatDunia = () => muatJanji ||= (async () => {
        try { await document.fonts?.load('100px "Lilita One"'); } catch (e) { /* font cadangan dipakai */ }
        dunia = new Dunia(el.kanvas); return dunia;
    })().catch((err) => { muatJanji = null; throw err; });
    new ResizeObserver(() => dunia?.ukuran()).observe(el.game);

    /* ---------- Tampilan (HUD) ---------- */
    const hudSkor = () => { el.skor.textContent = g.skor.toLocaleString('id-ID'); };
    const hudNyawa = () => { el.nyawa.innerHTML = Array.from({ length: g.nyawaMaks }, (_, i) => `<span class="${i < g.nyawa ? '' : 'hilang'}">${hati}</span>`).join(''); el.nyawa.setAttribute('aria-label', `Nyawa ${g.nyawa} dari ${g.nyawaMaks}`); };
    const hudProgres = () => { const n = g.soal.length; el.progresTeks.textContent = `Gerbang ${Math.min(g.i + 1, n)}/${n}`; el.progresBar.style.width = `${(g.i / n) * 100}%`; };
    const efek = (kelas) => { el.efek.className = 'hn__efek'; void el.efek.offsetWidth; el.efek.classList.add(kelas); };
    const pop = (teks, kelas) => { const p = document.createElement('div'); p.className = `hn-pop ${kelas}`; p.textContent = teks; el.pop.appendChild(p); setTimeout(() => p.remove(), 1500); };
    const teksTerlihat = () => !suara.apakahAktif() || !suara.adaUcapan() || !suara.adaSuaraIndonesia();   // tanpa suara, teks soal harus terlihat agar tetap bisa dimainkan
    const hudTanya = () => {
        const b = g.soal[g.i]; if (!b) { el.tanya.hidden = true; return; }
        el.tanya.hidden = false; el.tanya.classList.toggle('teks', teksTerlihat());
        el.tanyaTeks.textContent = teksTerlihat() ? `Cari ${b.tipe}: ${b.teks}` : 'Dengarkan suaranya…';
    };
    const sinkronSuaraBtn = () => { el.btnSuara.setAttribute('aria-pressed', String(suara.apakahAktif())); };

    /* ---------- Alur permainan ---------- */
    const tunda = (detik, fn) => g.jadwal.push({ t: detik, fn });
    const ucapSoal = (paksa = false) => { const b = g.soal[g.i]; if (b) suara.ucap(b.ucapan, { paksa }); hudTanya(); };
    // shortcut: rekor disimpan di localStorage (per perangkat & peramban); upgrade: kirim ke server saat ada akun/papan peringkat.
    const rekorKunci = (o) => `hn:rekor:${o.tingkat}:${o.jenis}`;

    async function mulaiGame(opsi) {
        cancelAnimationFrame(raf); suara.diam();
        html.classList.add('sedang-main'); el.game.hidden = false; el.memuat.hidden = false; el.galatKeluar.hidden = true; el.memuatTeks.textContent = 'Memuat arena 3D…';
        if (document.fullscreenEnabled && !document.fullscreenElement) el.game.requestFullscreen?.().catch(() => {});   // harus dipanggil langsung dari klik pengguna
        try { await muatDunia(); } catch (err) {
            console.error(err); el.memuatTeks.textContent = 'Arena 3D tidak bisa dimuat. Pastikan peramban mendukung WebGL, lalu coba lagi.'; el.galatKeluar.hidden = false; el.game.querySelector('.hn__spinner').hidden = true; return;
        }
        el.memuat.hidden = true; el.game.querySelector('.hn__spinner').hidden = false; dunia.ukuran();
        const cfg = TINGKAT[opsi.tingkat], soal = buatSoal(opsi);
        g = { opsi, cfg, soal, i: 0, skor: 0, nyawa: cfg.nyawa, nyawaMaks: cfg.nyawa, streak: 0, benar: 0, salah: 0, state: 'hitung', tHitung: 0, angka: -1, jadwal: [], v: cfg.laju, sebelumJeda: null };
        dunia.reset(); for (let k = 0; k < Math.min(3, soal.length); k++) dunia.pasangBaris(k, soal[k].label);
        el.nama.textContent = opsi.nama; hudSkor(); hudNyawa(); hudProgres(); hudTanya(); el.tanya.hidden = true; el.pop.innerHTML = ''; el.efek.className = 'hn__efek'; sinkronSuaraBtn();
        terakhir = performance.now(); raf = requestAnimationFrame(loop);
    }

    function evaluasi() {
        const b = g.soal[g.i], jalur = dunia.jalurSekarang(), ok = jalur === b.benar, lama = g.i;
        dunia.reaksiBaris(lama, jalur, b.benar); g.i++;
        if (ok) {
            const bonus = Math.min(g.streak, 10) * 10; g.skor += 100 + bonus; g.streak++; g.benar++;
            dunia.selebrasi(); suara.bunyi.benar(); efek('benar'); pop(g.streak > 2 ? `Hore! +${100 + bonus} (beruntun ${g.streak})` : `Hore! +${100 + bonus}`, 'ok');
        } else {
            g.nyawa--; g.streak = 0; g.salah++; dunia.tabrak(); suara.bunyi.salah(); efek('salah'); pop(`Aduh! Seharusnya ${b.teks}`, 'salah'); hudNyawa();
        }
        hudSkor(); hudProgres();
        if (g.i + 2 < g.soal.length) tunda(1.2, () => dunia.pasangBaris(g.i + 2, g.soal[g.i + 2].label));   // slot gerbang yang sudah lewat dipakai ulang
        if (g.nyawa <= 0) { g.state = 'tutup'; suara.diam(); tunda(.7, () => { dunia.akhir(false); suara.bunyi.kalah(); }); tunda(2.6, () => hasil(false)); return; }
        if (g.i >= g.soal.length) { g.state = 'tutup'; tunda(.9, () => { dunia.akhir(true); suara.bunyi.menang(); suara.ucap('Hore! Kamu hebat!', { paksa: true }); }); tunda(3.4, () => hasil(true)); return; }
        tunda(ok ? .8 : 1.3, () => ucapSoal());   // banner soal berganti bersamaan dengan suara soal berikutnya
    }

    function loop(now) {
        if (!g || g.state === 'jeda') { raf = 0; return; }
        const dt = Math.min(.05, (now - terakhir) / 1000); terakhir = now;
        for (const j of g.jadwal) j.t -= dt; const siap = g.jadwal.filter((j) => j.t <= 0); g.jadwal = g.jadwal.filter((j) => j.t > 0); siap.forEach((j) => j.fn());
        if (!g || g.state === 'selesai') return;
        if (g.state === 'hitung') {
            g.tHitung += dt; dunia.mode = 'intro'; dunia.introP = g.tHitung / 3.1;
            const n = Math.min(3, Math.floor(g.tHitung / .9)), teks = ['3', '2', '1', 'Ayo!'][n];
            if (n !== g.angka) { g.angka = n; el.hitung.textContent = teks; el.hitung.classList.remove('pukul'); void el.hitung.offsetWidth; el.hitung.classList.add('pukul'); suara.bunyi.hitung(n === 3); }
            dunia.perbarui(dt, 0);
            if (g.tHitung >= 3.5) { g.state = 'main'; dunia.mode = 'main'; el.hitung.textContent = ''; el.hitung.classList.remove('pukul'); ucapSoal(); }
        } else {
            if (g.state === 'tutup' && g.nyawa <= 0) g.v *= 1 - Math.min(1, dt * 3);
            const laju = g.state === 'main' || (g.state === 'tutup' && g.nyawa > 0) ? g.cfg.laju + Math.min(g.i * .2, g.cfg.laju * .3) : g.v;
            dunia.perbarui(dt, g.state === 'tutup' && g.nyawa <= 0 ? g.v : laju);
            if (g.state === 'main' && dunia.pemain.z <= -(JARAK_AWAL + g.i * JARAK_BARIS)) evaluasi();
        }
        dunia.gambar(); raf = requestAnimationFrame(loop);
    }

    function hasil(menang) {
        g.state = 'selesai'; cancelAnimationFrame(raf); raf = requestAnimationFrame(loopHias);
        const n = g.soal.length, rasio = g.benar / n, bintang = menang ? (rasio >= .9 ? 3 : rasio >= .6 ? 2 : 1) : (rasio >= .5 ? 1 : 0);
        const rekor = baca(rekorKunci(g.opsi), 0), rekorBaru = g.skor > rekor; if (rekorBaru) simpan(rekorKunci(g.opsi), g.skor);
        $('#hn-hasil-judul').textContent = menang ? 'Selesai, hebat!' : 'Game Over';
        $('#hn-hasil-sub').textContent = menang ? `${g.opsi.nama}, kamu melewati semua gerbang!` : `${g.opsi.nama}, nyawamu habis. Coba lagi, ya!`;
        $('#hn-h-skor').textContent = g.skor.toLocaleString('id-ID'); $('#hn-h-benar').textContent = `${g.benar}/${n}`; $('#hn-h-salah').textContent = g.salah;
        $('#hn-h-rekor').textContent = (rekorBaru ? g.skor : rekor).toLocaleString('id-ID') + (rekorBaru ? ' (baru!)' : '');
        $$('#hn-bintang svg').forEach((s, i) => s.classList.toggle('nyala', i < bintang));
        el.selesai.showModal();
    }
    function loopHias(now) { // di balik dialog hasil: dunia tetap hidup tapi ringan
        if (!g || g.state !== 'selesai') return; const dt = Math.min(.05, (now - terakhir) / 1000); terakhir = now; dunia.perbarui(dt, 0); dunia.gambar(); raf = requestAnimationFrame(loopHias);
    }

    /* ---------- Jeda, ulang, keluar ---------- */
    function jeda() {
        if (!g || !['hitung', 'main'].includes(g.state)) return;
        g.sebelumJeda = g.state; g.state = 'jeda'; suara.diam(); el.jeda.showModal();
    }
    function lanjut() {
        if (!g || g.state !== 'jeda') return;
        if (el.jeda.open) el.jeda.close(); g.state = g.sebelumJeda; terakhir = performance.now(); raf = requestAnimationFrame(loop);
        if (g.state === 'main') tunda(.4, () => ucapSoal(true));
    }
    function keluar() {
        cancelAnimationFrame(raf); raf = 0; suara.diam(); g = null;
        for (const d of [el.jeda, el.selesai]) if (d.open) d.close();
        el.game.hidden = true; html.classList.remove('sedang-main'); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
    const ulangi = () => { const o = g?.opsi || pref; if (g) g.state = 'ulang'; for (const d of [el.jeda, el.selesai]) if (d.open) d.close(); mulaiGame(o); };
    el.btnJeda.addEventListener('click', jeda);
    el.jeda.addEventListener('cancel', (e) => { e.preventDefault(); lanjut(); });       // Esc = lanjut
    el.selesai.addEventListener('cancel', (e) => e.preventDefault());
    // app.js menutup dialog saat latar diklik: jeda -> lanjut, hasil -> buka lagi (agar permainan tidak macet tanpa dialog)
    el.jeda.addEventListener('close', () => { if (g && g.state === 'jeda') lanjut(); });
    el.selesai.addEventListener('close', () => { if (g && g.state === 'selesai') el.selesai.showModal(); });
    $('#hn-lanjut').addEventListener('click', lanjut);
    $('#hn-ulangi').addEventListener('click', ulangi);
    $('#hn-keluar').addEventListener('click', keluar);
    $('#hn-main-lagi').addEventListener('click', ulangi);
    $('#hn-beranda').addEventListener('click', keluar);
    $('#hn-atur').addEventListener('click', () => { keluar(); bukaSetup(); });
    el.galatKeluar.addEventListener('click', keluar);
    document.addEventListener('visibilitychange', () => { if (document.hidden) jeda(); });

    /* ---------- Suara & layar penuh ---------- */
    el.btnSuara.addEventListener('click', () => { suara.setAktif(!suara.apakahAktif()); sinkronSuaraBtn(); if (g) { hudTanya(); if (suara.apakahAktif() && g.state === 'main') ucapSoal(true); } });
    el.btnUlang.addEventListener('click', () => { if (!g || g.state !== 'main') return; const s = performance.now(); if (s - ulangSuaraTs < 600) return; ulangSuaraTs = s; ucapSoal(true); });
    el.btnLayar.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen?.() : el.game.requestFullscreen?.().catch(() => {}); });

    /* ---------- Kendali: papan ketik, tombol layar, usap ---------- */
    const geser = (d) => { if (!g || !['hitung', 'main'].includes(g.state)) return; const awal = dunia.jalur; dunia.setJalur(awal + d); if (dunia.jalur !== awal) suara.bunyi.geser(); };
    document.addEventListener('keydown', (e) => {
        if (el.game.hidden || !g || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === 'arrowleft' || k === 'a') { if (!e.repeat) geser(-1); e.preventDefault(); }
        else if (k === 'arrowright' || k === 'd') { if (!e.repeat) geser(1); e.preventDefault(); }
        else if (k === 'p') { g.state === 'jeda' ? lanjut() : jeda(); }
        else if (k === 'm') el.btnSuara.click();
        else if (k === ' ' && g.state === 'main' && !e.repeat) { e.preventDefault(); el.btnUlang.click(); }
    });
    for (const [tombol, arah] of [[el.kiri, -1], [el.kanan, 1]]) tombol.addEventListener('pointerdown', (e) => { e.preventDefault(); geser(arah); });
    let awalX = null;
    el.kanvas.addEventListener('pointerdown', (e) => { awalX = e.clientX; });
    el.kanvas.addEventListener('pointermove', (e) => { if (awalX === null) return; const dx = e.clientX - awalX; if (Math.abs(dx) > 36) { geser(dx > 0 ? 1 : -1); awalX = e.clientX; } });
    for (const n of ['pointerup', 'pointercancel', 'pointerleave']) el.kanvas.addEventListener(n, () => { awalX = null; });
}
if (typeof document !== 'undefined') mulaiUI();   // di Node (pengujian) tidak ada DOM