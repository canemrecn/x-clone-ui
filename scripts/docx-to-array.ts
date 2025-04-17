import fs from 'fs';
import path from 'path';

function csvToArray(csvPath: string): string[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  return content
    .split(/\r?\n/)
    .map(word => word.trim())
    .filter(word => word.length > 0);
}

function writeToFile(words: string[], outputPath: string) {
  const content = `export const customEnglishWords = ${JSON.stringify(words, null, 2)};\n`;
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log('✅ customEnglishWords.ts başarıyla oluşturuldu!');
}

const csvPath = path.join(__dirname, '..', 'Z Words(in).csv');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'customEnglishWords.ts');

const wordsArray = csvToArray(csvPath);
writeToFile(wordsArray, outputPath);
