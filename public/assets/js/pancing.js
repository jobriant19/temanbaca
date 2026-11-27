/* PANCING PINTAR: setup (nama + jenis soal) -> game 3D orang pertama di perahu -> jawab soal lewat mikrofon (Web Speech API).
   Dunia 3D (langit, laut, perahu, joran, tangan, model ikan) ada di pancing-dunia.js (dimuat lebih dulu).
   Alur fase: siap -> lempar -> tunggu -> lompat -> soal -> (benar) tarik -> tampil | (salah habis / waktu habis) lepas -> siap */
const $ = (s) => document.querySelector(s);
const pilih = (a) => a[Math.floor(Math.random() * a.length)];
const ik = (n) => `<svg class="ik" aria-hidden="true"><use href="#i-${n}"/></svg>`; // ikon dari sprite di blade (tanpa emoji)

/* ========== DATA (edit di sini): soal, kelangkaan, ikan, gelar ========== */
const HURUF = [...'abcdefghijklmnopqrstuvwxyz'];
const KATA = ['ibu', 'ayah', 'buku', 'bola', 'ikan', 'kapal', 'laut', 'pantai', 'topi', 'baju', 'sapi', 'kucing', 'jeruk', 'apel', 'nasi', 'roti', 'bunga', 'pohon', 'rumah', 'sekolah',
    'bintang', 'bulan', 'awan', 'hujan', 'sepeda', 'mobil', 'pensil', 'meja', 'kursi', 'gajah', 'kelinci', 'burung', 'perahu', 'ombak', 'pasir', 'kerang', 'udang', 'kepiting', 'payung', 'bendera'];
// cara orang menyebut huruf (pengenalan suara sering mengembalikan salah satu bentuk ini)
const NAMA_HURUF = { a: ['a', 'ah', 'aa', 'ha'], b: ['be', 'bi', 'bee', 'beh', 'b'], c: ['ce', 'se', 'si', 'ci', 'che', 'cee', 'c'], d: ['de', 'di', 'dee', 'deh', 'd'], e: ['e', 'eh', 'ee'],
    f: ['ef', 'eff', 'ep', 'ev', 'f'], g: ['ge', 'ji', 'gi', 'ghe', 'gee', 'g'], h: ['ha', 'he', 'hah', 'hei', 'ah', 'h'], i: ['i', 'ai', 'ay', 'ii', 'eye'], j: ['je', 'jay', 'jei', 'jeh', 'ja', 'j'],
    k: ['ka', 'ke', 'kay', 'kah', 'k'], l: ['el', 'ell', 'le', 'l'], m: ['em', 'am', 'm'], n: ['en', 'an', 'n'], o: ['o', 'oh', 'ow'], p: ['pe', 'pi', 'pea', 'peh', 'p'],
    q: ['ki', 'kiu', 'ku', 'kyu', 'queue', 'q'], r: ['er', 'ar', 'air', 'are', 'r'], s: ['es', 'ess', 's'], t: ['te', 'ti', 'tea', 'teh', 't'], u: ['u', 'yu', 'you', 'uh'],
    v: ['ve', 'fe', 'vi', 'vee', 'fi', 'v'], w: ['we', 'wi', 'wei', 'dablu', 'doubleu'], x: ['eks', 'ex', 'ek', 'ecs', 'x'], y: ['ye', 'wai', 'why', 'yah', 'y'], z: ['zet', 'zed', 'zi', 'zee', 'set', 'z'] };
