<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\BerandaController;

Route::get('/', BerandaController::class);
Route::get('/duel-tambang', fn () => view('duel-tambang', ['nama' => config('gamifikasi.nama')]))->name('duel-tambang');
Route::get('/pancing-pintar', fn () => view('pancing-pintar', ['nama' => config('gamifikasi.nama')]))->name('pancing-pintar');
