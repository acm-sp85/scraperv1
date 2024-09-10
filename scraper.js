import puppeteer from 'puppeteer';
import { scraperPage } from './scraperAdorama.js';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import cron from 'node-cron';

function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_@${hours}:${minutes}:${seconds}`;
}
// Use the formatted timestamp to create a unique file name
let timestamp = getFormattedTimestamp();
let path = `testcsv_${timestamp}.csv`;

// Instanciate the writer object

let writer = createObjectCsvWriter({
  path: path,
  header: [
    { id: 'description', title: 'DESCRIPTION' },
    { id: 'brand', title: 'BRAND' },
    { id: 'price', title: 'PRICE' },
    { id: 'imageUrl', title: 'IMAGEURL' },
    { id: 'category', title: 'CATEGORY' },
    { id: 'SKU', title: 'SKU' },
  ],
  append: true,
});

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // List of URLs or navigation logic
  const urls = [
    // 'https://www.adorama.com/l/Photography/Film-and-Darkroom-Equipment/Film',
    // 'https://www.adorama.com/l/Used/Photography/Lenses/Rangefinder-Lenses',
    // 'https://www.adorama.com/l/Photography/Film-and-Darkroom-Equipment/Lomography~Fujifilm~Film',
    // 35mm + 120 in stock:
    'https://www.adorama.com/l/Photography/Film-and-Darkroom-Equipment/Film?sel=Film-Type_B-and-W-Monochrome_Daylight-with-FX_Tungsten_Black-and-White-Reversal_Color_Slide_Daylight_Infrared-Film%7CFilter-By_In-Stock',
    // motion: 8mm + 16mm
    'https://www.adorama.com/l/Photography/Film-and-Darkroom-Equipment/Film?sel=Film-Type_16mm_Super-8',
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
      let quotes = await scraperPage(page);
      console.log('Page loaded!');
      console.log(`Data from ${url} @Page ${pageCount}: `, quotes);

      // WRITTING DATA INTO A JSON FILE
      let records = quotes;
      fs.writeFile('data.json', JSON.stringify(quotes), (err) => {
        if (err) throw err;
        console.log('Data written successfully');
      });

      // WRITTING DATA INTO A CSV FILE
      writer
        .writeRecords(records) // returns a promise
        .then(() => {
          console.log('...Done');
        });
      await page.click('[class=PaginationProductsList_nextLink__GE_q7]');
    }
    ////////////////////////////////
  }

  await browser.close();
})();


