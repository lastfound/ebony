<?php
require 'vendor/autoload.php';

use Minishlink\WebPush\VAPID;

$keys = VAPID::createVapidKeys();

$backendEnv = file_get_contents('.env');
if (strpos($backendEnv, 'VAPID_PUBLIC_KEY') === false) {
    $backendEnv .= "\n\nVAPID_SUBJECT=mailto:admin@ebonycafe.com\n";
    $backendEnv .= "VAPID_PUBLIC_KEY=" . $keys['publicKey'] . "\n";
    $backendEnv .= "VAPID_PRIVATE_KEY=" . $keys['privateKey'] . "\n";
    file_put_contents('.env', $backendEnv);
    echo "Added to Backend .env\n";
} else {
    echo "Already in Backend .env\n";
}

$frontendEnvFile = '../frontend/.env';
$frontendEnv = file_exists($frontendEnvFile) ? file_get_contents($frontendEnvFile) : '';
if (strpos($frontendEnv, 'VITE_VAPID_PUBLIC_KEY') === false) {
    $frontendEnv .= "\nVITE_VAPID_PUBLIC_KEY=" . $keys['publicKey'] . "\n";
    file_put_contents($frontendEnvFile, $frontendEnv);
    echo "Added to Frontend .env\n";
} else {
    echo "Already in Frontend .env\n";
}
