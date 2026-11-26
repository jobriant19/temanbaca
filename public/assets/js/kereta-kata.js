/* Kereta Kata: seluruh logika game dalam satu berkas.
 *  1. Soal   : data kata & kalimat, pengacak susunan (tanpa DOM)
 *  2. Suara  : ucapan bahasa Indonesia (Web Speech) + efek bunyi (WebAudio)
 *  3. Dunia  : kereta, maskot buku, stasiun, pemandangan (three.js)
 *  4. Game   : alur permainan, HUD, dialog, kendali
 * Dimuat malas oleh kereta-kata.blade.php saat tombol Bermain disentuh/diklik. */
import * as THREE from '../vendor/three/three.module.js';

/* ============================================================
   1. SOAL
   ============================================================ */
// petunjuk: 'tiap' = lampu hijau/merah per gerbong, 'jumlah' = hanya jumlah gerbong yang salah, 'tidak' = hanya sinyal merah
export const TINGKAT = {
    mudah:  { nama: 'Mudah',  nyawa: 5, stasiun: 4, petunjuk: 'tiap' },
    sedang: { nama: 'Sedang', nyawa: 4, stasiun: 5, petunjuk: 'jumlah' },
    sulit:  { nama: 'Sulit',  nyawa: 3, stasiun: 6, petunjuk: 'tidak' },
};
export const JENIS = ['huruf', 'kalimat', 'gabungan'];

// Cara baca nama huruf dalam bahasa Indonesia (dipakai untuk mengeja lewat suara)
const NAMA_HURUF = {
    A: 'a', B: 'be', C: 'ce', D: 'de', E: 'e', F: 'ef', G: 'ge', H: 'ha', I: 'i', J: 'je', K: 'ka', L: 'el', M: 'em',
    N: 'en', O: 'o', P: 'pe', Q: 'ki', R: 'er', S: 'es', T: 'te', U: 'u', V: 'fe', W: 'we', X: 'eks', Y: 'ye', Z: 'zet',
};

// shortcut: kata & kalimat ditulis manual di sini (maks. 7 huruf / 5 kata per soal agar kereta muat di layar); upgrade: pindahkan ke config/gamifikasi.php atau database bila butuh ratusan soal.
const KATA = {
    mudah:  ['bola', 'buku', 'kaki', 'mata', 'roti', 'ikan', 'sapi', 'baju', 'nasi', 'topi', 'meja', 'daun', 'ayam', 'susu', 'gula', 'kuda'],
    sedang: ['rumah', 'bunga', 'jeruk', 'tangan', 'mobil', 'bulan', 'hujan', 'pohon', 'kursi', 'garpu', 'kebun', 'sepeda', 'lampu', 'sayur'],
    sulit:  ['sepatu', 'pensil', 'kucing', 'pisang', 'burung', 'sendok', 'sekolah', 'pelangi', 'kelinci', 'kereta', 'stasiun', 'kerbau'],
};
const KALIMAT = {
    mudah:  ['Ibu memasak nasi', 'Adik membaca buku', 'Ayah membeli roti', 'Kucing minum susu', 'Aku suka bola', 'Budi makan apel', 'Kakak menulis surat', 'Ani menyiram bunga'],
    sedang: ['Ayah membaca koran pagi', 'Kami bermain di taman', 'Ibu memasak sayur bayam', 'Adik memakai sepatu baru', 'Burung terbang di langit', 'Kakak membawa tas biru', 'Kelinci makan wortel segar', 'Kita belajar membaca bersama'],
    sulit:  ['Ibu membeli buah di pasar', 'Budi bermain bola di lapangan', 'Ayah menanam pohon di kebun', 'Kami membaca buku di perpustakaan', 'Kucing tidur di atas kursi', 'Ani menyiram bunga setiap pagi', 'Adik minum susu sebelum tidur', 'Kereta api berhenti di stasiun'],
};

const acak = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
// susunan acak yang pasti berbeda dari aslinya (dibandingkan per isi, jadi huruf kembar tidak menipu)
const acakBeda = (b) => { let s = acak(b); for (let n = 0; n < 30 && s.every((x, i) => x === b[i]); n++) s = acak(b); return s; };

/** Buat daftar soal. Tiap soal = satu stasiun. bagian = urutan benar, susun = urutan awal gerbong (teracak). */
export function buatSoal({ jenis, tingkat }) {
    const t = TINGKAT[tingkat] || TINGKAT.mudah, tk = TINGKAT[tingkat] ? tingkat : 'mudah', n = t.stasiun;
    const nHuruf = jenis === 'huruf' ? n : jenis === 'kalimat' ? 0 : Math.ceil(n / 2);
    const tipe = acak([...Array(nHuruf).fill('huruf'), ...Array(n - nHuruf).fill('kalimat')]);
    const kataPool = acak(KATA[tk]), kalPool = acak(KALIMAT[tk]);
    return tipe.map((jt) => {
        const teks = jt === 'huruf' ? kataPool.pop() : kalPool.pop();
        const bagian = jt === 'huruf' ? [...teks.toUpperCase()] : teks.split(' ');
        const ucapan = jt === 'huruf'
            ? `Susun huruf menjadi kata. Katanya, ${teks}. Dieja, ${bagian.map((h) => NAMA_HURUF[h] || h).join(', ')}.`
            : `Susun kata menjadi kalimat. Kalimatnya, ${teks}.`;
        return { tipe: jt, bagian, susun: acakBeda(bagian), teks, ucapan };
    });
}
/** true/false per posisi gerbong. */
export const periksa = (susun, bagian) => bagian.map((b, i) => susun[i] === b);

/* ============================================================
   2. SUARA
   ============================================================ */
const suara = (() => {
    // shortcut: ucapan memakai Web Speech API bawaan peramban; ada tidaknya & mutu suara Indonesia bergantung perangkat (teks soal otomatis tampil bila tidak ada). Kode suara ini kembar dengan huruf-ngebut.js; upgrade: ekstrak ke suara.js bersama atau rekam audio .mp3 per soal.
    const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    let suaraId = null, aktif = true, pengatur = 0, terakhir = { teks: '', waktu: 0 }, ctx = null, induk = null;

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

    /** Ucapkan satu kalimat. Selalu membatalkan ucapan sebelumnya, sehingga tidak pernah bertumpuk. */
    function ucap(teks, { paksa = false } = {}) {
        if (!synth || !aktif || !teks) return;
        const sekarang = performance.now();
        if (!paksa && terakhir.teks === teks && sekarang - terakhir.waktu < 700) return;
        terakhir = { teks, waktu: sekarang };
        clearTimeout(pengatur);
        synth.cancel();
        pengatur = setTimeout(() => { // jeda singkat: Chrome kadang membuang ucapan yang dikirim tepat setelah cancel()
            const u = new SpeechSynthesisUtterance(teks);
            u.lang = 'id-ID';
            if (suaraId || pilihSuara()) u.voice = suaraId;
            u.rate = 0.8; u.pitch = 1.08; u.volume = 1;
            synth.speak(u);
        }, 90);
    }
    function diam() { clearTimeout(pengatur); synth?.cancel(); }

    function buka() { // panggil dari klik pengguna
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            ctx = new AC();
            induk = ctx.createGain(); induk.gain.value = aktif ? 0.9 : 0; induk.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') ctx.resume();
    }
    function nada(frek, mulai, dur, { tipe = 'triangle', vol = 0.25, geser = 0 } = {}) {
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
        pilih: () => nada(660, 0, 0.1, { tipe: 'sine', vol: 0.2 }),
        tukar: () => { desis(0, 0.14, { vol: 0.14, dari: 1800, ke: 500 }); nada(520, 0, 0.08, { vol: 0.15 }); nada(390, 0.07, 0.1, { vol: 0.15 }); },
        benar: () => { [523, 659, 784, 1047].forEach((f, i) => nada(f, i * 0.07, 0.35, { vol: 0.22 })); nada(1568, 0.3, 0.5, { tipe: 'sine', vol: 0.12 }); },
        salah: () => { nada(196, 0, 0.2, { tipe: 'square', vol: 0.12, geser: -30 }); nada(185, 0.24, 0.3, { tipe: 'square', vol: 0.12, geser: -50 }); desis(0, 0.3, { vol: 0.22, dari: 800, ke: 120 }); },
        peluit: () => { nada(784, 0, 0.55, { vol: 0.16, geser: 30 }); nada(988, 0, 0.55, { vol: 0.12, geser: 30 }); },
        chug: () => desis(0, 0.09, { vol: 0.16, dari: 1100, ke: 260 }),
        tiba: () => { nada(1175, 0, 0.5, { tipe: 'sine', vol: 0.2 }); nada(880, 0.35, 0.7, { tipe: 'sine', vol: 0.2 }); },
        menang: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => nada(f, i * 0.12, 0.3, { vol: 0.22 })); },
        kalah: () => { [392, 330, 262, 196].forEach((f, i) => nada(f, i * 0.2, 0.4, { tipe: 'sine', vol: 0.22 })); },
    };
    return { adaUcapan, adaSuaraIndonesia, namaSuara, apakahAktif, setAktif, ucap, diam, buka, bunyi };
})();

/* ============================================================
   3. DUNIA 3D
   ============================================================ */
