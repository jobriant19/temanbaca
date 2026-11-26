<dialog id="hadiah" class="dialog" aria-labelledby="hadiah-judul">
    <h2 id="hadiah-judul">Hadiah untukmu</h2>
    <p class="dialog__sub">Mainkan game untuk membuka semua hadiah ini.</p>
    <ul class="hadiah-grid">
        @foreach ($hadiah as $h)
            <li class="hadiah {{ $h['terbuka'] ? 'hadiah--terbuka' : '' }}">
                <span class="hadiah__ikon"><x-ikon :nama="$h['ikon']" /></span>
                <strong>{{ $h['nama'] }}</strong>
                <small>{{ $h['syarat'] }}</small>
                <em><x-ikon :nama="$h['terbuka'] ? 'cek' : 'gembok'" />{{ $h['terbuka'] ? 'Terbuka' : 'Terkunci' }}</em>
            </li>
        @endforeach
    </ul>
    <form method="dialog"><button class="tombol tombol--main">Tutup</button></form>
</dialog>
