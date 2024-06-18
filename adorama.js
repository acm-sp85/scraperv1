import puppeteer from 'puppeteer';

const getQuotes = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    // devtools: true,
  });

  // Open a new page
  const page = await browser.newPage();

  await page.goto(
    'https://www.adorama.com/l/Used/Photography/Lenses/Rangefinder-Lenses',
    // 'https://www.adorama.com/l/Photography/Film-and-Darkroom-Equipment/Lomography~Fujifilm~Film',

    {
      waitUntil: 'domcontentloaded',
    }
  );

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
  await page.waitForSelector('.Products_productWr__lP23N', {
    visible: true,
    timeout: 10000,
  });

  
  const quotes = await page.evaluate(() => {
    // GRABBING ALL ITEMS INSIDE OF THE COMPONENT

    const quoteList = document.querySelectorAll('.Products_productWr__lP23N');

    // ITERATING EACH ITEM AND GRABBING DATA FROM THEM
    return Array.from(quoteList).map((quote) => {
      // GRABBING SKU
      const SKU = quote.getAttribute('data-sku');

      // GRABING PRODUCT DATA OBJECT
      const productInfo = quote.getAttribute('data-product');
      const price = JSON.parse(productInfo).price;
      const brand = JSON.parse(productInfo).brand;
      const category = JSON.parse(productInfo).category;

      // GRABBING DESCRIPTION
      const description = quote.querySelector(
        '.Products_title__ROEN5 a span'
      ).innerText;

      // GRABBING PRODUCT IMAGE URL

      const imageUrl = quote
        .querySelector('.Products_image__JwFCS img')
        .getAttribute('src');

      return {
        description,
        brand,
        price,
        imageUrl,
        productInfo,
        category,
        SKU,
      };
    });
  });

  // await page.evaluate(() => {
  //   debugger;
  // });

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
    await autoScroll(page);
    console.log('Page loaded!');
    console.log(quotes);

    await page.click('[class=PaginationProductsList_nextLink__GE_q7]');
  }
  ////////////////////////////////
  console.log('loop exited!!');

  // DISPLAY THE QUOTES
  // console.log(quotes);
  await browser.close();
  // WRITTING DATA INTO A JSON FILE
  // fs.writeFile('data.json', JSON.stringify(quotes), (err) => {
  //   if (err) throw err;
  //   console.log('Data written successfully');
  // });
};

// Start the scraping
getQuotes();
