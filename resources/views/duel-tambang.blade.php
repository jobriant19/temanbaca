@extends('layouts.app')

@section('judul', 'Duel Tambang')

@section('isi')
    <link rel="stylesheet" href="{{ asset('assets/css/duel.css') }}">

    {{-- Pengaturan dibuat di popup beranda (partials/duel-dialog); halaman ini langsung memuat arena. --}}
    <div class="duel" id="duel" data-beranda="{{ url('/') }}">
        <section id="main" class="main">
            <div class="hud">
                <div class="hud__sisi">
                    <button type="button" class="ib" id="kembali" aria-label="Keluar ke beranda">
                        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14.5 5-7 7 7 7"/></svg>
                    </button>
                    <span class="pil k" id="sk"></span>
                </div>
                <div class="info"><span id="info"></span><i><b id="bar"></b></i></div>
                <div class="hud__sisi">
                    <span class="pil r" id="sr"></span>
                    <button type="button" class="ib" id="bisu" aria-label="Suara">
                        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.2 5.8a9 9 0 0 1 0 12.4"/></svg>
                    </button>
                </div>
            </div>

            <div class="arena" id="arena">
                <div class="label" id="label"></div>
                <div class="dk" id="konfeti" aria-hidden="true"></div>
                <div class="akhir" id="akhir" hidden>
                    <div><span class="juara-ik" id="juaraIk"></span><h2 id="juara"></h2><p id="skorAkhir"></p></div>
                    <div class="aksi">
                        <button type="button" id="lagi" class="tombol tombol--main">
                            <span class="tombol__ikon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/></svg></span>Main lagi
                        </button>
                        <a class="tombol tombol--kaca" href="{{ url('/') }}">
                            <span class="tombol__ikon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5M6.5 10v9h11v-9"/></svg></span>Beranda
                        </a>
                    </div>
                </div>
            </div>

            <div class="panel" id="panel">
                <div class="giliran" id="giliran"></div>
                <div class="soal">
                    <div class="kartu-soal">
                        <span class="jenis" id="tJenis"></span>
                        <div class="besar" id="tBesar"></div>
                        <button type="button" class="suara" id="ulang" aria-label="Dengarkan soal lagi">
                            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.2 5.8a9 9 0 0 1 0 12.4"/></svg></span>Dengarkan
                        </button>
                    </div>
                    <div class="soal__kanan">
                        <div class="tanya"><p id="tTeks"></p><small id="tSub"></small></div>
                        <div class="opsi" id="opsi"></div>
                    </div>
                </div>
            </div>
        </section>

        {{-- Konfirmasi keluar permainan --}}
        <dialog id="dlgKeluar" class="dialog dialog--panduan dd-awas" aria-labelledby="dkJudul">
            <div class="panduan__kepala">
                <span class="panduan__logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10M15 8l4 4-4 4M19 12H9"/></svg></span>
                <div><h2 id="dkJudul">Keluar dari permainan?</h2></div>
            </div>
            <div class="panduan__isi">
                <p>Skor pertandingan ini akan hilang kalau kamu keluar sekarang.</p>
                <div class="dd-aksi">
                    <button type="button" class="dd-batal" id="keluarBatal">Lanjut main</button>
                    <button type="button" class="tombol tombol--main panduan__ok" id="keluarYa"><span class="tombol__ikon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10M15 8l4 4-4 4M19 12H9"/></svg></span>Keluar</button>
                </div>
            </div>
        </dialog>
    </div>

    {{-- Three.js dari CDN. Offline? unduh three.min.js (r128) ke public/assets/js/ lalu ganti src dengan asset('assets/js/three.min.js') --}}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="{{ asset('assets/js/duel.js') }}" defer></script>
@endsection