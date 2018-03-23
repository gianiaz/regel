<?php


namespace Gianiaz;


class PushNotifier extends AbstractNotifier
{

    public function send(string $subject, string $text): bool
    {

        curl_setopt_array($ch = curl_init(), array(
            CURLOPT_URL => "https://api.pushed.co/1/push",
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => [
                'app_key' => $this->config['app_key'],
                'app_secret' => $this->config['app_secret'],
                'target_type' => $this->config['target_type'],
                'content' => $text. "\n" . $subject
            ],
            CURLOPT_SAFE_UPLOAD => true,
            CURLOPT_RETURNTRANSFER => true
        ));
        curl_exec($ch);
        curl_close($ch);

        return true;
    }


}