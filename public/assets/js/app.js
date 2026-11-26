const html = document.documentElement;
const gerak = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const acak = (a, b) => a + Math.random() * (b - a);
const buat = (induk, tag, kelas, css) => {
    const e = document.createElement(tag);
    if (kelas) e.className = kelas;
    e.style.cssText = css;
    induk.appendChild(e);
    return e;
};

/* ---------- Tema: terang/gelap dengan gelombang dari tombol ---------- */
const tombolTema = document.getElementById('tombol-tema');
if (!tombolTema) throw new Error('tombol-tema tidak ada di header');

const setTema = (tema) => {
    html.dataset.tema = tema;
    tombolTema.setAttribute('aria-checked', tema === 'gelap');
    try { localStorage.setItem('tema', tema); } catch (e) {}
};

tombolTema.setAttribute('aria-checked', html.dataset.tema === 'gelap');
let sibuk = false;
tombolTema.addEventListener('click', () => {
    if (sibuk) return;
    const tema = html.dataset.tema === 'gelap' ? 'terang' : 'gelap';
    if (!gerak || !document.startViewTransition) return setTema(tema);

    sibuk = true;
    html.classList.add('ganti'); // jeda animasi: halaman diam selama gelombang, jauh lebih ringan
    const r = tombolTema.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const peralihan = document.startViewTransition(() => setTema(tema));
    peralihan.ready.then(() =>
        html.animate(
            { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: 'cubic-bezier(.4, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' }
        )
    );
    peralihan.finished.finally(() => {
        html.classList.remove('ganti');
        sibuk = false;
    });
});

/* ---------- Latar: bintang malam, kunang-kunang, kilau, bunga, kupu-kupu (semua animasi mandiri, tidak mengikuti kursor) ---------- */
const latar = document.querySelector('.latar');
const lapisBintang = latar.querySelector('.bintang-lapis');
for (let n = 0; n < 80; n++) {
    buat(lapisBintang, 'b', '', `left:${acak(0, 100)}%;top:${acak(0, 62)}%;--u:${acak(1, 3.2)}px;--d:${acak(1.5, 4)}s;animation-delay:-${acak(0, 4)}s`);
}

// shortcut: elemen latar dibuat acak sekali saat dimuat dan jumlahnya tidak dihitung ulang saat layar diputar, upgrade bila perlu menyesuaikan ukuran layar
const bagi = innerWidth < 700 ? 2 : 1; // HP: separuh elemen agar ringan
const jumlah = (n) => Math.ceil(n / bagi);
const WARNA = [['#ff6b9d', '#ff9a5c'], ['#4f9dff', '#5ee0ff'], ['#34d399', '#b8ef5a'], ['#a67bff', '#ff8be0'], ['#ffcf4a', '#ff9a3c']];
for (let n = 0; n < jumlah(18); n++) {
    buat(latar, 'i', 'kunang', `left:${acak(0, 100)}%;top:${acak(45, 96)}%;--dx:${acak(-40, 40)}px;--dy:${acak(-70, -10)}px;--d:${acak(4, 9)}s;animation-delay:-${acak(0, 8)}s`);
}
for (let n = 0; n < jumlah(14); n++) {
    buat(latar, 'i', 'kilau', `left:${acak(0, 98)}%;top:${acak(2, 70)}%;--u:${acak(.5, 1.1)}rem;--d:${acak(1.2, 3.2)}s;animation-delay:-${acak(0, 3)}s`);
}
for (let n = 0; n < jumlah(16); n++) {
    const [c] = WARNA[n % WARNA.length];
    buat(latar, 'i', 'bunga', `--x:${acak(0, 98)}%;--y:${acak(.5, 12)}vh;--u:${acak(.7, 1.3)}rem;--h:${acak(1.6, 3)}rem;--c:${c};--d:${acak(2.5, 5)}s;animation-delay:-${acak(0, 4)}s`);
}
const KUPU = [['#ffb347', '#ff6b6b', '#a53a00'], ['#6ec6ff', '#a58bff', '#274690'], ['#ff9ac8', '#ffd1e8', '#a8206a'], ['#ffe66d', '#ffb84d', '#9a6a00'], ['#b794ff', '#ff8be0', '#5a2da8']];
for (let n = 0; n < jumlah(5); n++) {
    const [c1, c2, c3] = KUPU[n % KUPU.length];
    const kupu = buat(latar, 'i', 'kupu', `--y:${acak(28, 72)}vh;--s:${acak(1.7, 2.7)}rem;--c1:${c1};--c2:${c2};--c3:${c3};--d:${acak(26, 46)}s;--b:${acak(7, 12)}s;animation-delay:-${acak(0, 40)}s,-${acak(0, 10)}s,0s`);
    ['sa-kiri', 'sa-kanan', 'sb-kiri', 'sb-kanan', 'badan'].forEach((k) => buat(kupu, 'b', k === 'badan' ? k : `sayap ${k}`, ''));
}

