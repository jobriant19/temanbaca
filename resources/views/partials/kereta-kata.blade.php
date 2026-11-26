{{-- Kereta Kata: dialog pengaturan, layar game, dialog jeda & hasil.
     Logika 3D dimuat malas dari kereta-kata.js saat tombol Bermain (data-game="kereta-kata") disentuh/diklik. --}}
<link rel="stylesheet" href="{{ asset('assets/css/kereta-kata.css') }}">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <defs>
        <symbol id="kk-hati" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></symbol>
        <symbol id="kk-suara" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></symbol>
        <symbol id="kk-jeda" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></symbol>
        <symbol id="kk-layar" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></symbol>
        <symbol id="kk-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></symbol>
        <symbol id="kk-bintang" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></symbol>
        <symbol id="kk-ulang" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></symbol>
        <symbol id="kk-rumah" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></symbol>
        <symbol id="kk-kereta" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5V21h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></symbol>
    </defs>
</svg>

{{-- ===== Pengaturan: nama, tingkat kesulitan, jenis soal ===== --}}
<dialog id="kk-setup" class="dialog kk-dialog" aria-labelledby="kk-setup-judul">
    <form id="kk-form" autocomplete="off">
        <div class="kk-kepala">
            <span class="kk-kepala__lencana"><svg class="ikon" aria-hidden="true"><use href="#kk-kereta"/></svg></span>
            <div>
                <h2 id="kk-setup-judul">Kereta Kata</h2>
                <p>Atur perjalananmu dulu, ya!</p>
            </div>
            <button type="button" class="kk-tutup" data-tutup aria-label="Tutup">&times;</button>
        </div>

        <div class="kk-isi">
            <label class="kk-bidang">
                <span class="kk-bidang__judul">Nama pemain</span>
                <input type="text" id="kk-nama-input" name="nama" maxlength="12" placeholder="Tulis namamu" autocomplete="off">
            </label>

            <fieldset class="kk-bidang">
                <legend class="kk-bidang__judul">Tingkat kesulitan</legend>
                <div class="kk-pilih kk-pilih--3">
                    {{-- angka nyawa/stasiun di bawah harus sama dengan TINGKAT di kereta-kata.js --}}
                    <label class="kk-opsi kk-opsi--mudah"><input type="radio" name="tingkat" value="mudah" checked><span class="kk-opsi__isi"><b>Mudah</b><small><svg class="kk-mini" viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-hati"/></svg> 5 nyawa</small><small>4 stasiun</small></span></label>
                    <label class="kk-opsi kk-opsi--sedang"><input type="radio" name="tingkat" value="sedang"><span class="kk-opsi__isi"><b>Sedang</b><small><svg class="kk-mini" viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-hati"/></svg> 4 nyawa</small><small>5 stasiun</small></span></label>
                    <label class="kk-opsi kk-opsi--sulit"><input type="radio" name="tingkat" value="sulit"><span class="kk-opsi__isi"><b>Sulit</b><small><svg class="kk-mini" viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-hati"/></svg> 3 nyawa</small><small>6 stasiun</small></span></label>
                </div>
            </fieldset>

            <fieldset class="kk-bidang">
                <legend class="kk-bidang__judul">Jenis soal</legend>
                <div class="kk-pilih kk-pilih--3">
                    <label class="kk-opsi kk-opsi--jenis"><input type="radio" name="jenis" value="huruf" checked><span class="kk-opsi__isi"><em>A B C</em><b>Huruf</b><small>jadi kata</small></span></label>
                    <label class="kk-opsi kk-opsi--jenis"><input type="radio" name="jenis" value="kalimat"><span class="kk-opsi__isi"><em>Ibu masak</em><b>Kata</b><small>jadi kalimat</small></span></label>
                    <label class="kk-opsi kk-opsi--jenis"><input type="radio" name="jenis" value="gabungan"><span class="kk-opsi__isi"><em>A + Ibu</em><b>Gabungan</b><small>huruf &amp; kata</small></span></label>
                </div>
            </fieldset>

            <div class="kk-suara">
                <button type="button" id="kk-coba-suara" class="tombol tombol--kaca">
                    <span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-suara"/></svg></span>
                    Coba suara
                </button>
                <p id="kk-suara-info" role="status">Memeriksa suara…</p>
            </div>

            <p class="kk-petunjuk-dialog">Dengarkan perintah suara, lalu ketuk dua gerbong untuk menukar posisinya. Kalau susunannya sudah tepat, tekan Berangkat dan kereta melaju! Bisa juga dengan tombol panah, Spasi, dan Enter.</p>

            <div class="kk-aksi">
                <button type="button" class="tombol tombol--kaca" data-tutup>Batal</button>
                <button type="submit" id="kk-mulai" class="tombol tombol--main">
                    <span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-play"/></svg></span>
                    Mulai
                </button>
            </div>
        </div>
    </form>
</dialog>

