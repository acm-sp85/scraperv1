export async function scrapePage(page) {

  return await page.evaluate(() => {
    // GRABBING ALL ITEMS INSIDE OF THE COMPONENT
    const quoteList = document.querySelectorAll('.Products_productWr__lP23N');

    // ITERATING EACH ITEM AND GRABBING DATA FROM THEM
    return Array.from(quoteList).map((quote) => {
      // GRABBING SKU
      const SKU = quote.getAttribute('data-sku');

      // GRABBING PRODUCT DATA OBJECT
      const productInfo = quote.getAttribute('data-product');
      const { price, brand, category } = JSON.parse(productInfo);

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
        category,
        SKU,
      };
    });
  });
}
