<?php

// Vercel hanya mengizinkan tulis ke /tmp, jadi storage Laravel dialihkan ke sana
$storage = '/tmp/storage';

foreach ([
    'app/public',
    'framework/cache/data',
    'framework/sessions',
    'framework/views',
    'logs',
] as $dir) {
    if (!is_dir("$storage/$dir")) {
        mkdir("$storage/$dir", 0755, true);
    }
}

$_ENV['LARAVEL_STORAGE_PATH'] = $storage;
putenv("LARAVEL_STORAGE_PATH=$storage");

require __DIR__ . '/../public/index.php';