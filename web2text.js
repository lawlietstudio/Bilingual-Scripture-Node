const puppeteer = require('puppeteer');
const fs = require('fs');

// var chapter = "dc-testament/dc/";
// var chapter = "pgp/abr/";
// var chapter = "pgp/abr/";
// ["moses", "abr"]
// ["1-ne","2-ne","3-ne","4-ne","alma","enos","ether","hel","jacob","jarom","morm","moro","mosiah","omni","w-of-m"]
var chapter = "ot/ex/";
const langeng = "eng";
const langzho = "zho";
const langfra = "fra";
const langjpn = "jpn";
const langkor = "kor";

async function scrapeText(chapter, lang) {
    const url = `https://www.churchofjesuschrist.org/study/scriptures/${chapter}?lang=${lang}`;
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
    fs.writeFile(outputFile, content, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`Scraped text has been saved to ${outputFile}`);
        }
    });
}

async function main() {
    for (var i = 1; i <= 139; i++) {
        newChapter = chapter + i
        const textEng = await scrapeText(newChapter, langeng);
        await saveToFile(newChapter, langeng, textEng);

        const textZho = await scrapeText(newChapter, langzho);
        await saveToFile(newChapter, langzho, textZho);

        const textFra = await scrapeText(newChapter, langfra);
        await saveToFile(newChapter, langfra, textFra);

        const textJpn = await scrapeText(newChapter, langjpn);
        await saveToFile(newChapter, langjpn, textJpn);

        const textKor = await scrapeText(newChapter, langkor);
        await saveToFile(newChapter, langkor, textKor);
    }
}

main();
