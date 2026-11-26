<?php

// Semua teks & data halaman beranda ada di sini. Edit file ini, bukan Blade-nya.
return [
    'nama'      => 'Teman Baca',
    'maskot'    => 'Bukibo', // nama maskot di gelembung percakapan
    'judul'     => 'BELAJAR MEMBACA SAMBIL BERMAIN',
    'deskripsi' => 'Teman Baca membantumu mengenal huruf, merangkai kata, dan lancar membaca lewat 4 game seru. Pilih satu game di sebelah kanan, tekan Bermain, lalu kumpulkan hadiahmu!',

    'panduan' => [
        'Pilih salah satu kartu game di halaman utama.',
        'Baca nama dan deskripsi singkatnya.',
        'Tekan tombol Bermain untuk memulai.',
        'Ganti tema terang/gelap kapan saja lewat tombol di pojok atas.',
    ],

    // gambar = nama file di public/assets/img
    // url    = tujuan tombol Bermain:
    //   '#slug'  -> game dibuka sebagai dialog di beranda; slug = Str::slug(nama), dipakai partial (data-game="slug")
    //               contoh: 'Kereta Kata' -> '#kereta-kata' -> partials/kereta-kata.blade.php
    //   '/rute'  -> halaman game tersendiri (lihat routes/web.php)
    // Mengganti 'nama' sebuah game = mengganti slug; sesuaikan selektor data-game di partial-nya.
    'games' => [
        ['nama' => 'Huruf Ngebut',   'gambar' => 'game1.jpg', 'url' => '#huruf-ngebut', 'deskripsi' => 'Lari secepat kilat dan tangkap huruf yang berjatuhan sebelum waktu habis!'],
        ['nama' => 'Duel Tambang',   'gambar' => 'game2.jpg', 'url' => '/duel-tambang', 'deskripsi' => 'Jawab dengan sigap dan benar untuk menarik tali ke arahmu. Siapa cepat, dia menang!'],
        ['nama' => 'Kereta Kata',    'gambar' => 'game3.jpg', 'url' => '#kereta-kata',  'deskripsi' => 'Dengarkan perintahnya, tukar gerbong huruf dan kata sampai tersusun benar, lalu berangkat!'],
        ['nama' => 'Pancing Pintar', 'gambar' => 'game4.jpg', 'url' => '/pancing-pintar', 'deskripsi' => 'Lempar kailmu dan pancing ikan yang membawa huruf tepat untuk membentuk kata.'],
    ],

    // Kalimat maskot di gelembung percakapan (berganti tiap beberapa detik / saat maskot diklik)
    'sapaan' => [
        'Halo, Teman Baca! Siap bermain?',
        'Ayo pilih game favoritmu!',
        'Membaca itu petualangan seru!',
        'Kumpulkan hadiahmu, ya!',
        'Ayo kenali huruf bersamaku!',
    ],

    // ikon = nama ikon di resources/views/components/ikon.blade.php
    // shortcut: status 'terbuka' diisi manual, belum terhubung ke progres pemain; hubungkan saat fitur poin dibuat.
    'hadiah' => [
        ['ikon' => 'medali',  'nama' => 'Lencana Pembaca Cilik', 'syarat' => 'Mainkan 1 game',        'terbuka' => false],
        ['ikon' => 'bintang', 'nama' => 'Bintang Emas',          'syarat' => 'Kumpulkan 10 bintang',  'terbuka' => false],
        ['ikon' => 'piala',   'nama' => 'Piala Juara',           'syarat' => 'Menangkan 5 permainan', 'terbuka' => false],
        ['ikon' => 'hadiah',  'nama' => 'Kotak Misteri',         'syarat' => 'Selesaikan semua game', 'terbuka' => false],
    ],
];