// bunyi awal yang dianggap sama untuk konsonan yang namanya diawali bunyi itu sendiri (pengenal suara sering salah dengar)
const AWAL_HURUF = { b: 'b', c: 'cs', d: 'd', g: 'g', h: 'h', j: 'j', p: 'p', t: 't', v: 'vf', w: 'w', y: 'y', z: 'zs' };
// w = peluang (bobot), c = warna, p = poin
const KELAS = [
    { n: 'Biasa', w: 55, c: '#9fb4c7', p: 10 }, { n: 'Langka', w: 25, c: '#4aa8ff', p: 25 }, { n: 'Epik', w: 13, c: '#b06bff', p: 60 },
    { n: 'Legendaris', w: 5.5, c: '#ffc230', p: 150 }, { n: 'Mitos', w: 1.5, c: '#ff5fd2', p: 400 },
];
// k = indeks KELAS, pg/pr/lr/ek = warna punggung/perut/loreng/ekor, em = cahaya, s = ukuran, pj/tg/lb = panjang/tinggi/lebar badan, kg = rentang berat
const IKAN = [
    { nama: 'Teri Perak', k: 0, pg: '#8fa5b8', pr: '#f2f6fa', ek: '#c9d6e2', s: .16, pj: 1.6, tg: .3, kg: [.05, .2] },
    { nama: 'Kembung Laut', k: 0, pg: '#1f7a8c', pr: '#e8f1f5', lr: '#0d4b5a', ek: '#1f7a8c', s: .22, pj: 1.4, tg: .42, kg: [.3, .9] },
    { nama: 'Ikan Badut', k: 1, pg: '#ff7a1a', pr: '#ff9a3c', lr: '#ffffff', ek: '#ff7a1a', s: .2, pj: 1.1, tg: .62, kg: [.1, .3] },
    { nama: 'Biru Tang', k: 1, pg: '#1747d6', pr: '#2f7bff', ek: '#ffd51f', s: .24, pj: 1, tg: .9, kg: [.2, .6] },
    { nama: 'Buntal Duri', k: 2, pg: '#f2c230', pr: '#fff1b0', lr: '#c47a10', ek: '#f2c230', s: .26, pj: 1, tg: 1, lb: .9, duri: 1, kg: [.8, 2] },
    { nama: 'Kakatua Pelangi', k: 2, pg: '#19c3a8', pr: '#ff7ac6', lr: '#7a5cff', ek: '#ffd05a', s: .28, pj: 1.35, tg: .55, kg: [1, 3] },
    { nama: 'Arwana Emas', k: 3, pg: '#ffbe1a', pr: '#fff0a0', ek: '#ff9a00', em: '#7a5200', s: .32, pj: 1.9, tg: .38, kg: [3, 8] },
    { nama: 'Ikan Galaksi', k: 4, pg: '#3a1d9c', pr: '#19e0ff', lr: '#ff5fd2', ek: '#7a5cff', em: '#4a22c0', s: .34, pj: 1.5, tg: .65, kg: [10, 30] },
];
const WAKTU_SOAL = 20; // detik menjawab sebelum ikan lepas
const KESEMPATAN = 2; // berapa kali boleh salah menjawab untuk satu ikan
const GELAR = [[0, 'Pemancing Pemula'], [100, 'Pemancing Cilik'], [400, 'Pemancing Hebat'], [1000, 'Raja Laut']]; // [skor minimal, gelar]
const gelar = (skor) => GELAR.filter((g) => skor >= g[0]).pop()[1];

const undi = () => {
    let r = Math.random() * KELAS.reduce((a, k) => a + k.w, 0), k = 0;
    while (k < KELAS.length - 1 && (r -= KELAS[k].w) > 0) k++;
    return pilih(IKAN.filter((i) => i.k === k));
};

/* ========== Pencocokan jawaban suara ========== */
const bersih = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, ' ').trim();
const lev = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
};
// shortcut: kata >4 huruf boleh salah 1 huruf (suara anak sering kurang jelas), upgrade bila terlalu longgar
const cocok = (alts, s) => alts.map(bersih).some((u) => {
    const tok = u.split(/\s+/);
    if (s.jenis === 'huruf') {
        const nama = NAMA_HURUF[s.t], awal = AWAL_HURUF[s.t];
        // nama huruf persis, atau (konsonan) suku kata pendek berawalan bunyi yang sama: "be", "bee", "bek", "bi" untuk B
        return tok.some((w) => w === s.t || nama.includes(w) || (awal && w.length <= 4 && awal.includes(w[0]))) || nama.includes(u.replace(/ /g, ''));
    }
    return tok.some((w) => w === s.t || (s.t.length > 4 && lev(w, s.t) < 2));
});
console.assert(cocok(['be'], { jenis: 'huruf', t: 'b' }) && !cocok(['ce'], { jenis: 'huruf', t: 'b' }) && cocok(['kapal'], { jenis: 'kata', t: 'kapal' }) && !cocok(['bola'], { jenis: 'kata', t: 'buku' }), 'cocok() rusak');

