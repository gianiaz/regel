<?php


namespace Gianiaz;


abstract class AbstractNotifier implements NotifierInterface
{

    protected $config;
    protected $sender;
    protected $to;
    protected $logs = [];

    public function setConfig(array $config): NotifierInterface
    {
        $this->config = $config;

        return $this;
    }

    public function setSender(string $sender): NotifierInterface
    {
        $this->sender = $sender;

        return $this;
    }

    public function setTo(array $to): NotifierInterface
    {
        $this->to = $to;

        return $this;
    }

    protected function addLog(string $msg, string $severity): void
    {
        // TODO: Implement addLog() method.
    }

    public function getLogs(): string
    {
        // TODO: Implement getLogs() method.
    }


}