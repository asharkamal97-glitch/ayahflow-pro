import http from 'http';
import fs from 'fs';
import path from 'path';

// 1. Inspect the static built file out/index.html directly
const html = fs.readFileSync('out/index.html', 'utf8');

const ogUrlMatches = html.match(/<meta property="og:url"[^>]+>/g) || [];
const canonicalMatches = html.match(/<link rel="canonical"[^>]+>/g) || [];
const ogImageMatches = html.match(/<meta property="og:image"[^>]+>/g) || [];
const twCardMatches = html.match(/<meta name="twitter:card"[^>]+>/g) || [];
const twImageMatches = html.match(/<meta name="twitter:image"[^>]+>/g) || [];

console.log('=== STEP 1 INSPECTION: RENDERED HTML METADATA ===');
console.log('Actual og:url tag:    ', ogUrlMatches[0] || 'NOT FOUND');
console.log('Actual canonical tag: ', canonicalMatches[0] || 'NOT FOUND');
console.log('Actual og:image tag:  ', ogImageMatches[0] || 'NOT FOUND');
console.log('Actual twitter:card:  ', twCardMatches[0] || 'NOT FOUND');
console.log('Actual twitter:image: ', twImageMatches[0] || 'NOT FOUND');

console.log('\n=== DUPLICATE & CONFLICT CHECKS ===');
console.log('Total og:url tags found:    ', ogUrlMatches.length, ogUrlMatches.length === 1 ? '(No duplicates)' : '(DUPLICATES FOUND!)');
console.log('Total canonical tags found: ', canonicalMatches.length, canonicalMatches.length === 1 ? '(No duplicates)' : '(DUPLICATES FOUND!)');

console.log('\n=== OBSOLETE DOMAIN SEARCH IN RENDERED HTML ===');
console.log('Contains "quranify.pro":    ', html.includes('quranify.pro'));
console.log('Contains "quranify.pro/en": ', html.includes('quranify.pro/en'));
console.log('Contains "/en/":            ', html.includes('/en/'));

// 2. Start a local HTTP server and test a real HTTP GET request to verify the server response
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(3099, async () => {
  try {
    const res = await fetch('http://localhost:3099/');
    const fetchedHtml = await res.text();
    const servedOgUrl = (fetchedHtml.match(/<meta property="og:url"[^>]+>/g) || [])[0];
    const servedCanonical = (fetchedHtml.match(/<link rel="canonical"[^>]+>/g) || [])[0];
    console.log('\n=== LOCAL SERVER HTTP TEST (http://localhost:3099/) ===');
    console.log('HTTP Status:            ', res.status);
    console.log('Live Served og:url:     ', servedOgUrl);
    console.log('Live Served canonical:  ', servedCanonical);
  } finally {
    server.close();
  }
});
