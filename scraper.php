<?php

require_once __DIR__ . '/vendor/autoload.php';

use Goutte\Client;
use GuzzleHttp\Exception\ConnectException;


if (!function_exists('write_log')) {
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
    return strpos(universalizeSpaces($content), universalizeSpaces($statement, TRUE)) !== FALSE;
}


function get_page_content($url) {
    // write_log('Getting page content');
    $client = new Client();
    // TODO: we should use lower level tool for fetching websites as we lack some low level info
    try {
        $crawler = $client->request('GET', $url, [
            'connect_timeout' => 10.0, 'read_timeout' => 10.0, 'timeout' => 10.0
        ]);
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


function universalizeSpaces($text, $remove_brackets = FALSE) {
    // Some texts (http responses) happen to be very big, so truncate them and preg_replace using buffering.
    $BUF_SIZE = 100000; // 100KB
    $MAX_TEXT_SIZE = 2 * 1000 * 1000; // 2MB
    $text = substr($text, 0, $MAX_TEXT_SIZE);
    $new_text = '';
    for($i = 0; $i < strlen($text); $i += $BUF_SIZE) {
        $part = substr($text, $i, $BUF_SIZE);
        $part = preg_replace( '/\s+/', ' ', $part);
        $new_text .= $part;
    }
    $text = $new_text;
    // Now, no big replaces, so we can run it safely
    $text = preg_replace( '/\s+/', ' ', $text);

    $text = strtolower($text);

    if ($remove_brackets) {
        // delete [ ] brackets containing context provided by editorial team
        $text = trim(preg_replace('/\s*\[[^\]]+\](\s*)/', '$1', $text));
    }
    return $text;
}

class URLFetchingException extends Exception {

}

