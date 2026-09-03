const fs = require('fs');

const pages = [
  'dist/about/index.html',
  'dist/privacy/index.html',
  'dist/terms/index.html',
  'dist/contact/index.html'
];

console.log('=== VERIFYING NEW MPA PAGES ===\n');

pages.forEach(p => {
  if (!fs.existsSync(p)) {
    console.error(`MISSING FILE: ${p}`);
    return;
  }
  const html = fs.readFileSync(p, 'utf8');
  const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1];
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) || [])[1];
  const canon = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1];
  const schemaMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
  
  console.log(`PAGE: ${p}`);
  console.log(`- Title: ${title}`);
  console.log(`- Canonical: ${canon}`);
  console.log(`- Meta Description: ${desc ? desc.substring(0, 70) + '...' : 'NONE'}`);
  console.log(`- Schemas Count: ${schemaMatches.length}`);
  schemaMatches.forEach((s, idx) => {
    const raw = s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
    try {
      const parsed = JSON.parse(raw);
      console.log(`    Schema #${idx+1}: ${parsed['@type']}`);
    } catch (e) {
      console.log(`    Schema #${idx+1} parse error: ${e.message}`);
    }
  });
  console.log(`- HTML Size: ${(html.length / 1024).toFixed(1)} KB\n`);
});

// Verify Homepage links
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
console.log('=== VERIFYING HOMEPAGE VISIBILITY OF THE 4 PAGES ===\n');
const targets = [
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'About Us', path: '/about' },
  { name: 'Terms & Conditions', path: '/terms' },
  { name: 'Contact Us', path: '/contact' }
];

targets.forEach(t => {
  const occurrences = (indexHtml.match(new RegExp(`href="${t.path}"`, 'g')) || []).length;
  console.log(`- "${t.name}" (${t.path}): ${occurrences} links found on home page`);
});
