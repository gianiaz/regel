<?php

namespace Gianiaz;


interface NotifierInterface
{

    public function setConfig(array $config): NotifierInterface;

    public function setSender(string $sender): NotifierInterface;

    public function setTo(array $to): NotifierInterface;

    public function send(string $subject, string $text): bool;

    public function getLogs(): string;

}