/* ---------- Kartu game: miring 3D + kilau saat disorot mouse ---------- */
const daftar = document.querySelector('.daftar-game');
if (gerak && daftar) {
    daftar.addEventListener('pointermove', (e) => {
        const kartu = e.target.closest('.kartu');
        if (!kartu || e.pointerType !== 'mouse') return;
        const r = kartu.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        kartu.style.setProperty('--ry', `${(x - .5) * 10}deg`);
        kartu.style.setProperty('--rx', `${(.5 - y) * 10}deg`);
        kartu.style.setProperty('--mx', `${x * 100}%`);
        kartu.style.setProperty('--my', `${y * 100}%`);
    });
    daftar.addEventListener('pointerout', (e) => {
        const kartu = e.target.closest('.kartu');
        if (kartu && !kartu.contains(e.relatedTarget)) ['--rx', '--ry'].forEach((v) => kartu.style.removeProperty(v));
    });
}

/* ---------- Maskot: salto saat diklik + gelembung percakapan (efek mengetik) ---------- */
const panggung = document.querySelector('.panggung');
const maskot = document.querySelector('.hero__maskot');
const gelembung = document.querySelector('.gelembung');
const teksGelembung = document.querySelector('.gelembung__teks');
const sapaan = JSON.parse(panggung?.dataset.sapaan || '[]');
let urutan = 0, ketik;

const tulis = (teks) => {
    clearInterval(ketik);
    if (!gerak) { teksGelembung.textContent = teks; return; }
    let n = 0;
    teksGelembung.textContent = '';
    gelembung.classList.add('mengetik');
    ketik = setInterval(() => {
        teksGelembung.textContent = teks.slice(0, ++n);
        if (n >= teks.length) { clearInterval(ketik); gelembung.classList.remove('mengetik'); }
    }, 32);
};
const gantiSapaan = () => {
    if (!teksGelembung || !sapaan.length) return;
    urutan = (urutan + 1) % sapaan.length;
    gelembung.classList.remove('pop');
    void gelembung.offsetWidth; // memulai ulang animasi
    gelembung.classList.add('pop');
    tulis(sapaan[urutan]);
};
setInterval(() => { if (!document.hidden) gantiSapaan(); }, 6500);
const stage = document.querySelector('.panggung__maskot');
if (gerak && stage) {
    for (let n = 0; n < 6; n++) buat(stage, 'i', 'bintik', `--x:${acak(4, 90)}%;--y:${acak(4, 80)}%;--u:${acak(.6, 1.2)}rem;--d:${acak(1, 2.4)}s;animation-delay:-${acak(0, 2)}s`);
}
// salto selesai -> lepas kelasnya, kalau tidak animasi lompat tidak berjalan lagi
maskot?.addEventListener('animationend', (e) => { if (e.animationName === 'salto') maskot.classList.remove('salto'); });
maskot?.addEventListener('click', () => {
    maskot.classList.remove('salto');
    void maskot.offsetWidth;
    maskot.classList.add('salto');
    gantiSapaan();
});

/* ---------- Dialog: klik di luar kotak untuk menutup ---------- */
document.querySelectorAll('dialog.dialog').forEach((d) =>
    d.addEventListener('click', (e) => {
        const r = d.getBoundingClientRect();
        const luar = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (e.target === d && luar) d.close();
    })
);

/* ---------- Hadiah: konfeti lalu buka dialog ---------- */
const konfeti = (x, y) => {
    if (!gerak) return;
    for (let n = 0; n < 30; n++) {
        const k = document.createElement('i');
        k.className = 'konfeti';
        k.style.cssText = `left:${x}px;top:${y}px;background:hsl(${Math.random() * 360} 90% 60%)`;
        document.body.appendChild(k);
        const sudut = Math.random() * Math.PI * 2, jarak = 80 + Math.random() * 170;
        k.animate(
            [{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
             { transform: `translate(${Math.cos(sudut) * jarak}px,${Math.sin(sudut) * jarak + 90}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }],
            { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.8,.3,1)' }
        ).onfinish = () => k.remove();
    }
};
const tombolHadiah = document.getElementById('tombol-hadiah');
tombolHadiah?.addEventListener('click', () => {
    const r = tombolHadiah.getBoundingClientRect();
    konfeti(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => document.getElementById('hadiah').showModal(), gerak ? 450 : 0);
});

/* ---------- Panduan: dialog + centang langkah + progres ---------- */
const panduan = document.getElementById('panduan');
const langkah = panduan?.querySelectorAll('.langkah') ?? [];
const bar = panduan?.querySelector('.panduan__bar');
const hitung = panduan?.querySelector('.panduan__hitung');

document.getElementById('tombol-panduan')?.addEventListener('click', () => panduan.showModal());
langkah.forEach((tombol) => tombol.addEventListener('click', () => {
    tombol.setAttribute('aria-pressed', tombol.getAttribute('aria-pressed') !== 'true');
    const selesai = panduan.querySelectorAll('.langkah[aria-pressed="true"]').length;
    bar?.setAttribute('aria-valuenow', selesai);
    if (hitung) hitung.textContent = `${selesai}/${langkah.length}`;
    bar?.style.setProperty('--p', selesai / langkah.length);
}));