{{-- ===== Layar game ===== --}}
<section id="kk-game" class="kk" hidden aria-label="Permainan Kereta Kata">
    <div id="kk-kanvas" class="kk__kanvas"></div>
    <div id="kk-efek" class="kk__efek"></div>

    <div class="kk__hud">
        <div class="kk__atas">
            <div class="kk__alat">
                <button type="button" id="kk-btn-jeda" class="kk-ikon" aria-label="Jeda"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-jeda"/></svg></button>
                <button type="button" id="kk-btn-suara" class="kk-ikon" aria-label="Suara" aria-pressed="true">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-suara"/><path class="kk-coret" d="M3.5 3.5 20.5 20.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>
                </button>
            </div>
            <div class="kk__skor"><span class="kk__nama" id="kk-nama"></span><b id="kk-skor">0</b></div>
            <div class="kk__alat">
                <button type="button" id="kk-btn-layar" class="kk-ikon" aria-label="Layar penuh"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-layar"/></svg></button>
            </div>
        </div>
        <div class="kk__info">
            <div class="kk__nyawa" id="kk-nyawa" role="img"></div>
            <div class="kk__progres"><span id="kk-progres-teks">Stasiun 1/4</span><i><b id="kk-progres-bar"></b></i></div>
        </div>
        <div class="kk__tanya" id="kk-tanya" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-suara"/></svg><span id="kk-tanya-teks"></span></div>
        <p class="kk__putar">Putar layar ke mendatar agar gerbong tampak lebih besar.</p>
    </div>

    <div id="kk-pop" class="kk__pop" aria-live="polite"></div>

    <div class="kk__bawah">
        <p class="kk__petunjuk">Ketuk dua gerbong untuk saling bertukar, lalu tekan Berangkat.</p>
        <div class="kk__tombol">
            <button type="button" id="kk-btn-ulang" class="kk-dengar"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#kk-suara"/></svg>Dengar</button>
            <button type="button" id="kk-btn-berangkat" class="tombol tombol--main kk-berangkat" disabled>
                <span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-play"/></svg></span>
                Berangkat
            </button>
        </div>
    </div>

    {{-- Jeda: lapisan biasa di dalam layar game (bukan <dialog>) agar selalu tampil, juga saat layar penuh --}}
    <div id="kk-jeda" class="kk__jeda" role="dialog" aria-modal="true" aria-labelledby="kk-jeda-judul" hidden>
        <div class="dialog kk-dialog kk-dialog--kecil kk__jeda-kotak">
            <div class="kk-kepala kk-kepala--tengah"><div><h2 id="kk-jeda-judul">Jeda</h2><p>Kereta berhenti sebentar.</p></div></div>
            <div class="kk-isi">
                <div class="kk-tumpuk">
                    <button type="button" id="kk-lanjut" class="tombol tombol--main"><span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-play"/></svg></span>Lanjutkan</button>
                    <button type="button" id="kk-ulangi" class="tombol tombol--kaca"><span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-ulang"/></svg></span>Ulangi</button>
                    <button type="button" id="kk-keluar" class="tombol tombol--kaca"><span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-rumah"/></svg></span>Keluar</button>
                </div>
            </div>
        </div>
    </div>

    <div id="kk-memuat" class="kk__memuat" hidden>
        <div id="kk-spinner" class="kk__spinner"></div>
        <p id="kk-memuat-teks">Memuat stasiun 3D…</p>
        <button type="button" id="kk-galat-keluar" class="tombol tombol--kaca" hidden>Kembali</button>
    </div>
</section>

{{-- ===== Hasil ===== --}}
<dialog id="kk-selesai" class="dialog kk-dialog" aria-labelledby="kk-hasil-judul">
    <div class="kk-kepala kk-kepala--tengah"><div><h2 id="kk-hasil-judul">Sampai tujuan, hebat!</h2><p id="kk-hasil-sub"></p></div></div>
    <div class="kk-isi">
        <div class="kk-bintang" id="kk-bintang" aria-hidden="true">
            <svg viewBox="0 0 24 24"><use href="#kk-bintang"/></svg><svg viewBox="0 0 24 24"><use href="#kk-bintang"/></svg><svg viewBox="0 0 24 24"><use href="#kk-bintang"/></svg>
        </div>
        <dl class="kk-statistik">
            <div><dt>Skor</dt><dd id="kk-h-skor">0</dd></div>
            <div><dt>Rekor</dt><dd id="kk-h-rekor">0</dd></div>
            <div><dt>Stasiun benar</dt><dd id="kk-h-benar">0</dd></div>
            <div><dt>Salah</dt><dd id="kk-h-salah">0</dd></div>
        </dl>
        <div class="kk-tumpuk">
            <button type="button" id="kk-main-lagi" class="tombol tombol--main"><span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-ulang"/></svg></span>Main lagi</button>
            <button type="button" id="kk-atur" class="tombol tombol--kaca">Ganti pengaturan</button>
            <button type="button" id="kk-beranda" class="tombol tombol--kaca"><span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-rumah"/></svg></span>Beranda</button>
        </div>
    </div>
</dialog>

{{-- Pemuat malas: berkas 3D baru diunduh saat tombol Bermain disorot/disentuh, lalu dialog pengaturan dibuka saat diklik. --}}
<script type="module">
    const tombol = document.querySelector('[data-game="kereta-kata"]');
    let muat = null;
    const impor = () => (muat ||= import("{{ asset('assets/js/kereta-kata.js') }}").catch((e) => { muat = null; throw e; }));
    ['pointerenter', 'touchstart', 'focus'].forEach((n) => tombol?.addEventListener(n, () => impor().catch(() => {}), { once: true, passive: true }));
    tombol?.addEventListener('click', async (e) => {
        e.preventDefault();
        try { (await impor()).bukaPengaturan(); } catch (err) { console.error(err); }
    });
</script>