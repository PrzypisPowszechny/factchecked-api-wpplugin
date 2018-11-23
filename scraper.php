<?php

require_once __DIR__ . '/vendor/autoload.php';

use Goutte\Client;

function universalizeSpaces($text) {
    return preg_replace( '/\s+/', ' ', $text);
}

$quote = universalizeSpaces("Mamy około 250 wójtów, burmistrzów, prezydentów z listy Polskiego Stronnictwa");

$url = 'https://www.rmf24.pl/tylko-w-rmf24/poranna-rozmowa/news-kosiniak-kamysz-samorzady-powinny-miec-wiekszy-udzial-w-vat,nId,2632608';

$client = new Client();
$crawler = $client->request('GET', $url);
$document = $crawler->getNode(0)->ownerDocument;

$xpath = new DOMXpath($document);
foreach ($xpath->evaluate('//script') as $node) {
    $node->parentNode->removeChild($node);
}

$scriptlessHtml = $document->saveHtml($document->documentElement);
$pureText = strip_tags($scriptlessHtml);

$universalText = universalizeSpaces($pureText);


$located = strpos($universalText, $quote);

if ($located === FALSE) {
    print 'NO';
} else {
    print 'YES';
}
print "\n";
