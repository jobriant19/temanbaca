# 🎮 Teman Baca

Website gamifikasi dengan **satu halaman utama tanpa scroll**: header (logo, toggle tema, panduan), maskot + info di kiri, dan **4 kartu game** di kanan. Dibangun dengan **Laravel 13** tanpa npm/Vite, jadi cukup `composer` dan langsung jalan.

## ✨ Fitur
- 🌗 Toggle tema terang/gelap (matahari ↔ bulan), tersimpan di browser
- 📖 Tombol **Panduan** (dialog bawaan browser)
- 🃏 4 kartu game: gambar, nama, deskripsi, tombol **Bermain**
- 📐 Pas satu layar (`100dvh`) di desktop, tablet, HP lanskap; HP potret boleh scroll agar gambar game besar dan jelas

## 🚀 Menjalankan (Laragon, drive D)
```bat
D:
cd D:\temanbaca
php artisan serve
```
Atau buka `http://temanbaca.test` bila virtual host otomatis Laragon aktif.

## 🗂️ Struktur
```
config/gamifikasi.php             ← SEMUA teks & data game (edit di sini)
app/Http/Controllers/BerandaController.php
routes/web.php
resources/views/
  layouts/app.blade.php           ← kerangka HTML
  beranda.blade.php               ← halaman utama
  partials/header.blade.php       ← logo, toggle tema, Panduan
  partials/panduan.blade.php      ← dialog panduan
  components/kartu-game.blade.php ← satu kartu game
  duel-tambang.blade.php          ← game Duel Tambang (setup, arena, podium, popup)
  pancing-pintar.blade.php        ← game Pancing Pintar (setup nama + jenis soal, HUD, panel soal, popup, koleksi)
public/assets/
  css/dasar.css                   ← token warna/tema, latar, kerangka
  css/komponen.css                ← tampilan tiap komponen
  css/duel.css                    ← seluruh gaya Duel Tambang (diawali .duel)
  css/pancing.css                 ← seluruh gaya Pancing Pintar (berdiri sendiri, tidak butuh dasar/komponen.css)
  js/app.js                       ← toggle tema + dialog
  js/duel.js                      ← logika Duel Tambang (bank soal, suara, tarik tali, podium)
  js/pancing.js                   ← logika Pancing Pintar (data ikan & soal, scene Three.js, mic, fase game)
  img/                            ← logo.png, mascot.png, game1-4.jpg
```

## 🛠️ Perawatan
| Ingin mengubah… | Edit… |
|---|---|
| Judul, deskripsi, info, langkah panduan | `config/gamifikasi.php` |
| Nama/gambar/deskripsi game | `config/gamifikasi.php` → `games` |
| Link tombol **Bermain** | isi `url`, mis. `/snake` atau `route('snake')` |
| Warna & tema | variabel di `public/assets/css/dasar.css` |
| Gambar | timpa file di `public/assets/img/` (nama sama) |
| Tambah/ubah soal huruf & kata | `HURUF` dan `KATA` di atas `public/assets/js/duel.js` |
| Jarak tarik tali / ukuran maskot | `±30vw` di `.tim` dan `.lantai` (`duel.css`), harus sama; ukuran lewat `--u` di `.duel` |
| Tambah/ubah jenis ikan & kelangkaan (Pancing Pintar) | `IKAN` dan `KELAS` di atas `pancing.js` (warna, ukuran, bentuk badan, peluang) |
| Kata/huruf soal Pancing Pintar, waktu menjawab | `KATA`, `HURUF`, `WAKTU_SOAL` di atas `pancing.js` |

> Menambah game kelima? Tambah satu item di `games`, lalu ubah grid `.daftar-game` agar tetap muat satu layar.

## 🖼️ Aset yang dibutuhkan
Letakkan di `public/assets/img/`: `logo.png`, `mascot.png`, `game1.jpg` … `game4.jpg` (sudah dipangkas ruang putihnya).