const JARAK = 70;          // jarak antar stasiun (satuan dunia)
const LOK = 4.6;           // panjang lokomotif
const GANDENG = 0.34;      // celah antar gerbong
const WARNA_GERBONG = [0xff5d8f, 0x35b6ff, 0x4fd47a, 0xffb02e, 0xb46bff, 0xff8a3d, 0x2fd0c3];
const WARNA_PESTA = [0xff4f86, 0xffc400, 0x35b6ff, 0x5be37d, 0xb46bff, 0xff8a3d];
const FONT = '"Lilita One", "Fredoka", system-ui, sans-serif';

const rand = (a, b) => a + Math.random() * (b - a);
const tepi = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lilit = (x, p) => ((x % p) + p) % p;
const keluarKubik = (x) => 1 - (1 - x) ** 3;
const masukKeluar = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const muncul = (x) => 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2;   // easeOutBack
const lebarGerbong = (label) => Math.min(4.2, Math.max(1.8, 0.9 + label.length * 0.28));

const kanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const tekstur = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const bulat = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.05, ...o });
const kotak = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };

/* ---------- Tekstur buatan (digambar dengan canvas, tanpa berkas gambar) ---------- */
function texLangit() {
    const [c, g] = kanvas(4, 512), l = g.createLinearGradient(0, 0, 0, 512);
    [[0, '#4aaeff'], [0.45, '#8fd3ff'], [0.75, '#d4f1ff'], [1, '#fff2c2']].forEach(([o, w]) => l.addColorStop(o, w));
    g.fillStyle = l; g.fillRect(0, 0, 4, 512); return tekstur(c);
}
function texCahaya() {
    const [c, g] = kanvas(128, 128), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return tekstur(c);
}
/** Papan nama di badan gerbong: satu huruf atau satu kata. rasio = lebar/tinggi papan. */
function texPlat(teks, rasio) {
    const W = 512, H = Math.max(160, Math.round(W / rasio)), [c, g] = kanvas(W, H);
    bulat(g, 6, 6, W - 12, H - 12, 34); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a2670'; g.stroke();
    let f = Math.round(H * 0.66); g.font = `${f}px ${FONT}`;
    while (g.measureText(teks).width > W * 0.8 && f > 28) { f -= 4; g.font = `${f}px ${FONT}`; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2a2670'; g.fillText(teks, W / 2, H / 2 + f * 0.06);
    return tekstur(c);
}
function texPapan(judul, sub) {
    const [c, g] = kanvas(1024, 256);
    bulat(g, 8, 8, 1008, 240, 40); g.fillStyle = '#2a3f9e'; g.fill(); g.lineWidth = 12; g.strokeStyle = '#ffffff'; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff'; g.font = `120px ${FONT}`; g.fillText(judul, 512, 105);
    g.fillStyle = '#ffe066'; g.font = `52px ${FONT}`; g.fillText(sub, 512, 195);
    return tekstur(c);
}
function texWajah(mode) {
    const [c, g] = kanvas(256, 320);
    g.fillStyle = '#fff4d6'; g.fillRect(0, 0, 256, 320);
    g.fillStyle = 'rgba(255,120,150,.55)'; for (const x of [52, 204]) { g.beginPath(); g.ellipse(x, 190, 22, 14, 0, 0, 7); g.fill(); }
    g.fillStyle = '#2b2250'; g.strokeStyle = '#2b2250'; g.lineCap = 'round'; g.lineWidth = 9;
    for (const x of [90, 166]) {
        if (mode === 'kedip') { g.beginPath(); g.moveTo(x - 20, 128); g.quadraticCurveTo(x, 142, x + 20, 128); g.stroke(); continue; }
        const rx = mode === 'kaget' ? 24 : 19, ry = mode === 'kaget' ? 34 : mode === 'sedih' ? 24 : 30;
        g.fillStyle = '#2b2250'; g.beginPath(); g.ellipse(x, 130, rx, ry, 0, 0, 7); g.fill();
        g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x - 6, 118, 7, 0, 7); g.fill();
        if (mode === 'sedih') { const d = x < 128 ? 1 : -1; g.beginPath(); g.moveTo(x - 24 * d, 100); g.lineTo(x + 22 * d, 84); g.stroke(); }
    }
    if (mode === 'senang') {
        g.fillStyle = '#7a1f3d'; g.beginPath(); g.arc(128, 208, 44, 0, Math.PI); g.closePath(); g.fill();
        g.fillStyle = '#ff7a9c'; g.beginPath(); g.ellipse(128, 238, 18, 10, 0, 0, 7); g.fill();
    } else if (mode === 'sedih') { g.beginPath(); g.arc(128, 250, 30, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    else if (mode === 'kaget') { g.fillStyle = '#2b2250'; g.beginPath(); g.ellipse(128, 226, 16, 22, 0, 0, 7); g.fill(); }
    else { g.beginPath(); g.arc(128, 212, 30, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
    return tekstur(c);
}

/* ---------- Asap lokomotif (sprite berputar-ganti) ---------- */
class Asap {
    constructor(scene, tex, n = 26) {
        this.i = 0;
        this.p = Array.from({ length: n }, () => {
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }));
            s.visible = false; scene.add(s); return { s, u: 1, k: 1, v: new THREE.Vector3() };
        });
    }
    muncul(x, y, z, k = 1) {
        const q = this.p[(this.i = (this.i + 1) % this.p.length)];
        q.u = 0; q.k = k; q.s.position.set(x, y, z); q.v.set(rand(-0.6, 0.2), rand(1.4, 2.4), rand(-0.2, 0.2)); q.s.visible = true;
    }
    perbarui(dt, dS) {   // dS: jarak gulir dunia, asap tertinggal di tempat sementara kereta melaju
        for (const q of this.p) {
            if (q.u >= 1) continue;
            q.u += dt / 1.6;
            if (q.u >= 1) { q.s.visible = false; continue; }
            q.s.position.addScaledVector(q.v, dt); q.s.position.x -= dS;
            q.s.scale.setScalar((1.2 + q.u * 3.2) * q.k); q.s.material.opacity = (1 - q.u) * 0.8;
        }
    }
}

/* ---------- Percikan pesta (satu Points untuk semua partikel) ---------- */
class Percik {
    constructor(scene, tex, maks = 500) {
        this.maks = maks; this.idx = 0; this.c = new THREE.Color();
        this.pos = new Float32Array(maks * 3).fill(-9999); this.warna = new Float32Array(maks * 3); this.vel = new Float32Array(maks * 3); this.sisa = new Float32Array(maks);
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.warna, 3));
        this.titik = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.5, map: tex, vertexColors: true, transparent: true, alphaTest: 0.3, depthWrite: false }));
        this.titik.frustumCulled = false; scene.add(this.titik);
    }
    ledak(x, y, z, n, palet = WARNA_PESTA, laju = 7, naik = 4, umur = 1.2) {
        for (let k = 0; k < n; k++) {
            const i = (this.idx = (this.idx + 1) % this.maks), j = i * 3, a = Math.random() * 6.283, b = Math.random() * 1.2, s = laju * (0.35 + Math.random() * 0.65);
            this.pos.set([x, y, z], j); this.vel.set([Math.cos(a) * s * Math.cos(b), Math.sin(b) * s + naik * Math.random(), Math.sin(a) * s * Math.cos(b)], j);
            this.c.setHex(palet[Math.floor(Math.random() * palet.length)]); this.warna.set([this.c.r, this.c.g, this.c.b], j); this.sisa[i] = umur * (0.6 + Math.random() * 0.6);
        }
        this.titik.geometry.attributes.color.needsUpdate = true;
    }
    perbarui(dt) {
        for (let i = 0; i < this.maks; i++) {
            if (this.sisa[i] <= 0) continue;
            const j = i * 3; this.sisa[i] -= dt;
            if (this.sisa[i] <= 0) { this.pos[j + 1] = -9999; continue; }
            this.vel[j + 1] -= 9 * dt; this.pos[j] += this.vel[j] * dt; this.pos[j + 1] += this.vel[j + 1] * dt; this.pos[j + 2] += this.vel[j + 2] * dt;
        }
        this.titik.geometry.attributes.position.needsUpdate = true;
    }
}

/* ---------- Maskot: buku bertopi masinis, penumpang di kabin lokomotif ---------- */
class Maskot {
        constructor() {
        const g = this.g = new THREE.Group();
        const tambah = (o, x, y, z) => { o.position.set(x, y, z); g.add(o); return o; };
        const silinder = (a, b, h, mat, x, y, z, seg = 24) => tambah(new THREE.Mesh(new THREE.CylinderGeometry(a, b, h, seg), mat), x, y, z);
        const bola = (r, mat, x, y, z) => tambah(new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat), x, y, z);
        const biru = M(0x2f4fb0), biruTua = M(0x1d2f78), emas = M(0xffc400, { metalness: 0.5, roughness: 0.3 }), merah = M(0xe24a6b), putih = M(0xffffff), hitam = M(0x1d1d2e);
        this.wajah = Object.fromEntries(['biasa', 'senang', 'sedih', 'kaget', 'kedip'].map((k) => [k, texWajah(k)]));

