{{-- Pancing Pintar: dialog nama + jenis soal di beranda. Mulai -> halaman /pancing-pintar langsung berjalan (lihat bagian akhir pancing.js).
     Gaya memakai kelas kk-* dari kereta-kata.css (tampilan sama dengan dialog Kereta Kata / Huruf Ngebut). --}}
<link rel="stylesheet" href="{{ asset('assets/css/kereta-kata.css') }}">

<dialog id="pp-setup-beranda" class="dialog kk-dialog" aria-labelledby="pp-setup-judul">
    <form id="pp-form-beranda" autocomplete="off">
        <div class="kk-kepala">
            <span class="kk-kepala__lencana"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-play"/></svg></span>
            <div>
                <h2 id="pp-setup-judul">Pancing Pintar</h2>
                <p>Atur permainanmu dulu, ya!</p>
            </div>
            <button type="button" class="kk-tutup" data-tutup aria-label="Tutup">&times;</button>
        </div>

        <div class="kk-isi">
            <label class="kk-bidang">
                <span class="kk-bidang__judul">Nama pemain</span>
                <input type="text" name="nama" maxlength="20" placeholder="Tulis namamu" required autocomplete="off">
            </label>

            <fieldset class="kk-bidang">
                <legend class="kk-bidang__judul">Jenis soal</legend>
                <div class="kk-pilih kk-pilih--3">
                    <label class="kk-opsi kk-opsi--jenis"><input type="radio" name="jenis" value="huruf" checked><span class="kk-opsi__isi"><em>A B C</em><b>Huruf</b></span></label>
                    <label class="kk-opsi kk-opsi--jenis"><input type="radio" name="jenis" value="kata"><span class="kk-opsi__isi"><em>Bola</em><b>Kata</b></span></label>
                    <label class="kk-opsi kk-opsi--jenis"><input type="radio" name="jenis" value="campur"><span class="kk-opsi__isi"><em>A + Bola</em><b>Gabungan</b></span></label>
                </div>
            </fieldset>

            <p class="kk-petunjuk-dialog">Lempar kail, tunggu ikan menggigit, lalu ucapkan jawabanmu lewat mikrofon. Kalau mikrofon tidak bisa, jawaban boleh diketik.</p>

            <div class="kk-aksi">
                <button type="button" class="tombol tombol--kaca" data-tutup>Batal</button>
                <button type="submit" class="tombol tombol--main">
                    <span class="tombol__ikon"><svg class="ikon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><use href="#kk-play"/></svg></span>
                    Mulai
                </button>
            </div>
        </div>
    </form>
</dialog>

<script type="module">
    const tombol = document.querySelector('[data-game="pancing-pintar"]');
    const dialog = document.getElementById('pp-setup-beranda');
    const form = document.getElementById('pp-form-beranda');
    if (tombol && dialog && form) {
        // tanpa JavaScript, tombol tetap berfungsi sebagai tautan biasa ke /pancing-pintar
        tombol.addEventListener('click', (e) => { e.preventDefault(); dialog.showModal(); form.elements.nama.focus({ preventScroll: true }); });
        dialog.addEventListener('click', (e) => { if (e.target.closest('[data-tutup]')) dialog.close(); });
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nama = form.elements.nama.value.trim().slice(0, 20);
            if (!nama) return form.elements.nama.focus();
            try { sessionStorage.setItem('pp:mulai', JSON.stringify({ nama, jenis: form.elements.jenis.value })); } catch (err) { /* tanpa sessionStorage: pemain mengisi lagi di halaman game */ }
            location.href = tombol.href;
        });
    }
</script>