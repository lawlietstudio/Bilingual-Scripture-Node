const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const chapter = "1-ne/5"
const langeng = "eng"
const langzho = "zho"

async function scrapeText(chapter, lang) {
    const url = `https://www.churchofjesuschrist.org/study/scriptures/bofm/${chapter}?lang=${lang}`;
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const headerElements = $('h1#title1'); // Adjust this selector based on actual website structure
        const header = headerElements.map((i, el) => {
            return $(el).text(); // Extract the text content from each element
        }).get(); // Convert cheerio object to an array

        const headerPElements = $('header p'); // Adjust this selector based on actual website structure
        const headerP = headerPElements.map((i, el) => {
            return $(el).text(); // Extract the text content from each element
        }).get(); // Convert cheerio object to an array

        const textElements = $('.body-block p'); // Adjust this selector based on actual website structure
        const texts = textElements.map((i, el) => {
            return $(el).text(); // Extract the text content from each element
        }).get(); // Convert cheerio object to an array

        return [...header, ...headerP, ...texts].join('\n\n'); // Join all text elements with a newline
    } catch (error) {
        console.error('Error scraping text:', error);
        return null;
    }
}



scrapeText(chapter, langeng).then(text => {
    const outputFile = `${chapter}?lang=${langeng}.txt`;
    fs.writeFile(outputFile, text, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`Scraped text has been saved to ${outputFile}`);
        }
    });
});

scrapeText(chapter, langzho).then(text => {
    const outputFile = `${chapter}?lang=${langzho}.txt`;
    fs.writeFile(outputFile, text, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`Scraped text has been saved to ${outputFile}`);
        }
    });
});
