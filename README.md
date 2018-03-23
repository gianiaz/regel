# REGEL NOTIFIER

## PRE

In the province I live we use an electronic platform for school-family communication that is very ugly.
One of the main feature it lacks is a notification system.

I don't know why this system lacks of one of the basic feature of every communication platform born after 1995.
I would like to receive an email or an sms when a new communication from the school is inserted.
Apparently this requires to hire some genius, and there are not the resource to make this new fantastic feature.
I've called so many times to complain about this, but the answer is always "You have to login daily to check for new messages".

After I've left my 5 years old daughter to the school when it was closed for a union meeting I've decidet to write this ugly piece of code. 

I'm a programmer and I hate repetitive task.

## UGLY CODE

I wrote this code in some spare time and it's not well organized, but it does what I want.

## THE IDEA

I have a username and a password and I can access to the web interface.
Let's demand this work to a spider, and then send some sort of notification.

## SPIDER
It uses phantomjs to log in automatically to the regel platform.
It uses an history.json file to store ids of already downloaded communications.
After verifying that a communication wasn't already downloaded it writes a file .queue in messages directory. 

## NOTIFIER

The notifier is a php-cli executable, when called it cycle content in messages directory an watches for files .queue to read.
Every .queue file is then notified by mail and via pushed app. 
When the message is notified the file is renamed in .sent and will be ignored in the future. 
The idea is to send a push notification to a phone and a fallback email using mailgun.

### PUSH NOTIFICATION

For sending push notification I've used the service (pushed.co)[https://pushed.co] (thank you Patrick for pointing me to this service).
They have a simple api called via CURL.

### EMAIL NOTIFICATION

I use mailgun for a while and it's a reliable service for my use. They have a simple api called via CURL.

## DOCKER 

This is some sort of experiment to develop in a pc without a development environment. 