#! /usr/local/bin/php
<?php
/** SCRIPT CONFIG - start **/
/** @var string $env [develop|prod] */
$env = 'develop';
/** @var bool $debug */
$debug = true;
/** SCRIPT CONFIG - end **/


$config = json_decode(file_get_contents('config.' . $env . '.json'), true);

$dirMessages = __DIR__ . '/messages';

if (!file_exists($dirMessages)) {
    mkdir($dirMessages, 0755, true);
}

$files = glob($dirMessages . '/*.queue');

foreach ($files as $file) {
    $message = file_get_contents($file);
    sendNotification($message, $config['pushed']);
    rename($file, str_replace('.queue', '.sent', $file));
    break;
}


function sendNotification($message, $config)
{
    curl_setopt_array($ch = curl_init(), array(
        CURLOPT_URL => "https://api.pushed.co/1/push",
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => [
            'app_key' => $config['app_key'],
            'app_secret' => $config['app_secret'],
            'target_type' => $config['target_type'],
            'content' => $message
        ],
        CURLOPT_SAFE_UPLOAD => true,
        CURLOPT_RETURNTRANSFER => true
    ));
    curl_exec($ch);
    curl_close($ch);
}