@extends('layouts.app')

@section('isi')
    @php $maskot = config('gamifikasi.maskot', $nama); @endphp
    @include('partials.header')

    <main class="utama">
        <section class="hero">
            @php $katas = explode(' ', $judul); $i = 0; @endphp
            <h1>@foreach (array_chunk($katas, (int) ceil(count($katas) / 2)) as $baris)<span class="baris">@foreach ($baris as $kata)<span class="kata" data-w="{{ $i % 4 }}" style="--n: {{ $i++ }}">{{ $kata }}</span> @endforeach</span>@endforeach</h1>
            <p class="hero__teks">{{ $deskripsi }}</p>
            <div class="panggung" data-sapaan="{{ json_encode($sapaan) }}">
                <div class="panggung__maskot">
                    <div class="orbit" aria-hidden="true">
                        @foreach (['A', 'B', 'C', 'D'] as $huruf)<i class="huruf huruf--{{ $loop->iteration }}">{{ $huruf }}</i>@endforeach
                    </div>
                    <span class="panggung__alas"></span>
                    <img class="hero__maskot" src="{{ asset('assets/img/mascot.png') }}" alt="Maskot {{ $maskot }}">
                </div>
                <div class="gelembung" role="status" aria-live="polite">
                    <span class="gelembung__nama">{{ $maskot }}</span>
                    <p class="gelembung__teks">{{ $sapaan[0] ?? '' }}</p>
                </div>
            </div>
        </section>

        <section class="daftar-game" aria-label="Daftar game">
            @foreach ($games as $game)
                <x-kartu-game :game="$game" :indeks="$loop->index" />
            @endforeach
        </section>
    </main>

    @include('partials.panduan')
    @include('partials.hadiah')
    @include('partials.duel-dialog')
    @include('partials.kereta-kata')
    @include('partials.huruf-ngebut')
@endsection