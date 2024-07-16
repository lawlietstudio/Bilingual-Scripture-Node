const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const oldTestamentBooks = require('./ot');
const newTestamentBooks = require('./nt');

// var chapter = "dc-testament/dc/";
// var chapter = "pgp/abr/";
// var chapter = "pgp/abr/";
// ["moses", "abr"]
// ["1-ne","2-ne","3-ne","4-ne","alma","enos","ether","hel","jacob","jarom","morm","moro","mosiah","omni","w-of-m"]
// ["lev", "num", "deut", "josh", "judg", "ruth", "1-sam", "2-sam", "1-kgs"]

const langeng = "eng";
const langzho = "zho";
const langfra = "fra";
const langjpn = "jpn";
const langkor = "kor";

async function scrapeText(chapter, lang) {
    const url = `https://www.churchofjesuschrist.org/study/scriptures/${chapter}?lang=${lang}`;
    // console.log(url);
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(url);

    // Wait for the content to load, adjust the selector as needed
    await page.waitForSelector('.body-block');

    const content = await page.evaluate(async () => {
        localStorage.setItem('footnotesHidden', 'false');

        console.log("document")

        const headerElement = document.querySelector('h1#title1');
        const header = headerElement ? headerElement.innerText : '';

        const headerP = Array.from(document.querySelectorAll('header p'))
            .map(element => element.textContent.trim())
            .join('\n');
        // Remove all <a> tags within .body-block paragraphs
        const aTags = document.querySelectorAll('.body-block p sup');
        aTags.forEach(a => a.remove());
        const texts = Array.from(document.querySelectorAll('.body-block p'))
            .map(element => element.textContent.trim())
            .join('\n');

        return `${header}\n\n${headerP}\n\n${texts}`;
    });

    await browser.close();
    return content;
}

async function saveToFile(chapter, lang, content) {
    const outputFile = `${chapter}_${lang}.txt`;
    const dirPath = path.dirname(`scripture/${chapter}`);

    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFile(`scripture/${outputFile}`, content, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`Scraped text has been saved to ${outputFile}`);
        }
    });
}

async function main() {
    for (var i = 0; i < newTestamentBooks.length; i++) {
        var chapter = `nt/${newTestamentBooks[i].name}/`;
        for (var j = 1; j <= newTestamentBooks[i].chapters; j++) {
            newChapter = chapter + j
            const textEng = await scrapeText(newChapter, langeng);
            await saveToFile(newChapter, langeng, textEng);

            // const textZho = await scrapeText(newChapter, langzho);
            // await saveToFile(newChapter, langzho, textZho);

            const textFra = await scrapeText(newChapter, langfra);
            await saveToFile(newChapter, langfra, textFra);

            const textJpn = await scrapeText(newChapter, langjpn);
            await saveToFile(newChapter, langjpn, textJpn);

            const textKor = await scrapeText(newChapter, langkor);
            await saveToFile(newChapter, langkor, textKor);
        }
    }
}

main();
