<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pancing Pintar · {{ $nama }}</title>
    {{-- Sama dengan layouts/app: tema tersimpan dipasang sebelum render agar tidak berkedip --}}
    <script>try{document.documentElement.dataset.tema=localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme: dark)').matches?'gelap':'terang')}catch(e){document.documentElement.dataset.tema='terang'}</script>
    <link rel="stylesheet" href="{{ asset('assets/css/dasar.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/komponen.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pancing.css') }}">
</head>
<body class="pp">
    {{-- Sprite ikon (garis, ikut warna teks). Dipakai lewat <svg class="ik"><use href="#i-nama"/></svg> --}}
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <defs>
            <symbol id="i-rumah" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h5v-6h3v6h5V10"/></symbol>
            <symbol id="i-bintang" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></symbol>
            <symbol id="i-ikan" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c2.5-4 7-5.5 11-3l3.5-3v12L14 15c-4 2.5-8.5 1-11-3z"/><circle cx="7.5" cy="11.5" r=".8" fill="currentColor"/></symbol>
            <symbol id="i-pengguna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4 3.5-6 7-6s6.5 2 7 6"/></symbol>
            <symbol id="i-buku" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10 5 7 4.500 3.500 5v13c3.500-.5 6.500 0 8.500 1.500 2-1.500 5-2 8.500-1.500V5C17 4.500 14 5 12 6.500zM12 6.500v13"/></symbol>
            <symbol id="i-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21M8.500 21h7"/></symbol>
            <symbol id="i-kail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="3.500" r="1.300"/><path d="M12 5v9a4.500 4.500 0 0 1-9 0v-1.500M3 12.500l-1.500-2M3 12.500l1.500-2"/></symbol>
            <symbol id="i-jangkar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v14M7 11h10M4 14c0 4 3.500 7 8 7s8-3 8-7M4 14l-1.500 2M20 14l1.500 2"/></symbol>
            <symbol id="i-huruf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.500 19 8 5l5.500 14M4.500 14h7"/><circle cx="18" cy="15.500" r="3"/><path d="M21 12.500V19"/></symbol>
            <symbol id="i-acak" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3c5 0 5 10 10 10h5M3 17h3c1.500 0 2.700-.8 3.700-2M13.500 9c.8-1.200 1.700-2 3.500-2h4M18 4l3 3-3 3M18 14l3 3-3 3"/></symbol>
            <symbol id="i-kunci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></symbol>
            <symbol id="i-trofi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.500c0 3 1.500 4.500 4 5M16 6h3.500c0 3-1.500 4.500-4 5M12 13v4M8.500 20h7M10 17h4"/></symbol>
            <symbol id="i-hati" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.500" stroke-linejoin="round"><path d="M12 20s-8-4.800-8-10.500A4.500 4.500 0 0 1 12 7a4.500 4.500 0 0 1 8 2.500C20 15.200 12 20 12 20z"/></symbol>
            <symbol id="i-benar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.500 3 3 5-6"/></symbol>
            <symbol id="i-salah" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></symbol>
            <symbol id="i-peringatan" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.500 20h19z"/><path d="M12 10v4.500M12 17.500v.1"/></symbol>
        </defs>
    </svg>

    {{-- Latar sama dengan beranda --}}
    <div class="latar" aria-hidden="true">
        <div class="langit">
            <i class="matahari"></i><i class="bulan"></i>
            <div class="bintang-lapis"><i class="meteor meteor--1"></i><i class="meteor meteor--2"></i></div>
            <i class="awan awan--1"></i><i class="awan awan--2"></i><i class="awan awan--3"></i><i class="awan awan--4"></i>
            <i class="burung burung--1"></i><i class="burung burung--2"></i>
        </div>
        <i class="bukit bukit--a"></i><i class="bukit bukit--b"></i><i class="bukit bukit--c"></i>
    </div>

    {{-- LAYAR 1: header + popup isi nama & jenis soal --}}
    <div id="setup" class="pp-setup">
        <header class="header">
            <a class="tombol tombol--kaca" href="{{ url('/') }}">
                <span class="tombol__ikon"><svg class="ik" aria-hidden="true"><use href="#i-rumah"/></svg></span>Beranda
            </a>
            <div class="header__aksi">
                <button id="tombol-tema" class="tema" type="button" role="switch" aria-checked="false" aria-label="Ganti tema terang atau gelap">
                    <span class="tema__langit">
                        <i class="tema__bintang"></i><i class="tema__bintang tema__bintang--2"></i>
                        <i class="tema__awan"></i><i class="tema__awan tema__awan--2"></i>
                        <i class="tema__bukit"></i><i class="tema__zzz">z</i>
                    </span>
                    <span class="tema__bola"><i class="tema__sinar"></i><i class="tema__wajah"></i></span>
                </button>
                <button id="tombol-hadiah" class="tombol tombol--hadiah" type="button">
                    <span class="tombol__ikon"><x-ikon nama="hadiah" /></span>Hadiah
                </button>
                <button id="tombol-panduan" class="tombol tombol--kaca" type="button">
                    <span class="tombol__ikon"><x-ikon nama="buku" /></span>Panduan
                </button>
            </div>
        </header>

        <main class="pp-tengah">
            <form id="setup-form" class="pp-popup" novalidate autocomplete="off" aria-labelledby="pp-judul">
                <figure class="pp-popup__gambar">
                    <img src="{{ asset('assets/img/game4.jpg') }}" alt="Cuplikan game Pancing Pintar">
                    <figcaption id="pp-judul" class="pp-badge"><svg class="ik" aria-hidden="true"><use href="#i-kail"/></svg>Pancing Pintar</figcaption>
                </figure>
                <div class="pp-popup__isi">
                    <p class="pp-sub">Isi namamu, pilih jenis soal, lalu berlayar mencari ikan ajaib.</p>

                    <label class="pp-label" for="nama">Nama pemain</label>
                    <input id="nama" name="nama" maxlength="20" placeholder="Contoh: Budi">

                    <fieldset class="pp-jenis">
                        <legend class="pp-label">Jenis soal</legend>
                        <label><input type="radio" name="jenis" value="huruf"><span><svg class="ik" aria-hidden="true"><use href="#i-huruf"/></svg>Huruf</span></label>
                        <label><input type="radio" name="jenis" value="kata"><span><svg class="ik" aria-hidden="true"><use href="#i-buku"/></svg>Kata</span></label>
                        <label><input type="radio" name="jenis" value="campur"><span><svg class="ik" aria-hidden="true"><use href="#i-acak"/></svg>Gabungan</span></label>
                    </fieldset>

                    <button class="pp-tombol" type="submit"><svg class="ik" aria-hidden="true"><use href="#i-jangkar"/></svg>Mulai</button>
                </div>
            </form>
        </main>
    </div>

    {{-- LAYAR 2: game 3D --}}
    <section id="game" hidden>
        <canvas id="kanvas"></canvas>

        <header class="pp-hud">
            <div class="pp-hud__kiri">
                <a class="pp-hud__rumah" href="{{ url('/') }}" aria-label="Beranda" title="Beranda"><svg class="ik" aria-hidden="true"><use href="#i-rumah"/></svg></a>
                <span class="pp-pemain"><i class="pp-avatar" id="hud-awal" aria-hidden="true"></i><span id="hud-nama"></span></span>
                <span class="pp-stat pp-stat--skor"><i class="pp-stat__ikon"><svg class="ik" aria-hidden="true"><use href="#i-bintang"/></svg></i><span class="pp-stat__angka"><b id="skor">0</b><small>Skor</small></span></span>
                <span class="pp-stat pp-stat--ikan"><i class="pp-stat__ikon"><svg class="ik" aria-hidden="true"><use href="#i-ikan"/></svg></i><span class="pp-stat__angka"><b id="jumlah">0</b><small>Ikan</small></span></span>
            </div>
            <button class="pp-koleksi" id="bukaKoleksi" type="button"><svg class="ik" aria-hidden="true"><use href="#i-buku"/></svg><span>Koleksi &amp; Skor</span><em id="hudJenis">0/8</em></button>
        </header>

        <div id="pesan" class="pp-pesan" role="status" aria-live="polite"></div>
        <div id="tangkapan" class="pp-tangkapan" hidden></div>

        {{-- panel soal: muncul saat ikan menggigit. Tiap informasi hanya tampil satu kali --}}
        <div id="soal" class="pp-soal" hidden>
            <div class="pp-soal__atas">
                <span id="soalKelas" class="pp-soal__kelas"></span>
                <span id="nyawa" class="pp-nyawa" aria-label="Kesempatan tersisa"></span>
            </div>
            <small id="soalPetunjuk"></small>
            <div id="soalTeks" class="pp-soal__teks"></div>
            <div class="pp-timer" id="timer"><i></i></div>
            <div id="hasil" class="pp-hasil" role="status" aria-live="assertive" hidden>
                <svg class="ik" aria-hidden="true"><use id="hasilIkon" href="#i-benar"/></svg>
                <div><b id="hasilJudul"></b><span id="hasilRinci"></span></div>
            </div>
            <button id="mic" class="pp-mic" type="button" aria-label="Mulai bicara"><svg class="ik" aria-hidden="true"><use href="#i-mic"/></svg></button>
            <p id="info" class="pp-info" aria-live="polite"></p>
            <form id="ketik" class="pp-ketik" hidden>
                <input id="ketikInput" placeholder="Ketik jawabanmu" autocomplete="off">
                <button class="pp-tombol" type="submit">Jawab</button>
            </form>
        </div>

        <div class="pp-bawah">
            <button id="pancing" class="pp-tombol pp-tombol--besar" type="button"><svg class="ik" aria-hidden="true"><use href="#i-kail"/></svg>Pancing!</button>
        </div>
    </section>

    {{-- Popup peringatan di tengah layar --}}
    <dialog id="peringatan" class="pp-dialog pp-dialog--tengah">
        <h2>Belum lengkap</h2>
        <ul id="kurang" class="pp-kurang"></ul>
        <form method="dialog"><button class="pp-tombol" autofocus>Mengerti</button></form>
    </dialog>

    {{-- Panduan --}}
    <dialog id="dlg-panduan" class="pp-dialog">
        <h2>Cara bermain</h2>
        <ol class="pp-langkah">
            <li>Isi nama dan pilih jenis soal: huruf, kata, atau gabungan.</li>
            <li>Tekan Pancing untuk melempar kail, lalu tunggu ikan menggigit.</li>
            <li>Saat soal muncul, ketuk mikrofon dan ucapkan jawabanmu dengan jelas.</li>
            <li>Jawaban benar menarik ikan ke ember. Jika terus salah, ikan lepas.</li>
            <li>Ikan langka memberi poin lebih banyak. Kumpulkan semuanya di Koleksi.</li>
        </ol>
        <p class="pp-catatan">Mikrofon butuh Chrome, Edge, atau Safari dan izin mikrofon. Jika tidak bisa, jawaban boleh diketik.</p>
        <form method="dialog"><button class="pp-tombol" autofocus>Mengerti</button></form>
    </dialog>

    {{-- Hadiah: isi daftar dibuat dari data di pancing.js --}}
    <dialog id="dlg-hadiah" class="pp-dialog">
        <h2>Hadiah Pancing Pintar</h2>
        <p class="pp-catatan">Poin tiap ikan bergantung pada kelangkaannya.</p>
        <ul id="hadiahKelas" class="pp-hadiah"></ul>
        <h3>Gelar pemancing</h3>
        <ul id="hadiahGelar" class="pp-gelar"></ul>
        <form method="dialog"><button class="pp-tombol" autofocus>Tutup</button></form>
    </dialog>

    {{-- Koleksi ikan + ringkasan --}}
    <dialog id="koleksi" class="pp-dialog">
        <h2>Buku Koleksi Ikan</h2>
        <p class="pp-ringkas"><b id="kNama"></b><span id="kGelar"></span><span>Skor <b id="kSkor"></b></span><span>Jenis <b id="kJenis"></b></span></p>
        <ul id="daftarIkan" class="pp-daftar"></ul>
        <div class="pp-aksi">
            <form method="dialog"><button class="pp-tombol" autofocus>Lanjut memancing</button></form>
            <a class="pp-tombol pp-tombol--abu" href="{{ url('/pancing-pintar') }}">Selesai / main ulang</a>
        </div>
    </dialog>

    {{-- shortcut: Three.js dari CDN (butuh internet), upgrade: simpan three.min.js di public/assets/js/ bila harus offline --}}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="{{ asset('assets/js/pancing-dunia.js') }}" defer></script>
    <script src="{{ asset('assets/js/pancing.js') }}" defer></script>
</body>
</html>