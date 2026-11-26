{{-- Game "Huruf Ngebut": dialog pengaturan + layar game 3D penuh. Dibuka oleh tombol Bermain (href="#huruf-ngebut"). --}}
<link rel="stylesheet" href="{{ asset('assets/css/huruf-ngebut.css') }}">

{{-- ===== 1. Pengaturan: tingkat, jenis soal, nama pemain ===== --}}
<dialog id="hn-setup" class="dialog hn-dialog" aria-labelledby="hn-setup-judul">
    <form id="hn-form" novalidate>
        <header class="hn-kepala">
            <span class="hn-kepala__lencana" aria-hidden="true"><x-ikon nama="main" /></span>
            <div>
                <h2 id="hn-setup-judul">Huruf Ngebut</h2>
                <p>Atur permainanmu dulu, ya!</p>
            </div>
            <button type="button" class="hn-tutup" data-tutup aria-label="Tutup">&times;</button>
        </header>

        <div class="hn-isi">
            <label class="hn-bidang">
                <span class="hn-bidang__judul">Nama pemain</span>
                <input id="hn-nama-input" name="nama" type="text" maxlength="12" autocomplete="nickname" placeholder="Tulis namamu" required>
            </label>

            <div class="hn-bidang" role="radiogroup" aria-labelledby="hn-judul-tingkat">
                <span id="hn-judul-tingkat" class="hn-bidang__judul">Tingkat kesulitan</span>
                <div class="hn-pilih hn-pilih--3">
                    @foreach ([['mudah', 'Mudah', 5, 8], ['sedang', 'Sedang', 4, 12], ['sulit', 'Sulit', 3, 16]] as [$nilai, $nama, $nyawa, $gerbang])
                        <label class="hn-opsi">
                            <input type="radio" name="tingkat" value="{{ $nilai }}" @checked($nilai === 'mudah')>
                            <span class="hn-opsi__isi hn-opsi--{{ $nilai }}">
                                <b>{{ $nama }}</b>
                                <small><svg class="hn-mini" viewBox="0 0 24 24" aria-hidden="true"><use href="#hn-hati"/></svg> {{ $nyawa }} nyawa</small>
                                <small>{{ $gerbang }} gerbang</small>
                            </span>
                        </label>
                    @endforeach
                </div>
            </div>

            <div class="hn-bidang" role="radiogroup" aria-labelledby="hn-judul-jenis">
                <span id="hn-judul-jenis" class="hn-bidang__judul">Jenis soal</span>
                <div class="hn-pilih hn-pilih--3">
                    @foreach ([['huruf', 'Huruf', 'A  B  C'], ['kata', 'Kata', 'Bola'], ['gabungan', 'Gabungan', 'A + Bola']] as [$nilai, $nama, $contoh])
                        <label class="hn-opsi">
                            <input type="radio" name="jenis" value="{{ $nilai }}" @checked($nilai === 'huruf')>
                            <span class="hn-opsi__isi hn-opsi--jenis">
                                <em>{{ $contoh }}</em>
                                <b>{{ $nama }}</b>
                            </span>
                        </label>
                    @endforeach
                </div>
            </div>

            <div class="hn-suara">
                <button type="button" id="hn-coba-suara" class="tombol tombol--kaca">
                    <span class="tombol__ikon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a4.5 4.5 0 0 0-2-3.7v7.4a4.5 4.5 0 0 0 2-3.7z"/></svg></span>Coba suara
                </button>
                <p id="hn-suara-info" role="status">Memeriksa suara…</p>
            </div>
            <p class="hn-petunjuk">Dengarkan suaranya, lalu lari ke gerbang yang cocok. Geser dengan tombol panah, A / D, atau usap layar.</p>

            <div class="hn-aksi">
                <button type="submit" id="hn-mulai" class="tombol tombol--main"><span class="tombol__ikon"><x-ikon nama="main" /></span>Mulai</button>
            </div>
        </div>
    </form>
</dialog>

{{-- Simbol hati dipakai bersama (pengaturan & layar game) --}}
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="hn-hati" viewBox="0 0 24 24"><path d="M12 21.2S3.6 16 1.6 10.6C.2 6.7 2.6 3.5 6.2 3.5c2.2 0 3.9 1.1 5.8 3.3 1.9-2.2 3.6-3.3 5.8-3.3 3.6 0 6 3.2 4.6 7.1C20.4 16 12 21.2 12 21.2z"/></symbol>
</svg>