        // buku: sampul, punggung emas, halaman bertumpuk, bingkai emas di sekeliling wajah
        tambah(kotak(1.1, 1.45, 0.12, M(0x3f8cff)), 0, 0.82, -0.2);
        tambah(kotak(0.14, 1.5, 0.5, emas), -0.56, 0.82, -0.02);
        tambah(kotak(0.96, 1.34, 0.32, M(0xfff4d6)), 0.03, 0.82, 0);
        for (const k of [0, 1, 2]) tambah(kotak(0.03, 1.3 - k * 0.04, 0.3, M(0xe9d3a0)), 0.53 + k * 0.012, 0.82, 0);   // tepi halaman
        this.muka = tambah(new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.15), new THREE.MeshBasicMaterial({ map: this.wajah.biasa })), 0.03, 0.82, 0.17);
        for (const y of [1.405, 0.235]) tambah(kotak(0.94, 0.035, 0.04, emas), 0.03, y, 0.18);
        for (const x of [-0.43, 0.49]) tambah(kotak(0.035, 1.17, 0.04, emas), x, 0.82, 0.18);

        // topi masinis: kepi biru + pita merah + lencana emas + kacamata pelindung + visor
        silinder(0.5, 0.52, 0.07, biruTua, 0, 1.52, 0.02);
        silinder(0.44, 0.5, 0.26, biru, 0, 1.66, 0);
        silinder(0.515, 0.515, 0.06, merah, 0, 1.57, 0);
        silinder(0.52, 0.46, 0.06, biruTua, 0, 1.81, 0);
        tambah(kotak(0.62, 0.04, 0.32, hitam), 0, 1.52, 0.42).rotation.x = 0.18;
        silinder(0.11, 0.11, 0.03, emas, 0, 1.67, 0.47, 20).rotation.x = Math.PI / 2;
        bola(0.045, merah, 0, 1.67, 0.49);
        tambah(new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.025, 6, 28), M(0x3a2a1a)), 0, 1.75, 0).rotation.x = Math.PI / 2;   // tali kacamata
        for (const s of [-1, 1]) {
            tambah(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 16), emas), s * 0.19, 1.77, 0.45);
            tambah(new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), M(0x9fe7ff, { transparent: true, opacity: 0.65, metalness: 0.3, roughness: 0.1, side: THREE.DoubleSide })), s * 0.19, 1.77, 0.452);
        }

        // seragam: dasi kupu-kupu, jam saku berantai, pundak (epaulet), sepatu bot berkancing
        for (const s of [-1, 1]) {
            tambah(new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.24, 10), merah), s * 0.13, 0.27, 0.2).rotation.z = s * Math.PI / 2;
            tambah(kotak(0.22, 0.07, 0.34, biruTua), s * 0.52, 1.47, 0.02); tambah(kotak(0.22, 0.02, 0.1, emas), s * 0.52, 1.51, 0.02);
            tambah(kotak(0.34, 0.26, 0.46, hitam), s * 0.26, 0.15, 0.1); tambah(kotak(0.36, 0.05, 0.5, M(0x6a3b1c)), s * 0.26, 0.025, 0.1); tambah(kotak(0.1, 0.1, 0.02, emas), s * 0.26, 0.22, 0.34);
        }
        bola(0.07, merah, 0, 0.27, 0.2);
        silinder(0.1, 0.1, 0.04, emas, 0.36, 0.2, 0.19, 20).rotation.x = Math.PI / 2;
        silinder(0.075, 0.075, 0.045, putih, 0.36, 0.2, 0.19, 20).rotation.x = Math.PI / 2;
        tambah(kotak(0.015, 0.2, 0.015, emas), 0.36, 0.36, 0.19);

        // lengan berseragam: lengan biru, strip emas, manset putih, sarung tangan; pivot di bahu, sudut positif mengayun ke +x
        this.lengan = [-1, 1].map((s) => {
            const p = new THREE.Group(); p.position.set(s * 0.62, 1.0, 0.05);
            for (const [geo, mat, y] of [
                [new THREE.CylinderGeometry(0.09, 0.105, 0.5, 10), biru, -0.25],
                [new THREE.CylinderGeometry(0.115, 0.115, 0.07, 10), emas, -0.1],
                [new THREE.CylinderGeometry(0.115, 0.115, 0.06, 10), putih, -0.5],
                [new THREE.SphereGeometry(0.14, 12, 10), putih, -0.6],
            ]) { const m = new THREE.Mesh(geo, mat); m.position.y = y; p.add(m); }
            g.add(p); return p;
        });
        this.mode = 'biasa'; this.sisa = 0; this.kedip = 0;
    }
    set(mode, lama = 0) { this.mode = mode; this.sisa = lama; }
    perbarui(t, dt) {
        if (this.sisa > 0 && (this.sisa -= dt) <= 0) this.mode = 'biasa';
        this.kedip -= dt; if (this.kedip < -3.2) this.kedip = 0.14;
        const m = this.kedip > 0 && this.mode === 'biasa' ? 'kedip' : this.mode;
        this.muka.material.map = this.wajah[m];
        const ria = this.mode === 'senang';
        this.lengan[1].rotation.z = ria ? 2.5 + Math.sin(t * 10) * 0.5 : 0.5 + Math.sin(t * 2) * 0.05;
        this.lengan[0].rotation.z = ria ? -(2.5 + Math.sin(t * 10 + 1) * 0.5) : -0.5 - Math.sin(t * 2) * 0.05;
        this.g.position.y = this.y0 + (ria ? Math.abs(Math.sin(t * 6)) * 0.18 : Math.sin(t * 3) * 0.03);
        this.g.rotation.z = this.mode === 'sedih' ? Math.sin(t * 14) * 0.05 : 0;
    }
}

