<?php

require_once __DIR__ . '/vendor/autoload.php';

use Goutte\Client;
use GuzzleHttp\Exception\ConnectException;


if ( ! function_exists('write_log')) {
    function write_log ( $log )  {
        if ( is_array( $log ) || is_object( $log ) ) {
            error_log( print_r( $log, true ) );
        } else {
            error_log( $log );
        }
    }
}


function get_located_statement($statement, $url) {
    $strip_chars = 0;
    $statement_length = strlen($statement);
    $content = get_page_content($url);
    while($strip_chars < 5) {
        $statement_candidate = substr($statement,0, $statement_length - $strip_chars);;
        if (is_statement_in_content($statement_candidate, $content)) {
            return $statement_candidate;
        }
        $statement_candidate = substr($statement, $strip_chars);
        if (is_statement_in_content($statement_candidate, $content)) {
            return $statement_candidate;
        }
        $statement_candidate = substr($statement, $strip_chars / 2, $statement_length - $strip_chars / 2);
        if (is_statement_in_content($statement_candidate, $content)) {
            return $statement_candidate;
        }

        $strip_chars++;
    }
    return FALSE;
}


function is_statement_in_content($statement, $content) {
    return strpos(universalizeSpaces($content), universalizeSpaces($statement)) !== FALSE;
}


function get_page_content($url) {
    //write_log('Getting page content');
    $client = new Client();
    // TODO: we should use lower level tool for fetching websites as we lack some low level info
    try {
        $crawler = $client->request('GET', $url);
    } catch (ConnectException $e) {
        throw new URLFetchingException('Unable to connect to the URL, it is either incorrect or was denied');
    } catch (Exception $e) {
        throw new URLFetchingException($e);
    }
    $firstNode = $crawler->getNode(0);
    if (!$firstNode) {
        throw new URLFetchingException('Fetched document has no nodes, it might be incompatible type of site');
    }

    $document = $firstNode->ownerDocument;
    $xpath = new DOMXpath($document);
    foreach ($xpath->evaluate('//script') as $node) {
        $node->parentNode->removeChild($node);
    }

    $scriptlessHtml = $document->saveHtml($document->documentElement);
    return strip_tags($scriptlessHtml);
}


function universalizeSpaces($text) {
    $text = preg_replace( '/\s+/', ' ', $text);
    $text = strtolower($text);

    // delete [ ] brackets containing context provided by editorial team
    $text = trim(preg_replace('/\s*\[[^\]]+\](\s*)/', '$1', $text));
    return $text;
}

class URLFetchingException extends Exception {

}

