const puppeteer = require('puppeteer');
const http = require('http');

const html = `
<html>
  <body>
    <div id="element"></div>

    <script>
      document.getElementById('element').innerHTML = 
        localStorage.getItem('token') ? 'signed' : 'not signed';
    </script>
  </body>
</html>`;

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
  })
  .listen(8080);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080/');

  // await page.evaluate(() => {
  //   localStorage.setItem('token', 'example-token');
  // });

  // await page.goto('http://localhost:8080/');

  const text = await page.evaluate(
    () => document.querySelector('#element').textContent
  );

  console.log(text);
  await browser.close();

  process.exit(0);
})();