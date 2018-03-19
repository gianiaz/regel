FROM php:7.1-cli-alpine

MAINTAINER Giovanni Battista Lenoci <gianiaz@gmail.com>

USER root
RUN apk --no-cache add \
    nano \
    sudo \
    vim \
    wget \
    git \
    netcat-openbsd \
    openssh-client \
    openssl-dev \
    vim \
    zlib-dev \
    zsh


RUN apk add --no-cache --virtual .xdebug-build-deps $PHPIZE_DEPS \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && apk del .xdebug-build-deps \
    && pecl clear-cache \
    && docker-php-source delete

COPY conf/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

WORKDIR /var/www/regel

 ## Utente non-root (no sudo)
RUN adduser -D -u 1000 giovanni -G www-data -h /home/giovanni \
    && chown -R giovanni /var/www/regel \
 ## Composer and accounts
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/regel

USER giovanni

 ## ZSH / OhMyZsh
COPY --chown=giovanni:www-data zsh/install-zsh.sh /home/giovanni/install-zsh.sh
RUN chmod +x /home/giovanni/install-zsh.sh \
    && /home/giovanni/install-zsh.sh
COPY zsh/zsh-config.sh /home/giovanni/.zshrc
ENV TERM xterm-256color
