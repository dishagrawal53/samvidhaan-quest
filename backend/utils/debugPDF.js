require('dotenv').config();
const fs = require('fs');
const pdfParse = require('pdf-parse');

const PDF_PATH = process.argv[2];

const main = async () => {
  const buffer = fs.readFileSync(PDF_PATH);
  const data = await pdfParse(buffer);
  
  // Show first 3000 characters so we can see the format
  console.log('=== FIRST 3000 CHARS ===');
  console.log(data.text.slice(0, 3000));
  
  console.log('\n=== LINES AROUND "21" ===');
  const lines = data.text.split('\n');
  lines.forEach((line, i) => {
    if (/^\s*2[0-3][\s\.\:]/.test(line) || /article\s+2[0-3]/i.test(line)) {
      console.log(`Line ${i}: [${line}]`);
    }
  });
};

main().catch(console.error);