{{-- ===== 2. Layar game penuh ===== --}}
<div id="hn-game" class="hn" hidden role="application" aria-label="Game Huruf Ngebut">
    <div id="hn-kanvas" class="hn__kanvas"></div>
    <div id="hn-efek" class="hn__efek" aria-hidden="true"></div>

    <div class="hn__hud">
        <div class="hn__atas">
            <button type="button" id="hn-btn-jeda" class="hn-ikon" aria-label="Jeda (tombol P)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg></button>
            <div class="hn__skor"><span id="hn-nama" class="hn__nama"></span><b id="hn-skor">0</b></div>
            <div class="hn__alat">
                <button type="button" id="hn-btn-ulang" class="hn-ikon" aria-label="Ulangi suara (tombol Spasi)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg></button>
                <button type="button" id="hn-btn-suara" class="hn-ikon" aria-pressed="true" aria-label="Suara hidup/mati (tombol M)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a4.5 4.5 0 0 0-2-3.7v7.4a4.5 4.5 0 0 0 2-3.7zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/><path class="hn-coret" d="M3 3l18 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
                <button type="button" id="hn-btn-layar" class="hn-ikon" aria-label="Layar penuh"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h5v2H7v3H5V5zm9 0h5v5h-2V7h-3V5zM5 14h2v3h3v2H5v-5zm12 0h2v5h-5v-2h3v-3z"/></svg></button>
            </div>
        </div>
        <div class="hn__info">
            <div id="hn-nyawa" class="hn__nyawa" aria-label="Nyawa"></div>
            <div class="hn__progres"><span id="hn-progres-teks">Gerbang 1/8</span><i><b id="hn-progres-bar"></b></i></div>
        </div>
        <div id="hn-tanya" class="hn__tanya" role="status">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a4.5 4.5 0 0 0-2-3.7v7.4a4.5 4.5 0 0 0 2-3.7zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>
            <span id="hn-tanya-teks">Dengarkan suaranya…</span>
        </div>
    </div>

    <div id="hn-hitung" class="hn__hitung" aria-live="assertive"></div>
    <div id="hn-pop" class="hn__pop" aria-live="polite"></div>

    <div class="hn__kontrol">
        <button type="button" id="hn-kiri" class="hn-panah" aria-label="Geser ke kiri"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button type="button" id="hn-kanan" class="hn-panah" aria-label="Geser ke kanan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>

    <div id="hn-memuat" class="hn__memuat">
        <div class="hn__spinner" aria-hidden="true"></div>
        <p id="hn-memuat-teks">Memuat arena 3D…</p>
        <button type="button" id="hn-galat-keluar" class="tombol tombol--kaca" hidden>Kembali</button>
    </div>

    {{-- Jeda --}}
    <dialog id="hn-jeda" class="dialog hn-dialog hn-dialog--kecil" aria-labelledby="hn-jeda-judul">
        <header class="hn-kepala hn-kepala--tengah"><div><h2 id="hn-jeda-judul">Permainan dijeda</h2><p>Istirahat sebentar, ya!</p></div></header>
        <div class="hn-isi hn-tumpuk">
            <button type="button" id="hn-lanjut" class="tombol tombol--main"><span class="tombol__ikon"><x-ikon nama="main" /></span>Lanjut main</button>
            <button type="button" id="hn-ulangi" class="tombol tombol--kaca">Mulai dari awal</button>
            <button type="button" id="hn-keluar" class="tombol tombol--kaca">Keluar ke beranda</button>
        </div>
    </dialog>

    {{-- Game over / selesai --}}
    <dialog id="hn-selesai" class="dialog hn-dialog" aria-labelledby="hn-hasil-judul">
        <header class="hn-kepala hn-kepala--tengah">
            <div><h2 id="hn-hasil-judul">Game Over</h2><p id="hn-hasil-sub"></p></div>
        </header>
        <div class="hn-isi">
            <div id="hn-bintang" class="hn-bintang" aria-hidden="true">
                @for ($i = 0; $i < 3; $i++)<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>@endfor
            </div>
            <dl class="hn-statistik">
                <div><dt>Skor</dt><dd id="hn-h-skor">0</dd></div>
                <div><dt>Benar</dt><dd id="hn-h-benar">0</dd></div>
                <div><dt>Salah</dt><dd id="hn-h-salah">0</dd></div>
                <div><dt>Rekor</dt><dd id="hn-h-rekor">0</dd></div>
            </dl>
            <div class="hn-tumpuk">
                <button type="button" id="hn-main-lagi" class="tombol tombol--main"><span class="tombol__ikon"><x-ikon nama="main" /></span>Main lagi</button>
                <button type="button" id="hn-atur" class="tombol tombol--kaca">Ubah pengaturan</button>
                <button type="button" id="hn-beranda" class="tombol tombol--kaca">Kembali ke beranda</button>
            </div>
        </div>
    </dialog>
</div>

{{-- Pemuat malas: huruf-ngebut.js (+ three.js) baru diunduh saat tombol Bermain disentuh/disorot/diklik, jadi beranda tetap ringan. --}}
<script type="module">
    const url = @js(asset('assets/js/huruf-ngebut.js'));
    let muat = null;
    const siap = () => muat ||= import(url);
    const tautan = (e) => e.target.closest?.('a[href="#huruf-ngebut"]');
    const gagal = (err) => {
        muat = null; console.error('Huruf Ngebut gagal dimuat:', err);
        alert('Game belum bisa dibuka.\nPastikan file ini ada, lalu muat ulang dengan Ctrl+F5:\n- public/assets/js/huruf-ngebut.js\n- public/assets/css/huruf-ngebut.css\n- public/assets/vendor/three/three.module.js\n- public/assets/vendor/three/three.core.js\n\nRincian: ' + (err?.message || err));
    };
    for (const nama of ['pointerover', 'touchstart', 'focusin']) document.addEventListener(nama, (e) => { if (tautan(e)) siap().catch(() => {}); }, { passive: true });
    document.addEventListener('click', async (e) => {
        if (!tautan(e)) return;
        e.preventDefault();
        try { if (!(await siap()).bukaPengaturan()) throw new Error('dialog pengaturan (#hn-setup) tidak ada di halaman'); } catch (err) { gagal(err); }
    });
</script>