import fs from 'fs';
import http from 'http';

console.log('=== 1. VERIFYING public/og-banner.png ===');
const publicExists = fs.existsSync('public/og-banner.png');
console.log('public/og-banner.png exists:', publicExists);

const buf = fs.readFileSync('public/og-banner.png');
const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('Valid PNG signature:', isPng);
console.log('Dimensions:', `${width} x ${height}`);
console.log('File size:', buf.length, 'bytes');

console.log('\n=== 2. VERIFYING out/og-banner.png ===');
const outExists = fs.existsSync('out/og-banner.png');
console.log('out/og-banner.png exists:', outExists);

console.log('\n=== 3. VERIFYING GENERATED HTML METADATA (out/index.html) ===');
const html = fs.readFileSync('out/index.html', 'utf8');

const ogImg = (html.match(/<meta property="og:image"[^>]+>/) || [])[0];
const ogImgWidth = (html.match(/<meta property="og:image:width"[^>]+>/) || [])[0];
const ogImgHeight = (html.match(/<meta property="og:image:height"[^>]+>/) || [])[0];
const ogImgAlt = (html.match(/<meta property="og:image:alt"[^>]+>/) || [])[0];
const twImg = (html.match(/<meta name="twitter:image"[^>]+>/) || [])[0];
const twCard = (html.match(/<meta name="twitter:card"[^>]+>/) || [])[0];
const ogUrl = (html.match(/<meta property="og:url"[^>]+>/) || [])[0];

console.log('og:image:       ', ogImg);
console.log('og:image:width: ', ogImgWidth);
console.log('og:image:height:', ogImgHeight);
console.log('og:image:alt:   ', ogImgAlt);
console.log('twitter:image:  ', twImg);
console.log('twitter:card:   ', twCard);
console.log('og:url (kept):  ', ogUrl);

console.log('\n=== 4. LOCAL HTTP SERVER TEST ===');
// Create a server serving from out directory
const server = http.createServer((req, res) => {
  if (req.url === '/og-banner.png') {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': buf.length,
    });
    res.end(buf);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
});

server.listen(3088, async () => {
  try {
    const bannerRes = await fetch('http://localhost:3088/og-banner.png');
    console.log('/og-banner.png HTTP Status:      ', bannerRes.status);
    console.log('/og-banner.png Content-Type:     ', bannerRes.headers.get('content-type'));
    console.log('/og-banner.png Content-Length:   ', bannerRes.headers.get('content-length'), 'bytes');

    const homeRes = await fetch('http://localhost:3088/');
    const homeHtml = await homeRes.text();
    console.log('Homepage HTTP Status:            ', homeRes.status);
    console.log('Homepage contains correct banner:', homeHtml.includes('https://ayahflow.tech/og-banner.png'));
  } finally {
    server.close();
  }
});