/* ========== HEADER: tema + dialog Panduan & Hadiah ========== */
// shortcut: logika tema disalin dari app.js (app.js terikat ke dialog beranda), upgrade: pindahkan ke modul bersama
const root = document.documentElement, tombolTema = $('#tombol-tema');
const setTema = (t) => {
    root.dataset.tema = t;
    tombolTema.setAttribute('aria-checked', t === 'gelap');
    try { localStorage.setItem('tema', t); } catch (e) { /* mode privat: tema tidak tersimpan */ }
};
tombolTema.setAttribute('aria-checked', root.dataset.tema === 'gelap');
tombolTema.addEventListener('click', () => setTema(root.dataset.tema === 'gelap' ? 'terang' : 'gelap'));
$('#tombol-panduan').addEventListener('click', () => $('#dlg-panduan').showModal());
$('#tombol-hadiah').addEventListener('click', () => $('#dlg-hadiah').showModal());
// isi dialog Hadiah dibuat dari data di atas, jadi selalu sama dengan aturan game
$('#hadiahKelas').innerHTML = KELAS.map((K, i) => `<li style="--k:${K.c}"><b>${K.n}</b><span>${IKAN.filter((f) => f.k === i).map((f) => f.nama).join(', ')}</span><em>+${K.p}</em></li>`).join('');
$('#hadiahGelar').innerHTML = GELAR.map(([s, g]) => `<li>${ik('trofi')}<b>${g}</b><span>${s} poin</span></li>`).join('');

/* ========== SETUP: validasi nama + jenis soal ========== */
// shortcut: setup & game satu halaman (tanpa simpan ke server), upgrade bila skor harus tersimpan di database
const form = $('#setup-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = $('#nama').value.trim(), jenis = form.elements.jenis.value;
    const kurang = [];
    if (!nama) kurang.push('Nama pemain belum diisi.');
    if (!jenis) kurang.push('Jenis soal belum dipilih.');
    if (!window.THREE) kurang.push('Three.js belum termuat, periksa internet lalu muat ulang.');
    if (kurang.length) {
        $('#kurang').innerHTML = kurang.map((k) => `<li>${ik('peringatan')}${k}</li>`).join('');
        $('#peringatan').showModal();
        return;
    }
    $('#setup').hidden = true;
    $('.latar').hidden = true; // latar beranda tertutup kanvas, jangan biarkan animasinya jalan
    $('#game').hidden = false;
    $('#hud-nama').textContent = nama;
    $('#hud-awal').textContent = nama[0].toUpperCase();
    $('#kNama').textContent = nama;
    jalan(jenis);
});

