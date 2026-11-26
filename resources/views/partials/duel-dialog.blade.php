{{-- Popup pengaturan Duel Tambang. Terbuka saat tombol Bermain (href berakhiran /duel-tambang) diklik; tombol Mulai membuka arena. --}}
<link rel="stylesheet" href="{{ asset('assets/css/duel.css') }}">

<dialog id="ddDuel" class="dialog dialog--panduan dd" aria-labelledby="ddJudul" data-url="{{ url('/duel-tambang') }}">
    <div class="panduan__kepala">
        <span class="panduan__logo"><svg viewBox="0 0 24 24" width="1.7rem" height="1.7rem" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5Z"/></svg></span>
        <div><h2 id="ddJudul">Duel Tambang</h2><p class="panduan__sub">Atur pertandingan dulu, ya!</p></div>
        <button type="button" class="panduan__tutup" id="ddTutup" aria-label="Tutup"><svg viewBox="0 0 24 24" width="1.1rem" height="1.1rem" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </div>

    <div class="panduan__isi">
        <div>
            <div class="dd-label">Jumlah soal <output id="ddVSoal">10</output></div>
            <input type="range" id="ddSoal" min="5" max="25" value="10" aria-label="Jumlah soal">
        </div>

        <div>
            <div class="dd-label">Jumlah pemain</div>
            <div class="dd-grup pemain" style="--n:5" id="ddPemain">
                @foreach ([2 => '1 lawan 1', 3 => '2 lawan 1', 4 => '2 lawan 2', 5 => '3 lawan 2', 6 => '3 lawan 3'] as $n => $ket)
                    <button type="button" class="dd-kartu @if ($n === 2) on @endif" data-v="{{ $n }}"><b>{{ $n }}</b><small>{{ $ket }}</small></button>
                @endforeach
            </div>
        </div>

        <div>
            <div class="dd-label">Nama pemain</div>
            <div class="dd-tim">
                <div class="dd-t"><h3>Tim Kiri</h3><div id="ddKiri"></div></div>
                <div class="dd-t kanan"><h3>Tim Kanan</h3><div id="ddKanan"></div></div>
            </div>
        </div>

        <div>
            <div class="dd-label">Jenis soal</div>
            <div class="dd-grup tipe" id="ddJenis">
                <button type="button" class="dd-kartu" data-v="huruf"><b>ABC</b><small>Huruf</small></button>
                <button type="button" class="dd-kartu" data-v="kata"><b>Kata</b><small>Gambar &amp; kata</small></button>
                <button type="button" class="dd-kartu on" data-v="gabungan"><b>ABC + Kata</b><small>Gabungan</small></button>
            </div>
        </div>

        <div class="dd-suara">
            <button type="button" class="tombol tombol--kaca" id="ddUji">
                <span class="tombol__ikon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.2 5.8a9 9 0 0 1 0 12.4"/></svg></span>Coba suara
            </button>
            <small id="ddStatus"></small>
        </div>

        <div class="dd-aksi">
            <button type="button" class="dd-batal" id="ddBatal">Batal</button>
            <button type="button" class="tombol tombol--main panduan__ok" id="ddMulai"><span class="tombol__ikon"><x-ikon nama="main" /></span>Mulai</button>
        </div>
    </div>
</dialog>

{{-- Peringatan di tengah layar bila ada nama pemain yang kosong --}}
<dialog id="ddAwas" class="dialog dialog--panduan dd-awas" aria-labelledby="ddAwasJ">
    <div class="panduan__kepala">
        <span class="panduan__logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 2.8 19.5h18.4zM12 10v4.5M12 17.2v.1"/></svg></span>
        <div><h2 id="ddAwasJ">Nama belum lengkap</h2></div>
    </div>
    <div class="panduan__isi">
        <p>Isi semua nama pemain dulu ya, baru pertandingan bisa dimulai.</p>
        <form method="dialog"><button class="tombol tombol--main panduan__ok"><span class="tombol__ikon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>Mengerti</button></form>
    </div>
</dialog>

<script src="{{ asset('assets/js/duel-dialog.js') }}" defer></script>