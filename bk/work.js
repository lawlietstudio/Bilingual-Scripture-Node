const fs = require('fs');
const path = require('path');

const parseText = (text) => {
    const lines = text.split('\n');
    const chapters = [];
    let currentChapter = null;
    let currentVerseNumber = 0;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        const chapterMatch = line.match(/^CHAPTER (\d+)/i) || line.match(/^第(\d+)章/);
        const verseMatch = line.match(/^\d+ (.*)$/) || line.match(/^(\d+)([^\d].*)$/);

        if (chapterMatch) {
            currentChapter = { number: chapterMatch[1], verses: [] };
            chapters.push(currentChapter);
        } else if (verseMatch && currentChapter) {
            currentVerseNumber += 1;
            currentChapter.verses.push({ key: `verse${currentVerseNumber}`, text: verseMatch[0].trim() });
        }
    });

    return chapters;
};

const removeLeadingNumbers = (text) => {
    return text.replace(/^\d+\s*/, '');
}

const combineTexts = (englishText, chineseText) => {
    const englishChapters = parseText(englishText);
    const chineseChapters = parseText(chineseText);

    return englishChapters.map((engChapter, index) => {
        const chiChapter = chineseChapters[index];
        return {
            number: engChapter.number,
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

const main = () => {
    const chapterName = "/1-ne/1"

    const englishFilePath = path.join(__dirname, `${chapterName}?lang=eng.txt`);
    const chineseFilePath = path.join(__dirname, `${chapterName}?lang=zho.txt`);

    const englishText = fs.readFileSync(englishFilePath, 'utf8');
    const chineseText = fs.readFileSync(chineseFilePath, 'utf8');

    const combinedChapters = combineTexts(englishText, chineseText);

    const combinedJson = {
        book: {
            en: "The First Book of Nephi",
            zh: "尼腓一書"
        },
        theme: {
            en: "His Reign and Ministry",
            zh: "他的統治與事工"
        },
        introduction: {
            en: englishText.split('\n')[3].trim(),
            zh: chineseText.split('\n')[3].trim()
        },
        chapters: combinedChapters
    };

    fs.writeFileSync(path.join(__dirname, `${chapterName}.json`), JSON.stringify(combinedJson, null, 2), 'utf8');
    console.log(`Combined JSON has been saved as ${chapterName}.json`);
};

main();
