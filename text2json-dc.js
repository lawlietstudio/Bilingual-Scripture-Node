const fs = require('fs');
const path = require('path');

const parseText = (text) => {
    const lines = text.split('\n');
    const chapters = [];
    let currentChapter = null;
    let currentVerseNumber = 0;
    let introCapture = false;
    var lineNumber = 0

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        const chapterMatch = line.match(/^Section (\d+)/i) || line.match(/^第(\d+)篇/);
        // const chapterMatch = line.match(/^CHAPTER (\d+)/i) || line.match(/^第(\d+)章/);
        var verseMatch = null;
        if  (lineNumber > 6) { verseMatch = (line.match(/^\d+ (.*)$/) || line.match(/^(\d+)([^\d].*)$/)); }

        if (chapterMatch) {
            currentChapter = { number: parseInt(chapterMatch[1], 10), verses: [], introduction: "" };
            chapters.push(currentChapter);
            currentVerseNumber = 0; // Reset verse number for each chapter
            introCapture = true; // Start capturing introduction text
        } else if (introCapture && !verseMatch) {
            currentChapter.introduction = line; // Capture introduction line
            introCapture = false; // Stop capturing after the first line following chapter title
        } else if (verseMatch && currentChapter) {
            currentVerseNumber += 1;
            currentChapter.verses.push({ key: `verse ${currentVerseNumber}`, text: verseMatch[0].trim() });
        }
        lineNumber++
    });

    return chapters;
};

const removeLeadingNumbers = (text) => {
    return text.replace(/^\d+\s*/, '');
}

const combineTexts = (englishChapters, chineseChapters) => {
    return englishChapters.map(engChapter => {
        const chiChapter = chineseChapters.find(ch => ch.number === engChapter.number);
        return {
            number: engChapter.number,
            introduction: {
                en: engChapter.introduction,
                zh: chiChapter.introduction
            },
            verses: engChapter.verses.map((verse, verseIndex) => ({
                key: verse.key,
                text: {
                    en: removeLeadingNumbers(verse.text),
                    zh: removeLeadingNumbers(chiChapter.verses[verseIndex].text)
                }
            }))
        };
    });
};

const sortChapters = (chapters) => {
    return chapters.sort((a, b) => a.number - b.number);
};

const extractBookDetails = (text) => {
    const lines = text.split('\n').map(line => line.trim());
    const book = lines[0];
    const theme = lines.length > 3 ? lines[2] : "";
    const introduction = lines.length > 3 ? lines[3] : lines[2];

    return { book, theme, introduction };
};

const main = () => {
    const folderName = "dc"
    const dirPath = path.join(__dirname, `dc-testament/${folderName}`);
    const files = fs.readdirSync(dirPath);
    const englishFiles = files.filter(file => file.includes('eng')).sort();
    const chineseFiles = files.filter(file => file.includes('zho')).sort();

    let allEnglishChapters = [];
    let allChineseChapters = [];

    englishFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        const text = fs.readFileSync(filePath, 'utf8');
        allEnglishChapters = allEnglishChapters.concat(parseText(text));
    });

    chineseFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        const text = fs.readFileSync(filePath, 'utf8');
        allChineseChapters = allChineseChapters.concat(parseText(text));
    });

    const combinedChapters = combineTexts(allEnglishChapters, allChineseChapters);
    const sortedCombinedChapters = sortChapters(combinedChapters);

    // Explicitly find the first chapter files
    const firstEnglishChapterFile = englishFiles.find(file => file.startsWith('1_'));
    const firstChineseChapterFile = chineseFiles.find(file => file.startsWith('1_'));

    const firstEnglishText = fs.readFileSync(path.join(dirPath, firstEnglishChapterFile), 'utf8');
    const firstChineseText = fs.readFileSync(path.join(dirPath, firstChineseChapterFile), 'utf8');

    const englishDetails = extractBookDetails(firstEnglishText);
    const chineseDetails = extractBookDetails(firstChineseText);

    const combinedJson = {
        book: {
            en: englishDetails.book,
            zh: chineseDetails.book
        },
        theme: {
            en: englishDetails.theme,
            zh: chineseDetails.theme
        },
        introduction: {
            en: englishDetails.introduction,
            zh: chineseDetails.introduction
        },
        chapters: sortedCombinedChapters
    };

    fs.writeFileSync(path.join(__dirname, `dc-testament/${folderName}/${folderName}.json`), JSON.stringify(combinedJson, null, 2), 'utf8');
    console.log(`Combined JSON has been saved as ${folderName}.json`);
};

main();
