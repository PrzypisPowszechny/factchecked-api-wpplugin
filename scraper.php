<?php

require_once __DIR__ . '/vendor/autoload.php';

use Goutte\Client;

$client = new Client();
$crawler = $client->request('GET', 'https://www.symfony.com/blog/');
$crawler->filter('h2 > a')->each(function ($node) {
    print $node->text()."\n";
});
