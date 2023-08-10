import puppeteer from 'puppeteer';


const getQuotes = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  await page.goto(
    'https://www.bhphotovideo.com/c/buy/35mm-film/ci/39569/cp/1731%2B9954%2B39569/pn/6',
    // 'https://www.bhphotovideo.com/c/products/35mm-film/ci/39569/cp/1731%2B9954%2B39569?filters=fct_number-of-rolls_5574%3A1-roll',
    // 'https://www.bhphotovideo.com/c/products/compound-microscopes/ci/41707?filters=fct_brand_name%3Avivitar',
    {
      waitUntil: 'domcontentloaded',
    }
  );

  // SCROLL DOWN THE PAGE TO MAKE SURE ALL CONTENT IS LOADED
  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
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
  await page.waitForSelector('[data-selenium="listingPagingPageNext"]');
  await page.click('[data-selenium="listingPagingPageNext"]');

  // DISPLAY THE QUOTES
  console.log(quotes);
  // await browser.close();
  // WRITTING DATA INTO A JSON FILE
  fs.writeFile('data.json', JSON.stringify(quotes), (err) => {
    if (err) throw err;
    console.log('Data written successfully');
  });
};

// Start the scraping
getQuotes();
