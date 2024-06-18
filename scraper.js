import puppeteer from 'puppeteer';
import { scrapePage } from './scraperAdorama.js';
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // List of URLs or navigation logic
  const urls = [
    'https://www.adorama.com/l/Used/Photography/Lenses/Rangefinder-Lenses',
    // 'https://www.adorama.com/l/Photography/Film-and-Darkroom-Equipment/Lomography~Fujifilm~Film',
  ];

  for (const url of urls) {
    // SCROLL DOWN THE PAGE TO MAKE SURE ALL CONTENT IS LOADED
    let pageCount = 0;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    async function autoScroll(page) {
      await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
          let totalHeight = 0;
          let distance = 100;
          let timer = setInterval(() => {
            let scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
    }

    await autoScroll(page);
    // Wait for the column of products to be present
    await page.waitForSelector('.Products_productWr__lP23N', {
      visible: true,
      timeout: 10000,
    });
    // CHECK IF THERE IS A NEXT BUTTON AND CLICK IT
    // ///////////THIS IS THE PAGINATION
    while (
      (await page.waitForSelector(
        '[class=PaginationProductsList_nextLink__GE_q7]'
      )) &&
      (await page.$eval(
        '[class=PaginationProductsList_nextLink__GE_q7]',
        (element) => element.getAttribute('href')
      )) !== '/'
    ) {
      // Call the scrapePage function
      pageCount++;
      await autoScroll(page);
      let quotes = await scrapePage(page);
      console.log('Page loaded!');
      console.log(`Data from ${url} @Page ${pageCount}: `, quotes);
      await page.click('[class=PaginationProductsList_nextLink__GE_q7]');
    }
    ////////////////////////////////

    // You can now process the `quotes` as needed, e.g., save to a database or a file
    // console.log(`Data from ${url}:`, quotes);
  }

  await browser.close();
})();

////////////////////////////////OLD
// const getQuotes = async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     // devtools: true,
//   });
// Open a new page
//   const page = await browser.newPage();

//   await page.goto(
//     'https://www.adorama.com/l/Used/Photography/Lenses/Rangefinder-Lenses',
//     // 'https://www.adorama.com/l/Photography/Film-and-Darkroom-Equipment/Lomography~Fujifilm~Film',

//     {
//       waitUntil: 'domcontentloaded',
//     }
//   );

//   // await page.evaluate(() => {
//   //   debugger;
//   // });

//   // CHECK IF THERE IS A NEXT BUTTON AND CLICK IT
//   // ///////////THIS IS THE PAGINATION
//   while (
//     (await page.waitForSelector(
//       '[class=PaginationProductsList_nextLink__GE_q7]'
//     )) &&
//     (await page.$eval(
//       '[class=PaginationProductsList_nextLink__GE_q7]',
//       (element) => element.getAttribute('href')
//     )) !== '/'
//   ) {
//     await autoScroll(page);
//     console.log('Page loaded!');
//     console.log(quotes);

//     await page.click('[class=PaginationProductsList_nextLink__GE_q7]');
//   }
//   ////////////////////////////////
//   console.log('loop exited!!');

//   // DISPLAY THE QUOTES
//   // console.log(quotes);
//   await browser.close();
//   // WRITTING DATA INTO A JSON FILE
//   // fs.writeFile('data.json', JSON.stringify(quotes), (err) => {
//   //   if (err) throw err;
//   //   console.log('Data written successfully');
//   // });
// };

// // Start the scraping
// getQuotes();

////////////////////////////////OLD