/* ========== GAME ========== */
function jalan(mode) {
    const R = new THREE.WebGLRenderer({ canvas: $('#kanvas'), antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    R.shadowMap.enabled = true;
    R.shadowMap.type = THREE.PCFSoftShadowMap;
    const S = new THREE.Scene();
    S.fog = new THREE.Fog(0xcfe9ff, 110, 420);
    const C = new THREE.PerspectiveCamera(65, 1, .05, 600);
    const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), vT = new THREE.Vector3(), vM = new THREE.Vector3();
    const { isiEmber, tick: tickDunia } = buatDunia(S, C);
    const pemancing = buatPemancing(C), ujung = pemancing.ujung;

    /* ---- Tali, pelampung, riak, percikan, bayangan ikan ---- */
    const garisG = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 21 }, () => new THREE.Vector3()));
    const garis = new THREE.Line(garisG, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 }));
    garis.frustumCulled = false;
    garis.visible = false;
    S.add(garis);
    const pelampung = new THREE.Group();
    pelampung.add(new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M({ color: 0xff3b3b })), new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M({ color: 0xffffff })));
    taruh(new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .35, 6), M({ color: 0xffd23f })), 0, .3, 0, pelampung);
    pelampung.visible = false;
    S.add(pelampung);
    const cincinRiak = [0, 1, 2].map(() => {
        const m = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
        S.add(m);
        return m;
    });
    const NP = 60, pP = new Float32Array(NP * 3), pV = new Float32Array(NP * 3), pH = new Float32Array(NP);
    for (let k = 0; k < NP; k++) pP[k * 3 + 1] = -50;
    const pG = new THREE.BufferGeometry();
    pG.setAttribute('position', new THREE.BufferAttribute(pP, 3));
    const percik = new THREE.Points(pG, new THREE.PointsMaterial({ color: 0xffffff, size: .22, transparent: true, opacity: .9, depthWrite: false }));
    percik.frustumCulled = false;
    S.add(percik);
    let np = 0;
    const splash = (p, n = 24) => {
        for (let i = 0; i < n; i++) {
            const k = np++ % NP;
            pP.set([p.x, p.y, p.z], k * 3);
            pV.set([acak(-1.6, 1.6), acak(2, 5), acak(-1.6, 1.6)], k * 3);
            pH[k] = 1.2;
        }
    };
    const bayangM = new THREE.Mesh(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x063a5c, transparent: true, opacity: .45, depthWrite: false }));
    const bayangG = new THREE.Group();
    bayangG.add(bayangM);
    bayangG.visible = false;
    S.add(bayangG);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(.5, .015, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85 }));
    halo.visible = false;
    S.add(halo);

    /* ---- Status game ---- */
    let fase = 'siap', tf = 0, skor = 0, jumlah = 0, sisa = 0, durTunggu = 3, a0 = 0, arah = 1, terlempar = false;
    let soal = null, ikanSp = null, ikanM = null, tRod = .5, bend = 0, engk = 0, cx = 0, cy = 0, mx = 0, my = 0;
    let kesempatan = KESEMPATAN, kunci = false; // kunci = jawaban sedang diperiksa/ditampilkan, mic & timer berhenti
    const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), koleksi = {};
    const besar = (m) => ikanM.scale.setScalar(ikanSp.s * m);
    const bump = (el, v) => { if (el.textContent !== String(v)) { el.textContent = v; el.parentElement.classList.remove('naik'); void el.offsetWidth; el.parentElement.classList.add('naik'); } };
    const hud = () => { bump($('#skor'), skor); bump($('#jumlah'), jumlah); $('#hudJenis').textContent = `${Object.keys(koleksi).length}/${IKAN.length}`; };
    let tPesan;
    const pesan = (teks, ms = 2200) => {
        const el = $('#pesan');
        el.textContent = teks;
        el.classList.add('tampil');
        clearTimeout(tPesan);
        tPesan = setTimeout(() => el.classList.remove('tampil'), ms);
    };
    const info = (teks) => { $('#info').textContent = teks; };
    const ke = (f) => {
        fase = f;
        tf = 0;
        $('#soal').hidden = f !== 'soal';
        $('#pancing').hidden = f !== 'siap'; // tombol hanya muncul saat boleh melempar, tidak ada tombol "mati" yang menumpuk
        if (f === 'siap') $('#tangkapan').hidden = true;
    };

    /* ---- Soal ---- */
    const titikNyawa = () => { $('#nyawa').innerHTML = Array.from({ length: KESEMPATAN }, (_, i) => `<i class="${i < kesempatan ? '' : 'habis'}">${ik('hati')}</i>`).join(''); };
    const soalBaru = () => {
        const jenis = mode === 'campur' ? pilih(['huruf', 'kata']) : mode;
        let t;
        do t = pilih(jenis === 'huruf' ? HURUF : KATA); while (t === soal?.t);
        soal = { jenis, t };
        // huruf tampil sekali saja (besar atau kecil acak), bukan dua bentuk sekaligus
        $('#soalTeks').textContent = jenis === 'huruf' && Math.random() < .5 ? t.toUpperCase() : t;
        $('#soalPetunjuk').textContent = jenis === 'huruf' ? 'Sebutkan nama huruf ini' : 'Bacakan kata ini';
    };
    const tutupHasil = () => { $('#hasil').hidden = true; $('#soal').classList.remove('benar', 'salah'); };
    const mulaiSoal = () => {
        ke('soal');
        sisa = WAKTU_SOAL;
        kesempatan = KESEMPATAN;
        kunci = false;
        tutupHasil();
        titikNyawa();
        soalBaru();
        const K = KELAS[ikanSp.k];
        $('#soal').style.setProperty('--k', K.c);
        $('#soalKelas').textContent = `Ikan ${K.n} menggigit`;
        info('Ketuk mikrofon, lalu ucapkan jawabanmu.');
        bayangM.material.color.set(ikanSp.k >= 2 ? K.c : 0x063a5c);
    };
    const gagal = (alasan) => {
        rec?.abort();
        pesan(`${alasan} Ikan lepas.`);
        ikanM.visible = true;
        besar(2.2);
        bayangG.visible = false;
        splash(v2.set(P1.x, gel(P1.x, P1.z, 0), P1.z));
        ke('lepas');
    };
    const menang = () => {
        bayangG.visible = false;
        ikanM.visible = true;
        splash(v2.set(P1.x, gel(P1.x, P1.z, 0), P1.z), 30);
        ke('tarik');
    };
    // umpan balik jawaban: panel berubah hijau (benar) / merah (salah) + apa yang terdengar
    const tampilHasil = (benar, terdengar, habis) => {
        const p = $('#soal');
        p.classList.toggle('benar', benar);
        p.classList.toggle('salah', !benar);
        $('#hasilIkon').setAttribute('href', `#i-${benar ? 'benar' : 'salah'}`);
        $('#hasilJudul').textContent = benar ? 'Benar!' : 'Salah';
        $('#hasilRinci').textContent = (terdengar ? `Terdengar: ${terdengar}. ` : '') + (benar ? 'Ikan mulai ditarik.' : habis ? `Jawaban yang benar: ${soal.t}.` : 'Coba sekali lagi.');
        $('#hasil').hidden = false;
    };
    const jawab = (alts) => {
        if (fase !== 'soal' || kunci) return;
        kunci = true;
        rec?.abort();
        const benar = cocok(alts, soal);
        if (!benar) kesempatan--;
        const habis = !benar && kesempatan <= 0;
        titikNyawa();
        tampilHasil(benar, alts[0], habis);
        setTimeout(() => {
            if (fase !== 'soal') return;
            if (benar) menang();
            else if (habis) gagal('Kesempatan habis.');
            else { kunci = false; tutupHasil(); info('Ketuk mikrofon, lalu ucapkan lagi.'); }
        }, benar ? 1200 : 1700);
    };

    /* ---- Mikrofon (Web Speech API; butuh Chrome/Edge/Safari + https atau localhost) ---- */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let rec = null, dengar = false, terakhir = '';
    const pakaiKetik = (alasan) => { $('#ketik').hidden = false; info(alasan); };
    const mulaiDengar = () => {
        if (fase !== 'soal' || dengar || kunci) return;
        if (!SR) return pakaiKetik('Browser belum mendukung mikrofon. Ketik jawabanmu.');
        rec = new SR();
        rec.lang = 'id-ID';
        rec.maxAlternatives = 10;
        rec.interimResults = true; // teks muncul saat anak masih berbicara
        terakhir = '';
        rec.onstart = () => { dengar = true; $('#mic').classList.add('aktif'); info('Mendengarkan... ucapkan sekarang!'); };
        rec.onresult = (e) => {
            const r = e.results[0];
            if (r.isFinal) jawab(Array.from(r, (a) => a.transcript));
            else { terakhir = r[0].transcript; info(`Terdengar: ${terakhir}`); }
        };
        rec.onerror = (e) => {
            if (e.error === 'aborted') return;
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') pakaiKetik('Izin mikrofon ditolak. Ketik jawabanmu.');
            else if (!terakhir) info(e.error === 'no-speech' ? 'Tidak terdengar. Ketuk mikrofon lagi.' : `Mikrofon bermasalah (${e.error}). Coba lagi.`);
        };
        rec.onend = () => {
            dengar = false;
            $('#mic').classList.remove('aktif');
            if (terakhir && fase === 'soal' && !kunci) jawab([terakhir]); // belum final tapi sudah terdengar: tetap dinilai benar/salah
        };
        try { rec.start(); } catch (e) { /* sudah berjalan */ }
    };
    $('#mic').addEventListener('click', mulaiDengar);
    $('#ketik').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('#ketikInput').value;
        $('#ketikInput').value = '';
        if (v.trim()) jawab([v]);
    });

    /* ---- Tangkapan, ember, koleksi ---- */
    const mulaiTampil = () => {
        const K = KELAS[ikanSp.k], kg = acak(...ikanSp.kg).toFixed(1);
        skor += K.p;
        jumlah++;
        koleksi[ikanSp.nama] = (koleksi[ikanSp.nama] || 0) + 1;
        hud();
        const el = $('#tangkapan');
        el.hidden = false;
        el.className = 'pp-tangkapan' + (ikanSp.k >= 3 ? ' mewah' : '');
        el.style.setProperty('--k', K.c);
        el.innerHTML = `<small>${K.n}</small><b>${ikanSp.nama}</b><span>${kg} kg</span><span class="poin">+${K.p} poin</span>`;
        if (ikanSp.k >= 3) splash(ikanM.position, 40);
        ke('tampil');
    };
    const masukEmber = () => {
        const k = ikanM.clone();
        ['aura', 'orb'].forEach((n) => { const o = k.getObjectByName(n); if (o) o.parent.remove(o); }); // efek cahaya hanya untuk ikan yang ditampilkan
        k.userData = {};
        k.scale.setScalar(ikanSp.s * Math.min(.55, .34 / (2 * ikanSp.pj * ikanSp.s))); // panjang ikan muat di dalam ember
        isiEmber.add(k);
        if (isiEmber.children.length > 8) isiEmber.remove(isiEmber.children[0]);
        // tata ulang: tiap ikan rebah (kepala condong sedikit), disebar melingkar, ditumpuk rendah di bawah permukaan air
        isiEmber.children.forEach((f, i) => {
            const a = i * 2.4, r = .02 + (i % 3) * .025;
            f.position.set(Math.cos(a) * r, -.13 + i * .014, Math.sin(a) * r);
            f.rotation.set(0, a + Math.PI / 2, (i % 2 ? .08 : -.08));
        });
    };
    const bukaKoleksi = () => {
        $('#kGelar').textContent = gelar(skor);
        $('#kSkor').textContent = skor;
        $('#kJenis').textContent = `${Object.keys(koleksi).length}/${IKAN.length}`;
        $('#daftarIkan').innerHTML = IKAN.map((i) => {
            const n = koleksi[i.nama] || 0, K = KELAS[i.k];
            return `<li class="${n ? '' : 'kunci'}" style="--k:${K.c};--a:${i.pg};--b:${i.pr}"><i class="lencana"></i><b>${n ? i.nama : '???'}</b><small>${K.n}</small><span>${n ? '×' + n : ik('kunci')}</span></li>`;
        }).join('');
        $('#koleksi').showModal();
    };
    $('#bukaKoleksi').addEventListener('click', bukaKoleksi);

    /* ---- Memancing: tombol / spasi ---- */
    const pancing = () => { if (fase === 'siap') { terlempar = false; ke('lempar'); } };
    $('#pancing').addEventListener('click', pancing);
    addEventListener('keydown', (e) => {
        if (e.code !== 'Space' || /INPUT|BUTTON|TEXTAREA/.test(e.target.tagName) || document.querySelector('dialog[open]')) return;
        e.preventDefault();
        pancing();
    });
    addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });

    const mulaiTunggu = () => {
        ikanSp = undi();
        ikanM = buatIkan(ikanSp);
        ikanM.visible = false;
        S.add(ikanM);
        besar(2.2); // dibesarkan agar jelas terlihat dari jauh
        durTunggu = acak(2.2, 4.2);
        a0 = acak(0, 6.28);
        arah = Math.random() < .5 ? -1 : 1;
        const sx = Math.max(.8, ikanSp.s * ikanSp.pj * 3.6);
        bayangM.scale.set(sx, sx * .4, 1);
        bayangM.material.color.set(ikanSp.k >= 2 ? KELAS[ikanSp.k].c : 0x063a5c);
        bayangG.visible = true;
        pesan('Tunggu ikan menggigit...', durTunggu * 1000);
        ke('tunggu');
    };

    /* ---- Pembaruan per frame ---- */
    const update = (dt, t) => {
        tickDunia(dt, t);
        cx += (mx - cx) * Math.min(1, dt * 4);
        cy += (my - cy) * Math.min(1, dt * 4);
        C.rotation.set(-.2 - cy * .1, -cx * .2, 0);
        pemancing.tick(dt, t, tRod, bend, engk);
        S.updateMatrixWorld(true);
        ujung.getWorldPosition(v1);

        if (ikanM && ikanM.visible) ikanM.userData.tik?.(t);
        tf += dt;
        tRod = .5; bend = 0; engk = 0;
        let riak = 0;
        const air = gel(P1.x, P1.z, t);
        switch (fase) {
            case 'siap':
                pelampung.visible = garis.visible = false;
                break;
            case 'lempar':
                if (tf < .3) tRod = 1; // joran diayun ke belakang
                else {
                    tRod = .18; // lalu dilecutkan ke depan
                    if (!terlempar) {
                        terlempar = true;
                        P0.copy(v1);
                        P1.set(acak(-4, 4), 0, -acak(10, 16));
                        pelampung.visible = garis.visible = true;
                    }
                    const p = Math.min(1, (tf - .3) / .9);
                    pelampung.position.lerpVectors(P0, P1, p).y += Math.sin(p * Math.PI) * 4;
                    if (p >= 1) { terlempar = false; splash(v2.set(P1.x, air, P1.z)); mulaiTunggu(); }
                }
                break;
            case 'tunggu': {
                const p = tf / durTunggu, r = lerp(4.5, .5, p), a = a0 + tf * 1.7;
                const bx = P1.x + Math.cos(a) * r, bz = P1.z + Math.sin(a) * r;
                bayangG.position.set(bx, gel(bx, bz, t) + .05, bz);
                bayangG.rotation.y = -Math.atan2(Math.cos(a), -Math.sin(a));
                pelampung.position.set(P1.x, air + .08 + Math.sin(t * 2.5) * .03 - (p > .8 ? Math.abs(Math.sin(t * 12)) * .1 : 0), P1.z);
                tRod = .4;
                riak = r < 2.5 ? 1 : 0;
                if (tf >= durTunggu) { bayangG.visible = false; ikanM.visible = true; splash(v2.set(P1.x, air, P1.z)); ke('lompat'); }
                break;
            }
            case 'lompat': {
                const p = Math.min(1, tf);
                ikanM.position.set(P1.x + arah * p * 2.8, air + Math.sin(p * Math.PI) * 2, P1.z);
                ikanM.rotation.set(0, arah > 0 ? 0 : Math.PI, (1 - 2 * p) * .9);
                ikanM.userData.ekor.rotation.y = Math.sin(t * 30) * .6;
                pelampung.position.set(P1.x, air + .08 - Math.sin(p * Math.PI) * .2, P1.z);
                riak = 1;
                if (p >= 1) { ikanM.visible = false; splash(v2.set(P1.x + arah * 2.8, air, P1.z), 30); mulaiSoal(); bayangG.visible = true; }
                break;
            }
            case 'soal': {
                if (!document.querySelector('dialog[open]') && !kunci) sisa -= dt;
                tRod = .36;
                bend = -.1 + Math.sin(t * 9) * .02;
                const a = t * 5;
                bayangG.position.set(P1.x + Math.cos(a) * 1.1, air + .04, P1.z + Math.sin(a) * 1.1);
                bayangG.rotation.y = -Math.atan2(Math.cos(a), -Math.sin(a));
                pelampung.position.set(P1.x + Math.sin(t * 7) * .1, air - .03 + Math.sin(t * 10) * .07, P1.z);
                $('#timer i').style.transform = `scaleX(${Math.max(0, sisa / WAKTU_SOAL)})`;
                riak = 1;
                if (sisa <= 0) gagal('Waktu habis!');
                break;
            }
            case 'tarik': {
                const p = Math.min(1, tf / 1.4), e = 1 - Math.pow(1 - p, 3);
                C.localToWorld(vT.set(0, .12, -1.5 - ikanSp.s * 2));
                ikanM.position.lerpVectors(P1, vT, e).y += Math.sin(p * Math.PI) * 1.5;
                ikanM.rotation.set(0, arah > 0 ? 0 : Math.PI, .8 * (1 - p) + Math.sin(t * 20) * .15);
                ikanM.userData.ekor.rotation.y = Math.sin(t * 30) * .6;
                besar(lerp(2.2, 1.1, e));
                pelampung.visible = false;
                tRod = .6; bend = -.12 * (1 - p); engk = 18;
                if (p >= 1) mulaiTampil();
                break;
            }
            case 'tampil': {
                C.localToWorld(vT.set(0, .1, -1.5 - ikanSp.s * 2));
                ikanM.position.copy(vT);
                ikanM.rotation.set(0, tf * 1.4, .12 + Math.sin(t * 3) * .05);
                const sk = tf > 2.6 ? Math.max(0, 1 - (tf - 2.6) / .4) : 1; // di akhir, ikan "masuk ember"
                besar(1.1 * sk);
                halo.visible = ikanSp.k >= 2 && sk > 0;
                halo.material.color.set(KELAS[ikanSp.k].c);
                halo.position.copy(vT);
                halo.lookAt(C.getWorldPosition(v2));
                halo.scale.setScalar(ikanSp.s * ikanSp.pj * 2.4 + .25 + Math.sin(t * 6) * .03);
                tRod = .3;
                if (tf >= 3) { masukEmber(); S.remove(ikanM); halo.visible = false; ke('siap'); }
                break;
            }
            case 'lepas': {
                const p = Math.min(1, tf);
                ikanM.position.set(P1.x - arah * p * 3.2, air + Math.sin(p * Math.PI) * 1.4, P1.z - p * 2.5);
                ikanM.rotation.set(0, arah > 0 ? Math.PI : 0, (1 - 2 * p) * .9);
                ikanM.userData.ekor.rotation.y = Math.sin(t * 30) * .6;
                pelampung.position.set(P1.x, air + .08, P1.z);
                tRod = .55;
                if (p >= 1) { splash(v2.set(ikanM.position.x, air, ikanM.position.z)); S.remove(ikanM); ke('siap'); }
                break;
            }
        }

        // tali dari ujung joran ke pelampung / ikan
        if (garis.visible) {
            const akhir = fase === 'tarik' ? ikanM.position : pelampung.position;
            const sag = { soal: .15, tarik: .2, lempar: .4, lepas: 1.2 }[fase] ?? .9;
            vM.copy(v1).add(akhir).multiplyScalar(.5).y -= sag * 2;
            new THREE.QuadraticBezierCurve3(v1, vM, akhir).getPoints(20).forEach((p, i) => garisG.attributes.position.setXYZ(i, p.x, p.y, p.z));
            garisG.attributes.position.needsUpdate = true;
        }

        // riak, percikan
        cincinRiak.forEach((m, i) => {
            const u = (t * .7 + i / 3) % 1;
            m.position.set(P1.x, air + .06, P1.z);
            m.scale.setScalar(.3 + u * 2.2);
            m.material.opacity = riak ? (1 - u) * .6 : 0;
        });
        for (let k = 0; k < NP; k++) {
            if (pH[k] <= 0) continue;
            pH[k] -= dt;
            pV[k * 3 + 1] -= 9 * dt;
            for (let j = 0; j < 3; j++) pP[k * 3 + j] += pV[k * 3 + j] * dt;
            if (pH[k] <= 0 || pP[k * 3 + 1] < -1) { pH[k] = 0; pP[k * 3 + 1] = -50; }
        }
        pG.attributes.position.needsUpdate = true;
    };

    const sesuaikan = () => {
        R.setSize(innerWidth, innerHeight);
        C.aspect = innerWidth / innerHeight;
        C.fov = C.aspect < 1 ? 80 : 65;
        C.updateProjectionMatrix();
    };
    addEventListener('resize', sesuaikan);
    sesuaikan();
    hud();
    ke('siap');
    pesan('Tekan tombol Pancing untuk melempar kail.', 3500);
    const jam = new THREE.Clock();
    R.setAnimationLoop(() => {
        const dt = Math.min(jam.getDelta(), .05);
        update(dt, jam.elapsedTime);
        R.render(S, C);
    });
}


/* ========== MULAI OTOMATIS: nama + jenis soal dari dialog Pancing Pintar di beranda ========== */
// shortcut: data dikirim lewat sessionStorage (hilang saat tab ditutup), upgrade: query string / session Laravel bila perlu dibagikan antarhalaman
try {
    const kiriman = JSON.parse(sessionStorage.getItem('pp:mulai') || 'null');
    sessionStorage.removeItem('pp:mulai');
    if (kiriman?.nama && ['huruf', 'kata', 'campur'].includes(kiriman.jenis)) {
        $('#nama').value = kiriman.nama;
        form.elements.jenis.value = kiriman.jenis;
        form.dispatchEvent(new Event('submit', { cancelable: true }));   // memakai validasi & alur setup yang sama
    }
} catch (e) { /* tanpa sessionStorage: pemain memakai formulir setup biasa */ }