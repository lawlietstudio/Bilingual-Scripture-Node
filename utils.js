// utils.js
const fs = require('fs');
const path = require('path');

const parseText = (text, mode) => {
    const lines = text.split('\n');
    const chapters = [];
    let currentChapter = null;
    let currentVerseNumber = 0;
    let introCapture = false;
    let summaryCapture = false;
    var lineNumber = 0

    if (mode == "chapters") {
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // const chapterMatch = line.match(/^Section (\d+)/i) || line.match(/^第(\d+)篇/);
            const chapterMatch = line.match(/^Chapitre (\d+)/i) || line.match(/^CHAPTER (\d+)/i) || line.match(/^第(\d+)章/) || line.match(/^제 (\d+) 장/);
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
    } else if (mode == "sections") {
        lines.forEach(line => {
            line = line.trim();
            if (!line) { lineNumber++;return; }
    
            const chapterMatch = line.match(/^Section (\d+)/i) || line.match(/^第(\d+)篇/) || line.match(/^第(\d+)章/) || line.match(/^제 (\d+) 편/);
            // const chapterMatch = line.match(/^CHAPTER (\d+)/i) || line.match(/^第(\d+)章/);
            var verseMatch = null;
            if  (lineNumber > 5) { verseMatch = (line.match(/^\d+ (.*)$/) || line.match(/^(\d+)([^\d].*)$/)); }
    
            if (chapterMatch) {
                currentChapter = { number: parseInt(chapterMatch[1], 10), verses: [], introduction: "", summary: "" };
                chapters.push(currentChapter);
                currentVerseNumber = 0; // Reset verse number for each chapter
                introCapture = true; // Start capturing introduction text
            } else if (introCapture && !verseMatch) {
                currentChapter.introduction = line; // Capture introduction line
                introCapture = false; // Stop capturing after the first line following chapter title
                summaryCapture = true
            } else if (summaryCapture && !verseMatch) {
                currentChapter.summary = line; // Capture introduction line
                summaryCapture = false; // Stop capturing after the first line following chapter title
            }else if (verseMatch && currentChapter) {
                currentVerseNumber += 1;
                currentChapter.verses.push({ key: `${currentVerseNumber}`, text: verseMatch[0].trim() });
            }
            lineNumber++
        });
    }

    return chapters;
};

const removeLeadingNumbers = (text) => {
    return text.replace(/^\d+\s*/, '');
}

const combineTexts = (frenchChapters, englishChapters, chineseChapters, japaneseChapters, koreanChapters) => {
    return englishChapters.map(engChapter => {
        const chiChapter = chineseChapters.find(ch => ch.number === engChapter.number);
        const jpnChapter = japaneseChapters.find(jp => jp.number === engChapter.number);
        const korChapter = koreanChapters.find(kr => kr.number === engChapter.number);
        const fraChapter = frenchChapters.find(fr => fr.number === engChapter.number);
        return {
            number: engChapter.number,
            introduction: {
                fr: (fraChapter.introduction.length != 0)? fraChapter.introduction : engChapter.introduction,
                en: engChapter.introduction,
                zh: (chiChapter.introduction.length != 0)? chiChapter.introduction : engChapter.introduction,
                jp: (jpnChapter.introduction.length != 0)? jpnChapter.introduction : engChapter.introduction,
                kr: (korChapter.introduction.length != 0)? korChapter.introduction : engChapter.introduction
            },
            ...(engChapter.summary != null && {
                summary: {
                    fr: (fraChapter.summary.length != 0)? fraChapter.summary : engChapter.summary,
                    en: engChapter.summary,
                    zh: (chiChapter.summary.length != 0)? chiChapter.summary : engChapter.summary,
                    jp: (jpnChapter.summary.length != 0)? jpnChapter.summary : engChapter.summary,
                    kr: (korChapter.summary.length != 0)? korChapter.summary : engChapter.summary
                }
            }),
            verses: engChapter.verses.map((verse, verseIndex) => ({
                key: verse.key,
                text: {
                    fr: fraChapter.verses[verseIndex] ? removeLeadingNumbers(fraChapter.verses[verseIndex].text) : "",
                    en: verse.text ? removeLeadingNumbers(verse.text) : "",
                    zh: chiChapter.verses[verseIndex] ? removeLeadingNumbers(chiChapter.verses[verseIndex].text) : "",
                    jp: jpnChapter.verses[verseIndex] ? removeLeadingNumbers(jpnChapter.verses[verseIndex].text) : "",
                    kr: korChapter.verses[verseIndex] ? removeLeadingNumbers(korChapter.verses[verseIndex].text) : ""
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

const extractBookDetailsEng = (text) => {
    const lines = text.split('\n').map(line => line.trim());
    const book = `${lines[0]} ${lines[1]}`;
    const theme = lines.length > 3 ? lines[3] : "";
    const introduction = lines.length > 3 ? lines[4] : lines[3];

    return { book, theme, introduction };
};

module.exports = {
    parseText,
    removeLeadingNumbers,
    combineTexts,
    sortChapters,
    extractBookDetails,
    extractBookDetailsEng
};