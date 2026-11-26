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

// Cache bootstrap Laravel juga harus di /tmp (folder proyek read-only)
foreach ([
    'APP_PACKAGES_CACHE' => '/tmp/packages.php',
    'APP_SERVICES_CACHE' => '/tmp/services.php',
    'APP_CONFIG_CACHE'   => '/tmp/config.php',
    'APP_ROUTES_CACHE'   => '/tmp/routes.php',
    'APP_EVENTS_CACHE'   => '/tmp/events.php',
] as $key => $path) {
    $_ENV[$key] = $path;
    putenv("$key=$path");
}

require __DIR__ . '/../public/index.php';