import puppeteer from 'puppeteer';

import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

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
const timestamp = getFormattedTimestamp();
const path = `testcsv_${timestamp}.csv`;

const getQuotes = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  await page.goto(
    // 'https://www.bhphotovideo.com/c/search?q=speedlite%20430EX-III&sts=ma',
    // 'https://www.bhphotovideo.com/c/products/35mm-film/ci/39569?filters=fct_number-of-rolls_5574%3A1-roll',
    'https://www.bhphotovideo.com/c/buy/35mm-film/ci/39569',
    {
      waitUntil: 'domcontentloaded',
    }
  );

  // Instanciate the writer object

  const writer = createObjectCsvWriter({
    path: path,
    header: [
      { id: 'name', title: 'NAME' },
      { id: 'price', title: 'PRICE' },
      { id: 'imageUrl', title: 'IMAGE' },
      { id: 'details', title: 'DETAILS' },
      { id: 'stockStatus', title: 'STOCK' },
    ],
    append: false,
  });

  // SCROLL DOWN THE PAGE TO MAKE SURE ALL CONTENT IS LOADED
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

  const quotes = await page.evaluate(() => {
    // GRABBING ALL ITEMS INSIDE OF THE COMPONENT
    const quoteList = document.querySelectorAll('.product_UCJ1nUFwhh');

    // ITERATING EACH ITEM AND GRABBING DATA FROM THEM
    return Array.from(quoteList).map((quote) => {
      // GRABBING NAME
      const name = quote.querySelector(
        '[data-selenium="miniProductPageProductName"]'
      ).innerText;

      // GRABBING IMAGE URL
      const imageUrl = quote.querySelector('img').getAttribute('src');

      // GRABBING ITEM DESCRIPTION AS A LIST
      const detailsList = quote.querySelectorAll(
        '.list_neCtljXF3z > .element_neCtljXF3z'
      );
      // ITERATING THROUGH THAT LIST
      const details = Array.from(detailsList).map((detail) => {
        return detail.innerText;
      });

      // CHECKING STOCK STATUS
      const stockStatus = quote.querySelector(
        '[data-selenium="stockStatus"]'
      ).innerText;

      // GRABBING PRICE
      const priceDecimals =
        parseInt(
          quote.querySelector('[data-selenium="uppedDecimalPriceSecond"]')
            .innerText
        ) / 100;
      const price =
        parseInt(
          quote
            .querySelector('[data-selenium="uppedDecimalPriceFirst"]')
            .innerText.slice(1)
        ) + priceDecimals;

      return { name, price, imageUrl, details, stockStatus };
    });
  });

  // CHECK IF THERE IS A NEXT BUTTON
  // const waitForNext = () => {
  //   page.click('[data-selenium=listingPagingPageNext]');
  // };
  // while (await page.$('[data-selenium=listingPagingPageNext]')) {
  //   setTimeout(waitForNext, 5000);
  // }

  while (
    // in Adorama's case we need to add a condition to exit the loop when the button is dissabled (at end of pagination)
    await page.waitForSelector('[data-selenium=listingPagingPageNext]')
  ) {
    await autoScroll(page);
    console.log('Page loaded!');

    await page.click('[data-selenium=listingPagingPageNext]');
  }

  // DISPLAY THE QUOTES
  console.log(quotes);
  const records = quotes;
  await browser.close();
  // WRITTING DATA INTO A JSON FILE
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
};

// // Start the scraping
getQuotes();
