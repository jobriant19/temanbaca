@props(['game', 'indeks' => 0])

<article class="kartu" style="--i: {{ $indeks }}">
    <div class="kartu__gambar">
        <img src="{{ asset('assets/img/'.$game['gambar']) }}" alt="Tampilan {{ $game['nama'] }}" decoding="async">
    </div>
    <h2 aria-label="{{ $game['nama'] }}">@foreach (mb_str_split($game['nama']) as $huruf)<span @class(['spasi' => $huruf === ' ']) aria-hidden="true" style="--j: {{ $loop->index }}">{{ trim($huruf) }}</span>@endforeach</h2>
    <p>{{ $game['deskripsi'] }}</p>
    <a class="tombol tombol--main" href="{{ $game['url'] }}" data-game="{{ Str::slug($game['nama']) }}">
        <span class="tombol__ikon"><x-ikon nama="main" /></span>
        Bermain
    </a>
</article>