# Base image PHP 8.2 CLI
FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions required by Laravel
RUN docker-php-ext-install pdo_mysql mbstring zip gd

# Copy Composer binary from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory inside container
WORKDIR /var/www/html

# Copy dependency files first for better build caching
COPY composer.json composer.lock ./

# Install dependencies (ignoring platform reqs for local dev flexibility)
RUN composer install --ignore-platform-reqs --no-scripts --no-autoloader

# Copy the entire backend codebase
COPY . .

# Run composer autoloader optimization
RUN composer dump-autoload --optimize

# Expose Laravel default port
EXPOSE 8000