/* ---------- Dunia: kamera, pemandangan bergulir, stasiun, kereta ---------- */
// Kereta selalu diam di tengah layar; yang bergerak adalah pemandangan (this.scroll). Stasiun ke-i ada di x = i*JARAK - scroll.
class Dunia {
    constructor(induk, renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })) {
        this.induk = induk; this.renderer = renderer;
        this.t = 0; this.scroll = 0; this.kec = 0; this.jalan = null; this.getar = 0; this.pesta = 0; this.bakar = 0; this.mogok = false; this.asapT = 0;
        this.idx = 0; this.slot = []; this.keluar = []; this.stasiun = []; this.dekor = []; this.pilih = -1; this.kursor = -1; this.lokX = 0; this.lebar = LOK; this.kanan = LOK / 2;
        this.gRoda = new Map(); this.ray = new THREE.Raycaster();
        renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; induk.appendChild(renderer.domElement);
        const s = this.scene = new THREE.Scene(); s.background = texLangit(); s.fog = new THREE.Fog(0xcfeeff, 70, 210);
        this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);
        s.add(new THREE.HemisphereLight(0xffffff, 0x8fd49a, 1.7));
        const m = new THREE.DirectionalLight(0xfff1d6, 2.6); m.position.set(-10, 18, 14); s.add(m);
        this.mRoda = M(0x2b2748, { roughness: 0.4, metalness: 0.4 }); this.mHub = M(0xd9d9ef, { roughness: 0.3, metalness: 0.6 });
        this.bangunLatar(); this.bangunLok();
        this.asap = new Asap(s, texCahaya()); this.percik = new Percik(s, texCahaya());
        this.ukuran();
    }

    /* ----- pemandangan ----- */
    bangunLatar() {
        const s = this.scene, hijau = [0x3fbf6a, 0x2fae5c, 0x55cf7a];
        const datar = (w, d, mat, y, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); p.rotation.x = -Math.PI / 2; p.position.set(0, y, z); s.add(p); };
        datar(700, 260, M(0x72d68a, { roughness: 1 }), 0, -60);       // padang
        datar(700, 3.4, M(0xb9a07c, { roughness: 1 }), 0.03, 0);      // kerikil rel
        for (const z of [-0.8, 0.8]) s.add(kotak(700, 0.1, 0.12, M(0x8a8fa8, { metalness: 0.6, roughness: 0.35 }), 0, 0.19, z));
        const n = 130, d = new THREE.Object3D();
        this.bantal = new THREE.InstancedMesh(new THREE.BoxGeometry(0.36, 0.14, 2.7), M(0x7a5238), n);
        for (let i = 0; i < n; i++) { d.position.set(i - n / 2, 0.1, 0); d.updateMatrix(); this.bantal.setMatrixAt(i, d.matrix); }
        s.add(this.bantal);

        const taruh = (o, x0, f, P, v = 0) => { s.add(o); this.dekor.push({ o, x0, f, P, v }); };
        for (let n2 = 0; n2 < 26; n2++) {     // pohon di belakang rel
            const k = rand(0.9, 1.8), g = new THREE.Group(), warna = M(hijau[n2 % 3]);
            const batang = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * k, 0.26 * k, 1.6 * k, 8), M(0x8b5a33)); batang.position.y = 0.8 * k; g.add(batang);
            for (const [x, y, z, r] of [[0, 2.3, 0, 1.2], [0.7, 1.8, 0.3, 0.9], [-0.7, 1.9, -0.2, 0.9]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r * k, 12, 10), warna); b.position.set(x * k, y * k, z * k); g.add(b); }
            g.position.z = -rand(7, 26); taruh(g, rand(-100, 100), 1, 200);
        }
        for (let n2 = 0; n2 < 16; n2++) {     // semak & bunga di depan rel
            const r = rand(0.4, 0.8), b = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), M(hijau[n2 % 3], { roughness: 1 }));
            b.position.set(0, r * 0.6, rand(4.5, 9)); taruh(b, rand(-100, 100), 1, 200);
        }
        for (let n2 = 0; n2 < 22; n2++) {
            const b = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), M(WARNA_PESTA[n2 % 6], { roughness: 0.6 }));
            b.position.set(0, 0.2, rand(3.5, 8)); taruh(b, rand(-100, 100), 1, 200);
        }
        for (let n2 = 0; n2 < 7; n2++) {      // bukit jauh
            const b = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), M([0x66c882, 0x58bb78, 0x7ad69a][n2 % 3], { roughness: 1 }));
            b.scale.set(rand(16, 26), rand(6, 11), rand(8, 12)); b.position.set(0, -2, -48); taruh(b, n2 * 38 - 110, 0.18, 240);
        }
        for (let n2 = 0; n2 < 5; n2++) {      // gunung sangat jauh
            const h = rand(26, 42), b = new THREE.Mesh(new THREE.ConeGeometry(rand(16, 24), h, 5), M(0x9fb3ee, { roughness: 1 }));
            b.position.set(0, h / 2 - 1, -90); taruh(b, n2 * 70 - 140, 0.07, 300);
        }
        const putih = M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 1 });
        for (let n2 = 0; n2 < 9; n2++) {      // awan melayang
            const g = new THREE.Group();
            for (const [x, y, r] of [[0, 0, 2], [2, -0.3, 1.5], [-2, -0.4, 1.4], [0.8, 0.9, 1.4]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), putih); b.position.set(x, y, 0); g.add(b); }
            g.position.set(0, rand(12, 22), -rand(30, 70)); taruh(g, rand(-120, 120), 0.04, 260, rand(0.3, 0.8));
        }
        const matahari = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 16), new THREE.MeshBasicMaterial({ color: 0xffe066, fog: false })); matahari.position.set(-35, 24, -100); s.add(matahari);
        const cahaya = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCahaya(), color: 0xfff2a0, fog: false, transparent: true, opacity: 0.7, depthWrite: false })); cahaya.scale.setScalar(60); cahaya.position.copy(matahari.position); s.add(cahaya);
    }

    /* ----- stasiun (dibuat ulang tiap permainan baru; n = jumlah soal, stasiun terakhir = tujuan) ----- */
    buatStasiun(i, akhir) {
        const g = new THREE.Group(), buang = [], pastel = [0xffd6a5, 0xcaffbf, 0x9bf6ff, 0xffc6ff, 0xfdffb6][i % 5];
        const bahan = (c, o) => { const m = M(c, o); buang.push(m); return m; };
        const tambah = (m, p = g) => { buang.push(m.geometry); p.add(m); return m; };
        const sil = (a, b, h, mat, x, y, z, seg = 16, p = g) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(a, b, h, seg), mat); m.position.set(x, y, z); return tambah(m, p); };
        const bola = (r, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat); m.position.set(x, y, z); return tambah(m); };
        const gelap = bahan(0x34345a), kayu = bahan(0x8a5a3a), emas = bahan(0xffc400, { metalness: 0.4, roughness: 0.35 }), putih = bahan(0xffffff), daun = bahan(0x2fae5c, { roughness: 1 }), merahAtap = bahan(0xe24a6b);

        // peron + gedung stasiun
        tambah(kotak(24, 0.6, 4.4, bahan(0xe9e1d0), 0, 0.3, -4.3));
        tambah(kotak(24, 0.05, 0.2, bahan(0xffd23f), 0, 0.62, -2.22));
        tambah(kotak(16, 4.2, 3.4, bahan(pastel), 0, 2.7, -8));
        for (const s of [1, -1]) { const a = tambah(kotak(17.4, 0.3, 2.7, merahAtap, 0, 5.3, -8 + s * 1.2)); a.rotation.x = s * 0.38; }   // atap pelana
        tambah(kotak(1.8, 2.2, 0.15, kayu, 0, 1.7, -6.22)); tambah(kotak(2.1, 2.4, 0.1, putih, 0, 1.8, -6.27)); bola(0.07, emas, 0.6, 1.7, -6.12);
        for (const x of [-6, -3.4, 3.4, 6]) {
            tambah(kotak(1.9, 1.5, 0.1, putih, x, 1.9, -6.27));
            tambah(kotak(1.6, 1.2, 0.12, bahan(0x8fd8ff, { emissive: 0x3a8fbf, emissiveIntensity: 0.35 }), x, 1.9, -6.22));
            tambah(kotak(0.05, 1.2, 0.14, putih, x, 1.9, -6.2));
        }
        tambah(kotak(0.9, 1.6, 0.9, bahan(0xb5533c), -5.5, 6.3, -8.4)); tambah(kotak(1.1, 0.15, 1.1, gelap, -5.5, 7.15, -8.4));   // cerobong gedung
        const papan = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.8), new THREE.MeshBasicMaterial({ map: texPapan(akhir ? 'TUJUAN' : `STASIUN ${i + 1}`, akhir ? 'Kamu sampai!' : 'Susun, lalu berangkat') }));
        papan.position.set(0, 3.85, -6.2); buang.push(papan.geometry, papan.material, papan.material.map); g.add(papan);

        // menara jam dengan jarum yang berputar
        tambah(kotak(1.8, 3.0, 1.8, bahan(0xf3e7d3), 0, 6.9, -8));
        const muka = sil(0.62, 0.62, 0.08, putih, 0, 7.1, -7.08, 24); muka.rotation.x = Math.PI / 2;
        tambah(new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.06, 8, 24), emas)).position.set(0, 7.1, -7.06);
        const menit = new THREE.Group(), jamH = new THREE.Group();
        for (const [grup, panjang, tebal] of [[menit, 0.5, 0.05], [jamH, 0.32, 0.07]]) { grup.position.set(0, 7.1, -7.0); tambah(kotak(tebal, panjang, 0.03, gelap, 0, panjang / 2, 0), grup); g.add(grup); }
        const puncak = tambah(new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.3, 4), merahAtap)); puncak.position.set(0, 9.05, -8); puncak.rotation.y = Math.PI / 4;
        sil(0.03, 0.03, 0.8, gelap, 0, 9.95, -8, 6); bola(0.1, emas, 0, 10.4, -8);

        // kanopi peron berpilar dengan jumbai merah-putih
        for (const x of [-9, -4.5, 0, 4.5, 9]) tambah(kotak(0.14, 2.9, 0.14, gelap, x, 2.05, -2.5));
        tambah(kotak(20, 0.2, 2.6, merahAtap, 0, 3.6, -3.85)).rotation.x = 0.08;
        for (let k = 0; k < 10; k++) tambah(kotak(2, 0.3, 0.08, k % 2 ? putih : merahAtap, -9 + k * 2, 3.38, -2.52));

        // loket tiket
        tambah(kotak(2.2, 2.2, 1.4, bahan(0x6ec6ff), -6.8, 1.7, -4.6)); tambah(kotak(2.6, 0.15, 1.8, bahan(0xff8a3d), -6.8, 2.88, -4.6));
        tambah(kotak(1.4, 0.7, 0.06, bahan(0x1f1d3d), -6.8, 1.9, -3.88));
        for (let k = 0; k < 4; k++) tambah(kotak(0.6, 0.08, 0.7, k % 2 ? putih : bahan(0xff4f86), -7.7 + k * 0.6, 2.65, -3.8)).rotation.x = 0.35;

        // bangku, koper & peti barang, pot tanaman
        for (const x of [3.5, 6.8]) {
            tambah(kotak(1.8, 0.1, 0.55, kayu, x, 1.15, -3.2)); tambah(kotak(1.8, 0.5, 0.08, kayu, x, 1.5, -3.5));
            for (const d of [-0.8, 0.8]) tambah(kotak(0.1, 0.55, 0.45, gelap, x + d, 0.88, -3.25));
        }
        tambah(kotak(0.9, 0.7, 0.7, bahan(0xc98b4a), -2.3, 0.95, -4.4)); tambah(kotak(0.7, 0.55, 0.6, merahAtap, -1.4, 0.88, -4.4));
        tambah(kotak(0.8, 0.5, 0.3, bahan(0x2f4fb0), -2.3, 1.55, -4.4)); tambah(kotak(0.25, 0.06, 0.06, emas, -2.3, 1.84, -4.4));
        for (const x of [-8.6, -4.6, 4.6, 8.6]) {
            tambah(kotak(1.3, 0.5, 0.6, kayu, x, 0.85, -6.0)); bola(0.55, daun, x, 1.4, -6.0);
            for (const [dx, w] of [[-0.3, 0], [0.25, 2], [0, 4]]) bola(0.12, bahan(WARNA_PESTA[w], { roughness: 0.6 }), x + dx, 1.8 - Math.abs(dx) * 0.3, -5.6);
        }
        for (const x of [-11.5, 11.5]) {                                              // tiang lampu
            tambah(kotak(0.14, 3.6, 0.14, gelap, x, 2.4, -2.7));
            bola(0.28, bahan(0xfff2a0, { emissive: 0xffe066, emissiveIntensity: 1.2 }), x, 4.4, -2.7);
        }
        // menara air di kejauhan
        for (const [dx, dz] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) tambah(kotak(0.2, 4, 0.2, gelap, 19 + dx, 2, -14 + dz));
        sil(1.6, 1.6, 2, kayu, 19, 5, -14, 20); const atapAir = tambah(new THREE.Mesh(new THREE.ConeGeometry(1.8, 1, 20), merahAtap)); atapAir.position.set(19, 6.5, -14);

        if (akhir) {                                                                  // stasiun tujuan: karpet merah, bendera, balon
            tambah(kotak(10, 0.03, 1.2, bahan(0xd7263d), 0, 0.63, -3.0));
            for (const x of [-11, -7, 7, 11]) {
                tambah(kotak(0.1, 3.2, 0.1, putih, x, 2.2, -2.7));
                const b = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), bahan(WARNA_PESTA[Math.abs(x) % 6], { side: THREE.DoubleSide })); b.position.set(x + 0.7, 3.4, -2.7); tambah(b);
            }
            for (let k = 0; k < 8; k++) {
                const x = -10 + k * 2.9, y = 6 + (k % 3) * 0.7;
                bola(0.45, bahan(WARNA_PESTA[k % 6], { roughness: 0.3 }), x, y, -3); tambah(kotak(0.02, 2.4, 0.02, putih, x, y - 1.6, -3));
            }
        }

        // sinyal kereta: merah = belum boleh berangkat, hijau = jalan
        const sg = new THREE.Group(), merah = bahan(0x5a1020, { emissive: 0xff2244, emissiveIntensity: 0.1 }), hijau = bahan(0x0f4a24, { emissive: 0x22ee66, emissiveIntensity: 0.1 });
        sg.position.set(14, 0.6, -2.7);
        tambah(kotak(0.2, 3.2, 0.2, gelap, 0, 1.6, 0), sg); tambah(kotak(0.95, 2.0, 0.5, bahan(0x1f1d3d), 0, 4.0, 0), sg);
        for (const [mat, y] of [[merah, 4.5], [hijau, 3.5]]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), mat); l.position.set(0, y, 0.28); tambah(l, sg); }
        g.add(sg);
        this.scene.add(g);
        return { g, sg, merah, hijau, mode: 'merah', buang, jarum: [menit, jamH] };
    }
    buangStasiun() { for (const st of this.stasiun) { this.scene.remove(st.g); st.buang.forEach((o) => o.dispose?.()); } this.stasiun = []; }

    /* ----- lokomotif + maskot ----- */
    buatRoda(r, x, y, z) {
        if (!this.gRoda.has(r)) this.gRoda.set(r, [new THREE.CylinderGeometry(r, r, 0.16, 20).rotateX(Math.PI / 2), new THREE.CylinderGeometry(r * 0.4, r * 0.4, 0.22, 12).rotateX(Math.PI / 2), new THREE.BoxGeometry(r * 1.7, 0.1, 0.24)]);
        const [a, b, c] = this.gRoda.get(r), w = new THREE.Group();
        w.add(new THREE.Mesh(a, this.mRoda), new THREE.Mesh(b, this.mHub), new THREE.Mesh(c, this.mHub));
        w.position.set(x, y, z); w.userData.r = r; return w;
    }
    bangunLok() {
        const g = this.lok = new THREE.Group(), merah = M(0xe24a6b), gelap = M(0x2d2a52), emas = M(0xffc400, { metalness: 0.4, roughness: 0.35 });
        const silinder = (r1, r2, h, mat, x, y, z, rotZ = false) => { const geo = new THREE.CylinderGeometry(r1, r2, h, 24); if (rotZ) geo.rotateZ(Math.PI / 2); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
        g.add(kotak(4.6, 0.3, 1.7, gelap, 0, 0.62, 0));
        silinder(0.8, 0.8, 2.8, merah, 0.9, 1.55, 0, true);                      // ketel
        silinder(0.84, 0.84, 0.3, gelap, 2.15, 1.55, 0, true);                   // ujung ketel
        silinder(0.82, 0.82, 0.12, emas, 0.1, 1.55, 0, true); silinder(0.82, 0.82, 0.12, emas, 1.5, 1.55, 0, true);
        silinder(0.2, 0.26, 0.9, gelap, 1.7, 2.55, 0); silinder(0.36, 0.22, 0.22, gelap, 1.7, 3.1, 0);   // cerobong
        const kubah = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), emas); kubah.position.set(0.5, 2.35, 0); g.add(kubah);
        const lampu = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), M(0xfff2a0, { emissive: 0xffe066, emissiveIntensity: 1.5 })); lampu.position.set(2.35, 1.55, 0); g.add(lampu);
        const tanduk = kotak(0.8, 0.1, 1.6, gelap, 2.65, 0.5, 0); tanduk.rotation.z = -0.45; g.add(tanduk);
        g.add(kotak(0.3, 0.14, 0.14, gelap, -2.45, 0.8, 0));
        // kabin terbuka agar maskot terlihat
        g.add(kotak(2.0, 0.12, 1.7, gelap, -1.3, 0.88, 0)); g.add(kotak(0.12, 1.1, 1.7, merah, -2.28, 1.45, 0));
        for (const s of [-1, 1]) { g.add(kotak(2.0, 0.62, 0.12, merah, -1.3, 1.2, s * 0.82)); for (const x of [-2.22, -0.4]) g.add(kotak(0.12, 2.2, 0.12, gelap, x, 2.0, s * 0.8)); }
        g.add(kotak(2.5, 0.16, 2.1, gelap, -1.3, 3.1, 0)); g.add(kotak(2.3, 0.06, 1.9, emas, -1.3, 3.2, 0));
        this.rodaLok = [];
        for (const s of [-1, 1]) {
            for (const x of [-1.5, -0.3, 0.9]) { const w = this.buatRoda(0.55, x, 0.79, s * 1.0); g.add(w); this.rodaLok.push(w); }
            const k = this.buatRoda(0.32, 1.95, 0.56, s * 1.0); g.add(k); this.rodaLok.push(k);
        }
        this.batang = [-1, 1].map((s) => { const b = kotak(2.4, 0.1, 0.1, M(0xcfd2e8, { metalness: 0.7, roughness: 0.3 }), -0.3, 0.79, s * 1.1); b.userData.z = s * 1.1; g.add(b); return b; });
        this.maskot = new Maskot(); this.maskot.y0 = 0.94; this.maskot.g.position.set(-1.3, 0.94, 0); this.maskot.g.rotation.y = 0.18; g.add(this.maskot.g);
        this.kereta = new THREE.Group(); this.kereta.add(g); this.scene.add(this.kereta);
    }

    /* ----- gerbong ----- */
    buatGerbong(label, i) {
        const w = lebarGerbong(label), warna = WARNA_GERBONG[i % WARNA_GERBONG.length], g = new THREE.Group(), buang = [], roda = [];
        const bahan = (c, o) => { const m = M(c, o); buang.push(m); return m; };
        const tambah = (m) => { buang.push(m.geometry); g.add(m); return m; };
        tambah(kotak(w, 1.3, 1.9, bahan(warna), 0, 1.3, 0));
        tambah(kotak(w + 0.2, 0.22, 1.7, bahan(0x3a3560), 0, 0.72, 0));
        tambah(kotak(w + 0.1, 0.16, 2.1, bahan(new THREE.Color(warna).multiplyScalar(0.65)), 0, 2.05, 0));
        tambah(kotak(GANDENG + 0.14, 0.14, 0.14, bahan(0x2b2748), w / 2 + GANDENG / 2, 0.8, 0));   // kait ke gerbong berikutnya
        const pw = Math.min(w * 0.86, 3.1), tex = texPlat(label, pw / 1.0), pm = bahan(0xffffff, { map: tex }); buang.push(tex);
        for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(pw, 1.0), pm); buang.push(p.geometry); p.position.set(0, 1.3, s * 0.96); p.rotation.y = s > 0 ? 0 : Math.PI; g.add(p); }
        for (const s of [-1, 1]) for (const x of [-w * 0.3, w * 0.3]) { const r = this.buatRoda(0.32, x, 0.56, s * 1.0); g.add(r); roda.push(r); }
        const lm = bahan(0x444455, { emissive: 0x000000, emissiveIntensity: 1 });
        const lampu = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), lm); lampu.position.set(0, 2.32, 0); tambah(lampu);
        const panah = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 12), bahan(0xffffff, { emissive: 0xffd23f, emissiveIntensity: 0.6 })); panah.rotation.x = Math.PI; panah.position.y = 3.05; panah.visible = false; tambah(panah);
        g.userData = { gerbong: true, label, w, x: 0, tx: 0, s: -i * 0.12, pergi: 0, roda, buang, lm, panah };
        g.scale.setScalar(0.001); this.kereta.add(g);
        return g;
    }
    hapusGerbong(g) { this.kereta.remove(g); g.userData.buang.forEach((o) => o.dispose?.()); }
    tata(segera = false) {
        let jumlah = 0; for (const w of this.slot) jumlah += w.userData.w + GANDENG;
        const total = jumlah + LOK; let x = -total / 2;
        for (const w of this.slot) { const u = w.userData; u.tx = x + u.w / 2; if (segera) u.x = u.tx; x += u.w + GANDENG; }
        this.lokX = x + LOK / 2; this.lebar = total; this.kanan = total / 2; this.lok.position.x = this.lokX;
        for (const st of this.stasiun) st.sg.position.x = this.kanan + 3.2;
        this.fit();
    }

    /* ----- API untuk game ----- */
    reset(n) {
        for (const w of [...this.slot, ...this.keluar]) this.hapusGerbong(w);
        this.slot = []; this.keluar = []; this.buangStasiun();
        for (let i = 0; i <= n; i++) this.stasiun.push(this.buatStasiun(i, i === n));
        this.scroll = -55; this.idx = 0; this.jalan = null; this.getar = 0; this.pesta = 0; this.mogok = false; this.pilih = this.kursor = -1;
        this.maskot.set('biasa'); this.tata(true); this.jarakNow = this.jarak;
    }
    pasangSoal(i, susun) {
        this.idx = i; this.pilih = this.kursor = -1;
        this.slot = susun.map((label, k) => this.buatGerbong(label, k));
        this.tata(true); this.sinyal('merah'); this.maskot.set('biasa');
    }
    lepasGerbong() { for (const w of this.slot) { w.userData.pergi = 1; this.keluar.push(w); } this.slot = []; this.pilih = this.kursor = -1; this.tata(); }
    susunan() { return this.slot.map((w) => w.userData.label); }
    tukar(a, b) { [this.slot[a], this.slot[b]] = [this.slot[b], this.slot[a]]; this.tata(); }
    /** Ketuk/tekan gerbong ke-i: pilih pertama, ketuk lagi untuk menukar, ketuk yang sama untuk batal. */
    pilihSlot(i) {
        this.kursor = i;
        if (this.pilih < 0) { this.pilih = i; return 'pilih'; }
        if (this.pilih === i) { this.pilih = -1; return 'batal'; }
        this.tukar(this.pilih, i); this.pilih = -1; return 'tukar';
    }
    geserKursor(d) { if (this.slot.length) this.kursor = this.kursor < 0 ? 0 : tepi(this.kursor + d, 0, this.slot.length - 1); return this.kursor; }
    lepasPilih() { this.pilih = this.kursor = -1; }
    /** arr: [true/false per gerbong] -> lampu hijau/merah; null -> semua padam. */
    lampu(arr) {
        this.slot.forEach((w, i) => {
            const m = w.userData.lm, hid = arr && arr[i], mer = arr && !arr[i];
            m.color.setHex(hid ? 0x1c8a48 : mer ? 0x8a1c2e : 0x444455); m.emissive.setHex(hid ? 0x22ee66 : mer ? 0xff2244 : 0x000000);
        });
    }
    sinyal(mode) { const st = this.stasiun[this.idx]; if (st) st.mode = mode; }
    getarkan() { this.getar = 0.9; }
    masuk(selesai) { this.jalan = { dari: this.scroll, ke: 0, t: 0, dur: 3.6, ease: keluarKubik, selesai }; }
    berangkat(k, selesai) { this.jalan = { dari: this.scroll, ke: k * JARAK, t: 0, dur: 4.4, ease: masukKeluar, selesai }; }
    akhir(menang) { this.maskot.set(menang ? 'senang' : 'sedih', 99); if (menang) this.pesta = 4.5; else { this.mogok = true; this.getar = 1.2; } }
    /** Indeks gerbong di titik (px,py) layar, atau -1. */
    ketuk(px, py, w, h) {
        this.ray.setFromCamera(new THREE.Vector2((px / w) * 2 - 1, -(py / h) * 2 + 1), this.camera);
        const hit = this.ray.intersectObjects(this.slot, true)[0]; if (!hit) return -1;
        let o = hit.object; while (o && !o.userData.gerbong) o = o.parent;
        return this.slot.indexOf(o);
    }

    /* ----- ukuran & kamera ----- */
    fit() {
        const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
        this.jarak = tepi(Math.max((this.lebar + 6) / 2 / (tan * (this.camera.aspect || 1)), 17), 17, 80);
        if (!this.jarakNow) this.jarakNow = this.jarak;
    }
    ukuran() {
        const w = this.induk.clientWidth || 1, h = this.induk.clientHeight || 1;
        this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, w < 700 ? 1.75 : 2)); this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.fit();
    }
    kamera(dt) {
        this.jarakNow += (this.jarak - this.jarakNow) * tepi(dt * 3);
        const c = this.camera, d = this.jarakNow;
        c.position.set(d * 0.15 + Math.sin(this.t * 0.3) * 0.8, 3 + d * 0.15, d); c.lookAt(0, 2.5, 0);
    }

    /* ----- per frame ----- */
    perbarui(dt) {
        const t = (this.t += dt);
        let dS = 0;
        if (this.jalan) {
            const j = this.jalan; j.t += dt;
            const p = Math.min(1, j.t / j.dur), s = j.dari + (j.ke - j.dari) * j.ease(p);
            dS = s - this.scroll; this.scroll = s;
            if (p >= 1) { this.jalan = null; j.selesai?.(); }
        }
        this.kec = dt > 0 ? dS / dt : 0;

        // roda & batang penggerak
        for (const r of this.rodaLok) r.rotation.z -= dS / r.userData.r;
        for (const w of [...this.slot, ...this.keluar]) for (const r of w.userData.roda) r.rotation.z -= dS / r.userData.r;
        const a = this.rodaLok[0].rotation.z; for (const b of this.batang) b.position.set(-0.3 + Math.cos(a) * 0.22, 0.79 + Math.sin(a) * 0.22, b.userData.z);

        // pemandangan
        for (const d of this.dekor) { d.x0 += d.v * dt; d.o.position.x = lilit(d.x0 - this.scroll * d.f + d.P / 2, d.P) - d.P / 2; }
        this.bantal.position.x = -lilit(this.scroll, 1);
        this.stasiun.forEach((st, i) => {
            st.g.position.x = i * JARAK - this.scroll; st.g.visible = Math.abs(st.g.position.x) < 130;
            st.jarum[0].rotation.z = -t * 0.6; st.jarum[1].rotation.z = -t * 0.05;
            const merah = st.mode === 'merah', kedip = i === this.idx && this.getar > 0 ? (Math.sin(t * 18) > 0 ? 2.6 : 0.3) : 2.2;
            st.merah.emissiveIntensity = merah ? kedip : 0.08; st.hijau.emissiveIntensity = merah ? 0.08 : 2.2;
        });

        // gerbong: meluncur ke posisi baru, melompat saat bertukar, muncul/hilang dengan skala
        for (const [k, w] of this.slot.entries()) {
            const u = w.userData; u.x += (u.tx - u.x) * tepi(dt * 9); u.s += dt * 2.6;
            const hop = tepi(Math.abs(u.tx - u.x) * 0.35, 0, 0.7), angkat = k === this.pilih ? 0.5 + Math.sin(t * 6) * 0.06 : 0;
            w.position.set(u.x, hop + angkat, 0); w.scale.setScalar(Math.max(0.001, muncul(tepi(u.s))));
            u.panah.visible = k === this.pilih || k === this.kursor; u.panah.position.y = 3.05 + Math.sin(t * 5) * 0.12; u.panah.material.emissive.setHex(k === this.pilih ? 0xffd23f : 0x6f7cff);
        }
        this.keluar = this.keluar.filter((w) => {
            const u = w.userData; u.pergi -= dt * 3.5; w.scale.setScalar(Math.max(0.001, u.pergi));
            if (u.pergi > 0) return true; this.hapusGerbong(w); return false;
        });

        // getaran, asap, pesta, maskot
        this.getar = Math.max(0, this.getar - dt); this.kereta.position.x = Math.sin(t * 70) * 0.07 * Math.min(1, this.getar * 2);
        const ngebut = this.kec > 2;
        if ((this.asapT -= dt) <= 0) { this.asap.muncul(this.lokX + 1.7, 3.4, 0, this.mogok ? 1.7 : ngebut ? 1.3 : 1); this.asapT = this.mogok ? 0.1 : ngebut ? 0.09 : this.getar > 0 ? 0.08 : 0.42; }
        this.asap.perbarui(dt, dS);
        if (this.pesta > 0) { this.pesta -= dt; if ((this.bakar -= dt) <= 0) { this.bakar = 0.32; this.percik.ledak(rand(-12, 12), rand(6, 12), -4, 40, WARNA_PESTA, 7, 3, 1.4); } }
        this.percik.perbarui(dt);
        this.maskot.perbarui(t, dt);
        this.kamera(dt);
    }
    gambar() { this.renderer.render(this.scene, this.camera); }
    destroy() { this.renderer.dispose(); this.renderer.domElement.remove(); }
}
export { Dunia };

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
        setup: $('#kk-setup'), form: $('#kk-form'), namaInput: $('#kk-nama-input'), suaraInfo: $('#kk-suara-info'), cobaSuara: $('#kk-coba-suara'),
        game: $('#kk-game'), kanvas: $('#kk-kanvas'), efek: $('#kk-efek'), nama: $('#kk-nama'), skor: $('#kk-skor'), nyawa: $('#kk-nyawa'), progresTeks: $('#kk-progres-teks'), progresBar: $('#kk-progres-bar'),
        tanya: $('#kk-tanya'), tanyaTeks: $('#kk-tanya-teks'), pop: $('#kk-pop'), memuat: $('#kk-memuat'), memuatTeks: $('#kk-memuat-teks'), spinner: $('#kk-spinner'), galatKeluar: $('#kk-galat-keluar'),
        btnJeda: $('#kk-btn-jeda'), btnUlang: $('#kk-btn-ulang'), btnSuara: $('#kk-btn-suara'), btnLayar: $('#kk-btn-layar'), btnBerangkat: $('#kk-btn-berangkat'),
        jeda: $('#kk-jeda'), selesai: $('#kk-selesai'),
    };
    if (!el.setup || !el.game) return;

    const KUNCI = 'kk:pref';
    let dunia = null, muatJanji = null, g = null, raf = 0, terakhir = 0, ulangSuaraTs = 0;

    const simpan = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* mode privat: abaikan */ } };
    const baca = (k, awal) => { try { return JSON.parse(localStorage.getItem(k)) ?? awal; } catch (e) { return awal; } };
    const bersihNama = (n) => (n || '').replace(/\s+/g, ' ').trim().slice(0, 12) || 'Teman';
    const hati = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-hati"/></svg>';

    /* ---------- Pengaturan ---------- */
    const pref = baca(KUNCI, { nama: '', tingkat: 'mudah', jenis: 'huruf' });
    const terapkanPref = () => {
        el.namaInput.value = pref.nama || '';
        for (const k of ['tingkat', 'jenis']) { const r = el.form.querySelector(`input[name="${k}"][value="${pref[k]}"]`); if (r) r.checked = true; }
    };
    const infoSuara = () => {
        el.suaraInfo.textContent = !suara.adaUcapan() ? 'Peramban ini belum bisa bersuara. Teks soal akan ditampilkan di layar.'
            : suara.adaSuaraIndonesia() ? `Suara bahasa Indonesia siap (${suara.namaSuara()}).`
            : 'Suara bahasa Indonesia belum ditemukan di perangkat ini. Teks soal akan ikut ditampilkan; pasang suara Indonesia di pengaturan perangkat.';
    };
    infoSuara(); setTimeout(infoSuara, 800); setTimeout(infoSuara, 2500); // daftar suara dimuat belakangan oleh peramban
    window.speechSynthesis?.addEventListener?.('voiceschanged', infoSuara);

    const bukaSetup = () => { terapkanPref(); if (!el.setup.open) el.setup.showModal(); setTimeout(() => el.namaInput.focus({ preventScroll: true }), 50); };
    bukaSetupFn = bukaSetup;
    el.setup.addEventListener('click', (e) => { if (e.target.closest('[data-tutup]')) el.setup.close(); });
    el.cobaSuara.addEventListener('click', () => { suara.buka(); suara.ucap(`Halo ${bersihNama(el.namaInput.value)}, siap naik kereta kata?`, { paksa: true }); });
    el.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(el.form);
        const opsi = { nama: bersihNama(data.get('nama')), tingkat: data.get('tingkat'), jenis: data.get('jenis') };
        if (!TINGKAT[opsi.tingkat] || !JENIS.includes(opsi.jenis)) return;
        Object.assign(pref, opsi); simpan(KUNCI, pref);
        el.setup.close(); suara.buka(); mulaiGame(opsi);
    });

    /* ---------- Membuat dunia 3D (sekali, saat pertama dimulai) ---------- */
    const muatDunia = () => muatJanji ||= (async () => {
        try { await document.fonts?.load('100px "Lilita One"'); } catch (e) { /* font cadangan dipakai */ }
        dunia = new Dunia(el.kanvas); return dunia;
    })().catch((err) => { muatJanji = null; throw err; });
    // Masuk/keluar layar penuh mengubah ukuran kanvas, dan setSize() menghapus gambarnya: langsung gambar ulang (juga saat jeda, ketika loop berhenti).
    const sesuaikan = () => { if (!dunia || el.game.hidden) return; dunia.ukuran(); dunia.gambar(); };
    new ResizeObserver(sesuaikan).observe(el.game);
    window.addEventListener('resize', sesuaikan);
    document.addEventListener('fullscreenchange', () => { sesuaikan(); requestAnimationFrame(sesuaikan); setTimeout(sesuaikan, 150); });

    /* ---------- Tampilan (HUD) ---------- */
    const hudSkor = () => { el.skor.textContent = g.skor.toLocaleString('id-ID'); };
    const hudNyawa = () => { el.nyawa.innerHTML = Array.from({ length: g.nyawaMaks }, (_, i) => `<span class="${i < g.nyawa ? '' : 'hilang'}">${hati}</span>`).join(''); el.nyawa.setAttribute('aria-label', `Nyawa ${g.nyawa} dari ${g.nyawaMaks}`); };
    const hudProgres = () => { const n = g.soal.length; el.progresTeks.textContent = `Stasiun ${Math.min(g.i + 1, n)}/${n}`; el.progresBar.style.width = `${(g.i / n) * 100}%`; };
    const efek = (kelas) => { el.efek.className = 'kk__efek'; void el.efek.offsetWidth; el.efek.classList.add(kelas); };
    const pop = (teks, kelas) => { const p = document.createElement('div'); p.className = `kk-pop ${kelas}`; p.textContent = teks; el.pop.appendChild(p); setTimeout(() => p.remove(), 1500); };
    const teksTerlihat = () => !suara.apakahAktif() || !suara.adaUcapan() || !suara.adaSuaraIndonesia();   // tanpa suara, perintah harus terlihat agar tetap bisa dimainkan
    const hudTanya = () => {
        const b = g.soal[g.i]; if (!b || !['main', 'periksa'].includes(g.state)) { el.tanya.hidden = true; return; }
        el.tanya.hidden = false; el.tanya.classList.toggle('teks', teksTerlihat());
        el.tanyaTeks.textContent = teksTerlihat() ? (b.tipe === 'huruf' ? `Susun kata: ${b.teks.toUpperCase()}` : `Susun kalimat: ${b.teks}`) : 'Dengarkan perintahnya…';
    };
    const sinkronSuaraBtn = () => { el.btnSuara.setAttribute('aria-pressed', String(suara.apakahAktif())); };

    /* ---------- Alur permainan ---------- */
    const tunda = (detik, fn) => g.jadwal.push({ t: detik, fn });
    const ucapSoal = (paksa = false) => { const b = g.soal[g.i]; if (b) suara.ucap(b.ucapan, { paksa }); hudTanya(); };
    // shortcut: rekor disimpan di localStorage (per perangkat & peramban); upgrade: kirim ke server saat ada akun/papan peringkat.
    const rekorKunci = (o) => `kk:rekor:${o.tingkat}:${o.jenis}`;

    async function mulaiGame(opsi) {
        cancelAnimationFrame(raf); suara.diam();
        html.classList.add('sedang-main'); el.jeda.hidden = true; el.game.hidden = false; el.memuat.hidden = false; el.galatKeluar.hidden = true; el.spinner.hidden = false; el.memuatTeks.textContent = 'Memuat stasiun 3D…';
        if (document.fullscreenEnabled && !document.fullscreenElement) el.game.requestFullscreen?.().catch(() => {});   // harus dipanggil langsung dari klik pengguna
        try { await muatDunia(); } catch (err) {
            console.error(err); el.memuatTeks.textContent = 'Stasiun 3D tidak bisa dimuat. Pastikan peramban mendukung WebGL, lalu coba lagi.'; el.galatKeluar.hidden = false; el.spinner.hidden = true; return;
        }
        el.memuat.hidden = true; dunia.ukuran();
        const cfg = TINGKAT[opsi.tingkat], soal = buatSoal(opsi);
        g = { opsi, cfg, soal, i: 0, skor: 0, nyawa: cfg.nyawa, nyawaMaks: cfg.nyawa, streak: 0, benar: 0, salah: 0, state: 'masuk', jadwal: [], sebelumJeda: null, chug: 0 };
        dunia.reset(soal.length);
        el.nama.textContent = opsi.nama; hudSkor(); hudNyawa(); hudProgres(); el.tanya.hidden = true; el.pop.innerHTML = ''; el.efek.className = 'kk__efek'; el.btnBerangkat.disabled = true; sinkronSuaraBtn();
        dunia.masuk(() => tiba(true)); suara.bunyi.peluit();
        terakhir = performance.now(); raf = requestAnimationFrame(loop);
    }

    /** Kereta tiba di stasiun: pasang gerbong soal berikutnya, atau selesai bila sudah di tujuan. */
    function tiba(awal = false) {
        if (!g) return;
        suara.bunyi.tiba();
        const pasang = () => {
            dunia.pasangSoal(g.i, g.soal[g.i].susun); g.state = 'main'; el.btnBerangkat.disabled = false; hudProgres();
            pop(`Stasiun ${g.i + 1}`, 'ok'); tunda(0.9, () => ucapSoal());
        };
        if (awal) { tunda(0.4, pasang); return; }
        if (g.i >= g.soal.length) {
            g.state = 'tutup'; el.tanya.hidden = true;
            tunda(0.5, () => { dunia.akhir(true); suara.bunyi.menang(); suara.ucap('Hore! Kamu hebat! Kereta sampai di tujuan!', { paksa: true }); });
            tunda(4.2, () => hasil(true)); return;
        }
        dunia.lepasGerbong(); tunda(0.7, pasang);
    }

    function berangkat() {
        if (!g || g.state !== 'main') return;
        const b = g.soal[g.i], cek = periksa(dunia.susunan(), b.bagian), salahN = cek.filter((x) => !x).length;
        dunia.lepasPilih();
        if (salahN === 0) {                                  // susunan tepat: sinyal hijau, kereta melaju
            g.state = 'jalan'; el.btnBerangkat.disabled = true; el.tanya.hidden = true;
            const bonus = Math.min(g.streak, 10) * 10; g.skor += 100 + bonus; g.streak++; g.benar++;
            dunia.lampu(cek); dunia.sinyal('hijau'); dunia.maskot.set('senang', 4.5); suara.bunyi.benar(); efek('benar'); hudSkor();
            pop(g.streak > 2 ? `Hore! +${100 + bonus} (beruntun ${g.streak})` : `Hore! +${100 + bonus}`, 'ok');
            suara.ucap(`Benar! ${b.teks}. Kereta berangkat!`, { paksa: true });
            g.i++; hudProgres();
            tunda(1.4, () => { suara.bunyi.peluit(); dunia.lampu(null); dunia.berangkat(g.i, () => tiba()); });
            return;
        }
        g.state = 'periksa'; g.nyawa--; g.salah++; g.streak = 0; hudNyawa();   // masih salah: sinyal tetap merah, kereta tidak berangkat
        const p = g.cfg.petunjuk;
        dunia.lampu(p === 'tiap' ? cek : p === 'jumlah' ? cek.map(() => false) : null);
        dunia.sinyal('merah'); dunia.getarkan(); dunia.maskot.set('sedih', 1.8); suara.bunyi.salah(); efek('salah');
        const ket = p === 'tidak' ? 'Belum tepat. Coba lagi, ya!' : `Belum tepat. ${salahN} gerbong masih salah.`;
        pop(p === 'tidak' ? 'Belum berangkat!' : `Belum berangkat! ${salahN} gerbong salah`, 'salah'); suara.ucap(ket, { paksa: true });
        if (g.nyawa <= 0) {
            g.state = 'tutup'; suara.diam();
            tunda(0.8, () => { dunia.akhir(false); suara.bunyi.kalah(); suara.ucap('Yah, keretanya mogok. Coba lagi, ya!', { paksa: true }); });
            tunda(3.4, () => hasil(false)); return;
        }
        tunda(1.2, () => { dunia.lampu(null); if (g.state === 'periksa') { g.state = 'main'; hudTanya(); } });
    }

    function loop(now) {
        if (!g || g.state === 'jeda') { raf = 0; return; }
        const dt = Math.min(0.05, (now - terakhir) / 1000); terakhir = now;
        for (const j of g.jadwal) j.t -= dt;
        const siap = g.jadwal.filter((j) => j.t <= 0); g.jadwal = g.jadwal.filter((j) => j.t > 0); siap.forEach((j) => j.fn());
        if (!g || g.state === 'selesai') return;
        dunia.perbarui(dt);
        if (dunia.kec > 4 && (g.chug -= dt) <= 0) { suara.bunyi.chug(); g.chug = 0.26; }   // bunyi "cesss-cesss" mengikuti laju kereta
        dunia.gambar(); raf = requestAnimationFrame(loop);
    }

    function hasil(menang) {
        g.state = 'selesai'; cancelAnimationFrame(raf); raf = requestAnimationFrame(loopHias);
        const n = g.soal.length, sisa = g.nyawa / g.nyawaMaks, bintang = menang ? (sisa >= 0.8 ? 3 : sisa >= 0.5 ? 2 : 1) : 0;
        const rekor = baca(rekorKunci(g.opsi), 0), rekorBaru = g.skor > rekor; if (rekorBaru) simpan(rekorKunci(g.opsi), g.skor);
        $('#kk-hasil-judul').textContent = menang ? 'Sampai tujuan, hebat!' : 'Kereta mogok';
        $('#kk-hasil-sub').textContent = menang ? `${g.opsi.nama}, semua stasiun berhasil kamu lewati!` : `${g.opsi.nama}, nyawamu habis. Coba lagi, ya!`;
        $('#kk-h-skor').textContent = g.skor.toLocaleString('id-ID'); $('#kk-h-benar').textContent = `${g.benar}/${n}`; $('#kk-h-salah').textContent = g.salah;
        $('#kk-h-rekor').textContent = (rekorBaru ? g.skor : rekor).toLocaleString('id-ID') + (rekorBaru ? ' (baru!)' : '');
        $$('#kk-bintang svg').forEach((s, i) => s.classList.toggle('nyala', i < bintang));
        el.selesai.showModal();
    }
    function loopHias(now) { // di balik dialog hasil: dunia tetap hidup tapi ringan
        if (!g || g.state !== 'selesai') return;
        const dt = Math.min(0.05, (now - terakhir) / 1000); terakhir = now; dunia.perbarui(dt); dunia.gambar(); raf = requestAnimationFrame(loopHias);
    }

    /* ---------- Jeda, ulang, keluar ---------- */
    function jeda() {
        if (!g || !['masuk', 'main', 'periksa', 'jalan'].includes(g.state)) return;
        g.sebelumJeda = g.state; g.state = 'jeda'; suara.diam(); el.jeda.hidden = false; $('#kk-lanjut').focus();
    }
    function lanjut() {
        if (!g || g.state !== 'jeda') return;
        el.jeda.hidden = true; g.state = g.sebelumJeda; terakhir = performance.now(); raf = requestAnimationFrame(loop);
        if (g.state === 'main') tunda(0.4, () => ucapSoal(true));
    }
    function keluar() {
        cancelAnimationFrame(raf); raf = 0; suara.diam(); g = null;
        el.jeda.hidden = true; if (el.selesai.open) el.selesai.close();
        el.game.hidden = true; html.classList.remove('sedang-main'); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
    const ulangi = () => { const o = g?.opsi || pref; if (g) g.state = 'ulang'; el.jeda.hidden = true; if (el.selesai.open) el.selesai.close(); mulaiGame(o); };
    el.btnJeda.addEventListener('click', jeda);
    el.jeda.addEventListener('click', (e) => { if (e.target === el.jeda) lanjut(); });   // klik latar gelap = lanjut
    el.selesai.addEventListener('cancel', (e) => e.preventDefault());
    // app.js menutup dialog saat latar diklik: hasil -> buka lagi (agar permainan tidak macet tanpa dialog)
    el.selesai.addEventListener('close', () => { if (g && g.state === 'selesai') el.selesai.showModal(); });
    $('#kk-lanjut').addEventListener('click', lanjut);
    $('#kk-ulangi').addEventListener('click', ulangi);
    $('#kk-keluar').addEventListener('click', keluar);
    $('#kk-main-lagi').addEventListener('click', ulangi);
    $('#kk-beranda').addEventListener('click', keluar);
    $('#kk-atur').addEventListener('click', () => { keluar(); bukaSetup(); });
    el.galatKeluar.addEventListener('click', keluar);
    document.addEventListener('visibilitychange', () => { if (document.hidden) jeda(); });

    /* ---------- Suara & layar penuh ---------- */
    el.btnSuara.addEventListener('click', () => { suara.setAktif(!suara.apakahAktif()); sinkronSuaraBtn(); if (g) { hudTanya(); if (suara.apakahAktif() && g.state === 'main') ucapSoal(true); } });
    el.btnUlang.addEventListener('click', () => { if (!g || g.state !== 'main') return; const s = performance.now(); if (s - ulangSuaraTs < 600) return; ulangSuaraTs = s; ucapSoal(true); });
    el.btnLayar.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen?.() : el.game.requestFullscreen?.().catch(() => {}); });
    el.btnBerangkat.addEventListener('click', berangkat);

    /* ---------- Kendali: ketuk gerbong, papan ketik ---------- */
    function pilihSlot(i) {
        const r = dunia.pilihSlot(i);
        if (r === 'tukar') { dunia.lampu(null); dunia.sinyal('merah'); dunia.maskot.set('kaget', 0.5); suara.bunyi.tukar(); } else suara.bunyi.pilih();
    }
    el.kanvas.addEventListener('pointerdown', (e) => {
        if (!g || g.state !== 'main') return;
        const r = el.kanvas.getBoundingClientRect(), i = dunia.ketuk(e.clientX - r.left, e.clientY - r.top, r.width, r.height);
        if (i >= 0) pilihSlot(i);
    });
    document.addEventListener('keydown', (e) => {
        if (el.game.hidden || !g || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
        const k = e.key.toLowerCase();
        if (g.state === 'jeda' && k !== 'p' && k !== 'escape') return;   // saat jeda, Enter/Spasi dibiarkan menekan tombol yang terfokus
        if (k === 'arrowleft' || k === 'a') { if (g.state === 'main') dunia.geserKursor(-1); e.preventDefault(); }
        else if (k === 'arrowright' || k === 'd') { if (g.state === 'main') dunia.geserKursor(1); e.preventDefault(); }
        else if (k === ' ') { e.preventDefault(); if (g.state === 'main' && !e.repeat && dunia.kursor >= 0) pilihSlot(dunia.kursor); }
        else if (k === 'enter') { e.preventDefault(); if (!e.repeat) berangkat(); }
        else if (k === 'r' || k === 'h') el.btnUlang.click();
        else if (k === 'p') { g.state === 'jeda' ? lanjut() : jeda(); }
        else if (k === 'escape' && g.state === 'jeda') lanjut();
        else if (k === 'm') el.btnSuara.click();
    });
}
if (typeof document !== 'undefined') mulaiUI();   // di Node (pengujian) tidak ada DOM