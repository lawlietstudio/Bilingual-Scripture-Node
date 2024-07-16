const fs = require('fs');
const path = require('path');

// Read the content of the text file
const filePath = 'cut/books.txt';
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
  const folderPath = path.join(__dirname, `bible/${book}`);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  const fileName = `${chapter}_zho.txt`;
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, lines.join('\n'));
};

lines.forEach(line => {
  // (Josh|Jdgs|Ruth|1Sm|2Sm|1Ki|2Ki|1Chr|2Chr|Ezra|Neh|Est|Job|Psa|Prv|Eccl|SSol|Isa|Jer|Lam|Eze|Dan|Hos|Joel|Amos|Obad|Jonah|Mic|Nahum|Hab|Zep|Hag|Zec|Mal)
  const bookMatch = line.match(/^(Mat|Mark|Luke|John|Acts|Rom|1Cor|2Cor|Gal|Eph|Phi|Col|1Th|2Th|1Tim|2Tim|Titus|Phmn|Heb|Jas|1Pet|2Pet|1Jn|2Jn|3Jn|Jude|Rev) \d+:\d+/);
  // const bookMatch = line.match(/^(Mat) \d+:\d+/);

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
    // Ge|Exo
// Josh
    const verseMatch = line.match(/^(Mat|Mark|Luke|John|Acts|Rom|1Cor|2Cor|Gal|Eph|Phi|Col|1Th|2Th|1Tim|2Tim|Titus|Phmn|Heb|Jas|1Pet|2Pet|1Jn|2Jn|3Jn|Jude|Rev) (\d+:\d+) [^ ]+ (\d+:\d+) (.+)$/);
    if (verseMatch) {
      var newCharpter = verseMatch[3].split(':')[0];
      if (charpter != newCharpter) {
        isInsertedTitle = false;
        charpter = newCharpter;
      }

      if (!isInsertedTitle) {
        if (charpter == '1') {
          chapterLines.push(`${verseMatch[0].split(" ")[2]}\n`);
          // chapterLines.push(`${verseMatch[0].split(" ")[2]}`);
        } else {
          chapterLines.push(`\n`);
        }
        
        chapterLines.push(`第${verseMatch[3].split(':')[0]}章`);

        // chapterLines.push(`${verseMatch[0].split(" ")[2]}\n`);
        chapterLines.push(`\n\n\n`);
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
