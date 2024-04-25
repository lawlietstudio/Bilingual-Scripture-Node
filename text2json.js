const fs = require('fs');
const path = require('path');

const parseText = (text) => {
    const lines = text.split('\n');
    const chapters = [];
    let currentChapter = null;
    let currentVerseNumber = 0;
    let introCapture = false;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // const chapterMatch = line.match(/^Section (\d+)/i) || line.match(/^第(\d+)篇/);
        const chapterMatch = line.match(/^Chapitre (\d+)/i) || line.match(/^CHAPTER (\d+)/i) || line.match(/^第(\d+)章/);
        const verseMatch = line.match(/^\d+ (.*)$/) || line.match(/^(\d+)([^\d].*)$/);

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
            currentChapter.verses.push({ key: `${currentVerseNumber}`, text: verseMatch[0].trim() });
        }
    });

    return chapters;
};

const removeLeadingNumbers = (text) => {
    return text.replace(/^\d+\s*/, '');
}

const combineTexts = (frenchChapters, englishChapters, chineseChapters) => {
    return englishChapters.map(engChapter => {
        const chiChapter = chineseChapters.find(ch => ch.number === engChapter.number);
        const fraChapter = frenchChapters.find(fr => fr.number === engChapter.number);
        return {
            number: engChapter.number,
            introduction: {
                fr: fraChapter.introduction,
                en: engChapter.introduction,
                zh: chiChapter.introduction
            },
            verses: engChapter.verses.map((verse, verseIndex) => ({
                key: verse.key,
                text: {
                    fr: removeLeadingNumbers(fraChapter.verses[verseIndex].text),
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
    const mainFolderName = "bofm"
    const folderNames = ["1-ne", "2-ne", "3-ne", "4-ne", "alma", "enos", "ether", "hel", "jacob", "jarom", "morm", "moro", "mosiah", "omni", "w-of-m"]
    // const folderName = "1-ne"
    for (folderName of folderNames) {
        const dirPath = path.join(__dirname, `${mainFolderName}/${folderName}`);
        const files = fs.readdirSync(dirPath);
        const frenchFiles = files.filter(file => file.includes('fra')).sort();
        const englishFiles = files.filter(file => file.includes('eng')).sort();
        const chineseFiles = files.filter(file => file.includes('zho')).sort();

        let allFrenchChapters = [];
        let allEnglishChapters = [];
        let allChineseChapters = [];

        frenchFiles.forEach(file => {
            const filePath = path.join(dirPath, file);
            const text = fs.readFileSync(filePath, 'utf8');
            allFrenchChapters = allFrenchChapters.concat(parseText(text));
        });

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

        const combinedChapters = combineTexts(allFrenchChapters, allEnglishChapters, allChineseChapters);
        const sortedCombinedChapters = sortChapters(combinedChapters);

        // Explicitly find the first chapter files
        const firstFrenchChapterFile = frenchFiles.find(file => file.startsWith('1_'));
        const firstEnglishChapterFile = englishFiles.find(file => file.startsWith('1_'));
        const firstChineseChapterFile = chineseFiles.find(file => file.startsWith('1_'));

        const firstFrenchText = fs.readFileSync(path.join(dirPath, firstFrenchChapterFile), 'utf8');
        const firstEnglishText = fs.readFileSync(path.join(dirPath, firstEnglishChapterFile), 'utf8');
        const firstChineseText = fs.readFileSync(path.join(dirPath, firstChineseChapterFile), 'utf8');

        const frenchDetails = extractBookDetails(firstFrenchText);
        const englishDetails = extractBookDetails(firstEnglishText);
        const chineseDetails = extractBookDetails(firstChineseText);

        const combinedJson = {
            book: {
                fr: frenchDetails.book,
                en: englishDetails.book,
                zh: chineseDetails.book
            },
            theme: {
                fr: frenchDetails.theme,
                en: englishDetails.theme,
                zh: chineseDetails.theme
            },
            introduction: {
                fr: frenchDetails.introduction,
                en: englishDetails.introduction,
                zh: chineseDetails.introduction
            },
            chapters: sortedCombinedChapters
        };

        fs.writeFileSync(path.join(__dirname, `${mainFolderName}/${folderName}/${folderName}.json`), JSON.stringify(combinedJson, null, 2), 'utf8');
        console.log(`Combined JSON has been saved as ${folderName}.json`);
    }
};

main();
