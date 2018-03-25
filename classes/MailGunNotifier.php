<?php


namespace Gianiaz;

use Mailgun\Mailgun;

class MailGunNotifier extends AbstractNotifier
{

    public function send(string $subject, string $text): bool
    {

        $mgClient = Mailgun::create($this->config['apiKey']);
        $domain = $this->config['domain'];

        $result = $mgClient->messages()->send($domain, array(
            'from' => $this->sender,
            'to' => implode(';', $this->to),
            'subject' => $subject,
            'text' => $text
        ));

        $this->addLog(print_r($result, true), 'info');

        return true;
    }


}