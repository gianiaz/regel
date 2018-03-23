#! /usr/local/bin/php
<?php
require 'vendor/autoload.php';

/** SCRIPT CONFIG - start **/
/** @var string $env [develop|prod] */
$env = 'develop';
/** @var bool $debug */
$debug = true;
/** @var bool $enablePushNotifications */
$enablePushNotifications = true;
/** @var bool $enableMailNotifications */
$enableMailNotifications = true;
/** @var array $mailNotificationSubscribers */
$mailNotificationSubscribers = ['gianiaz@gmail.com', 'stefypata77@gmail.com'];
/** SCRIPT CONFIG - end **/
$config = json_decode(file_get_contents('config.' . $env . '.json'), true);
$messageFolder = __DIR__ . '/messages';
!is_dir($messageFolder) && !mkdir($messageFolder, 0755, true) && !is_dir($messageFolder);

$files = glob($messageFolder . '/*.queue');

foreach ($files as $file) {
    $message = json_decode(file_get_contents($file), true);
    if ($enablePushNotifications) {
        $notifier = new \Gianiaz\PushNotifier();

        $notifier->setConfig($config['pushed'])->send($message['oggetto'], $message['data'] . ': ' . $message['author']);
    }

    if ($enableMailNotifications) {

        $notifier = new \Gianiaz\MailNotifier();

        $notifier->setConfig($config['mailgun'])
            ->setSender('gianiaz@gianiaz.net')
            ->setTo($mailNotificationSubscribers)
            ->send($message['oggetto'], $message['data'] . ': ' . $message['author']);

    }

    rename($file, str_replace('.queue', '.sent', $file));
}
