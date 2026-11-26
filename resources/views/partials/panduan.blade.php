<dialog id="panduan" class="dialog dialog--panduan" aria-labelledby="panduan-judul">
    <header class="panduan__kepala">
        <span class="panduan__logo" aria-hidden="true"><x-ikon nama="buku" /></span>
        <div>
            <h2 id="panduan-judul">Cara bermain</h2>
            <p class="panduan__sub">Ketuk tiap langkah untuk menandainya selesai.</p>
        </div>
        <form method="dialog"><button class="panduan__tutup" aria-label="Tutup panduan">&times;</button></form>
    </header>
    <div class="panduan__isi">
        <div class="panduan__progres">
            <div class="panduan__bar" role="progressbar" aria-valuemin="0" aria-valuemax="{{ count($panduan) }}" aria-valuenow="0"><i></i></div>
            <span class="panduan__hitung" aria-hidden="true">0/{{ count($panduan) }}</span>
        </div>
        <ol>
            @foreach ($panduan as $langkah)
                <li>
                    <button type="button" class="langkah" aria-pressed="false">
                        <span class="langkah__no" aria-hidden="true">{{ $loop->iteration }}</span>
                        <span>{{ $langkah }}</span>
                    </button>
                </li>
            @endforeach
        </ol>
        <form method="dialog">
            <button class="tombol tombol--main panduan__ok"><span class="tombol__ikon"><x-ikon nama="main" /></span> Mengerti</button>
        </form>
    </div>
</dialog>