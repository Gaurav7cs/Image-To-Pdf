const fs = require('fs');

const html = fs.readFileSync('dist/index.html', 'utf8');

console.log('=== VERIFYING ON-PAGE SEO IN dist/index.html ===\n');

// 1. Check title
const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
console.log('Title Tag:', titleMatch ? titleMatch[1] : 'MISSING');

// 2. Check meta description
const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
console.log('Meta Description:', descMatch ? descMatch[1] : 'MISSING');

// 3. Check keywords
const kwMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]+)"/i);
console.log('Meta Keywords:', kwMatch ? kwMatch[1] : 'MISSING');

// 4. Check canonical
const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
console.log('Canonical URL:', canonMatch ? canonMatch[1] : 'MISSING');

// 5. Check Open Graph tags
console.log('\n--- Open Graph Tags ---');
const ogTags = ['og:type', 'og:url', 'og:title', 'og:description', 'og:site_name', 'og:locale', 'og:image', 'og:image:secure_url', 'og:image:type', 'og:image:width', 'og:image:height', 'og:image:alt'];
ogTags.forEach(tag => {
  const match = html.match(new RegExp(`<meta\\s+property="${tag}"\\s+content="([^"]+)"`, 'i'));
  console.log(`${tag}:`, match ? match[1] : 'MISSING');
});

// 6. Check Twitter Card tags
console.log('\n--- Twitter Card Tags ---');
const twTags = ['twitter:card', 'twitter:url', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt'];
twTags.forEach(tag => {
  const match = html.match(new RegExp(`<meta\\s+name="${tag}"\\s+content="([^"]+)"`, 'i'));
  console.log(`${tag}:`, match ? match[1] : 'MISSING');
});

// 7. Check JSON-LD Schemas
console.log('\n--- JSON-LD Schemas ---');
const scriptMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
console.log('Found Schemas Count:', scriptMatches.length);
scriptMatches.forEach((s, idx) => {
  const jsonStr = s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
  try {
    const parsed = JSON.parse(jsonStr);
    console.log(` Schema #${idx + 1} type:`, parsed['@type']);
  } catch (e) {
    console.log(` Schema #${idx + 1} parse error:`, e.message);
  }
});

// 8. Check Target Keywords in HTML text
console.log('\n--- Target Keyword Frequency in Body ---');
const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                 .replace(/<style[\s\S]*?<\/style>/gi, '')
                 .replace(/<[^>]+>/g, ' ')
                 .replace(/\s+/g, ' ');

const targetKeywords = [
  'image to pdf',
  'image to pdf converter',
  'convert image to pdf',
  'how to convert image to pdf',
  'pdf to jpg',
  'image to pdf converter free',
  'image to pdf 200kb',
  'image to pdf maker',
  'image to pdf 100kb',
  'jpg to pdf',
  'merge pdf',
  'pdf resize'
];

targetKeywords.forEach(kw => {
  const count = (text.toLowerCase().match(new RegExp(kw, 'g')) || []).length;
  console.log(`- "${kw}": ${count} mentions`);
});

// 9. SEO Guide Word Count
const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
if (articleMatch) {
  const articleText = articleMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = articleText.split(/\s+/).length;
  console.log('\nSEO Article Word Count:', wordCount, '(Target: >600 words)');
} else {
  console.log('\n<article> tag not found!');
}
