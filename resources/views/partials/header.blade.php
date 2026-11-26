<header class="header">
    <a class="header__logo" href="{{ url('/') }}">
        <img src="{{ asset('assets/img/logo.png') }}" alt="Logo {{ $nama }}">
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
