const fs = require('fs');
const path = require('path');

// Read the content of the text file
const filePath = 'cut/books copy.txt';
const content = fs.readFileSync(filePath, 'utf-8');

// Split the content by lines
const lines = content.split('\n');

// Initialize variables to keep track of current book and chapter
let currentBook = '';
let currentChapter = '';
let chapterLines = [];
var isInsertedTitle = false;
var charpter = '';

// Function to write chapter to file
const writeChapterToFile = (book, chapter, lines) => {
  const folderPath = path.join(__dirname, book);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  const fileName = `${chapter}_zho.txt`;
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, lines.join('\n'));
};

lines.forEach(line => {
  const bookMatch = line.match(/^(Ge|Exo) \d+:\d+/);
  if (bookMatch) {
    const [book, chapterVerse] = bookMatch[0].split(' ');
    const chapter = chapterVerse.split(':')[0];
    if (currentBook && currentChapter && (currentBook !== book || currentChapter !== chapter)) {
      writeChapterToFile(currentBook, currentChapter, chapterLines);
      chapterLines = [];
    }
    currentBook = book;
    currentChapter = chapter;
  }
  if (currentBook) {

    const verseMatch = line.match(/^(Ge|Exo) (\d+:\d+) [^ ]+ (\d+:\d+) (.+)$/);
    if (verseMatch) {
      var newCharpter = verseMatch[3].split(':')[0];
      if (charpter != newCharpter) {
        isInsertedTitle = false;
        charpter = newCharpter;
      }

      if (!isInsertedTitle) {
        if (charpter == '1') {
          chapterLines.push(`${verseMatch[0].split(" ")[2]}\n`);
          chapterLines.push(`${verseMatch[0].split(" ")[2]}`);
        } else {
          chapterLines.push(`\n`);
        }
        
        chapterLines.push(`第${verseMatch[3].split(':')[0]}章`);
        chapterLines.push(`${verseMatch[0].split(" ")[2]}\n`);
        isInsertedTitle = true;
      }
      const verseNumber = verseMatch[3].split(':')[1]; // Extracts the verse number after the colon
      const verseText = verseMatch[4].trim();
      chapterLines.push(`${verseNumber}${verseText}`);
    }
    // chapterLines.push(line);
  }
});

// Write the last chapter
if (currentBook && currentChapter) {
  writeChapterToFile(currentBook, currentChapter, chapterLines);
}

console.log('Chapters have been separated into individual files.');
