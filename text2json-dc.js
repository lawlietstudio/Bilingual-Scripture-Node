const fs = require('fs');
const path = require('path');
const { parseText, combineTexts, sortChapters, extractBookDetails, extractBookDetailsEng } = require('./utils');

const main = () => {
    const mainFolderName = "dc-testament"

    const folderName = "dc"
    const dirPath = path.join(__dirname, `dc-testament/${folderName}`);
    const files = fs.readdirSync(dirPath);
    const frenchFiles = files.filter(file => file.includes('fra')).sort();
    const englishFiles = files.filter(file => file.includes('eng')).sort();
    const chineseFiles = files.filter(file => file.includes('zho')).sort();
    const japaneseFiles = files.filter(file => file.includes('jpn')).sort();
    const koreanFiles = files.filter(file => file.includes('kor')).sort();

    let allFrenchChapters = [];
    let allEnglishChapters = [];
    let allChineseChapters = [];
    let allJapaneseChapters = [];
    let allKoreanFilesChapters = [];

    frenchFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        const text = fs.readFileSync(filePath, 'utf8');
        allFrenchChapters = allFrenchChapters.concat(parseText(text, "sections"));
    });
    englishFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        const text = fs.readFileSync(filePath, 'utf8');
        allEnglishChapters = allEnglishChapters.concat(parseText(text, "sections"));
    });

    chineseFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        const text = fs.readFileSync(filePath, 'utf8');
        allChineseChapters = allChineseChapters.concat(parseText(text, "sections"));
    });

    japaneseFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        const text = fs.readFileSync(filePath, 'utf8');
        allJapaneseChapters = allJapaneseChapters.concat(parseText(text, "sections"));
    });

    koreanFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        const text = fs.readFileSync(filePath, 'utf8');
        allKoreanFilesChapters = allKoreanFilesChapters.concat(parseText(text, "sections"));
    });

    const combinedChapters = combineTexts(allFrenchChapters, allEnglishChapters, allChineseChapters, allJapaneseChapters, allKoreanFilesChapters);
    const sortedCombinedChapters = sortChapters(combinedChapters);

    // Explicitly find the first chapter files
    const firstFrenchChapterFile = frenchFiles.find(file => file.startsWith('1_'));
    const firstEnglishChapterFile = englishFiles.find(file => file.startsWith('1_'));
    const firstChineseChapterFile = chineseFiles.find(file => file.startsWith('1_'));
    const firstJapaneseChapterFile = japaneseFiles.find(file => file.startsWith('1_'));
    const firstKoreanChapterFile = koreanFiles.find(file => file.startsWith('1_'));

    const firstFrenchText = fs.readFileSync(path.join(dirPath, firstFrenchChapterFile), 'utf8');
    const firstEnglishText = fs.readFileSync(path.join(dirPath, firstEnglishChapterFile), 'utf8');
    const firstChineseText = fs.readFileSync(path.join(dirPath, firstChineseChapterFile), 'utf8');
    const firstJapaneseText = fs.readFileSync(path.join(dirPath, firstJapaneseChapterFile), 'utf8');
    const firstKoreanText = fs.readFileSync(path.join(dirPath, firstKoreanChapterFile), 'utf8');

    const frenchDetails = extractBookDetailsEng(firstFrenchText);
    const englishDetails = extractBookDetailsEng(firstEnglishText);
    const chineseDetails = extractBookDetails(firstChineseText);
    const japaneseDetails = extractBookDetails(firstJapaneseText);
    const koreanDetails = extractBookDetails(firstKoreanText);

    const combinedJson = {
        book: {
            fr: frenchDetails.book,
            en: englishDetails.book,
            zh: chineseDetails.book,
            jp: japaneseDetails.book,
            kr: koreanDetails.book
        },
        theme: {
            fr: frenchDetails.theme,
            en: englishDetails.theme,
            zh: chineseDetails.theme,
            jp: japaneseDetails.theme,
            kr: koreanDetails.theme
        },
        introduction: {
            fr: frenchDetails.introduction,
            en: englishDetails.introduction,
            zh: chineseDetails.introduction,
            jp: japaneseDetails.introduction,
            kr: koreanDetails.introduction
        },
        chapters: sortedCombinedChapters
    };

    fs.writeFileSync(path.join(__dirname, `scripture/${mainFolderName}/${folderName}/${folderName}.json`), JSON.stringify(combinedJson, null, 2), 'utf8');
    console.log(`Combined JSON has been saved as ${folderName}.json`);
};

main();
