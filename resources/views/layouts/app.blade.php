<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('judul', $nama)</title>
    {{-- Dijalankan sebelum render agar tidak berkedip saat memuat tema tersimpan --}}
    <script>try{document.documentElement.dataset.tema=localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme: dark)').matches?'gelap':'terang')}catch(e){document.documentElement.dataset.tema='terang'}</script>
    <link rel="stylesheet" href="{{ asset('assets/css/dasar.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/komponen.css') }}">
    @stack('css')
</head>
<body>
    <div class="latar" aria-hidden="true">
        <div class="langit">
            <i class="matahari"></i><i class="bulan"></i>
            <div class="bintang-lapis"><i class="meteor meteor--1"></i><i class="meteor meteor--2"></i></div>
            <i class="awan awan--1"></i><i class="awan awan--2"></i><i class="awan awan--3"></i><i class="awan awan--4"></i>
            <i class="burung burung--1"></i><i class="burung burung--2"></i>
        </div>
        <i class="bukit bukit--a"></i><i class="bukit bukit--b"></i><i class="bukit bukit--c"></i>
    </div>
    @yield('isi')
    <script src="{{ asset('assets/js/app.js') }}" defer></script>
    @stack('js')
</body>
</html>
