const puppeteer = require('puppeteer');
const fs = require('fs');
const { getFloatFromString } = require('./helperfunctions/getFloatFromString');
const { filterData } = require('./helperfunctions/filterData');
const { processData } = require('./helperfunctions/processData');
const { processUrls } = require('./helperfunctions/processUrls');
const cardurls = require('./cardurls');

//OPTIONS
const headless = false; // false -> show chromium (will be slower)
const priceRange = 0.2; // How far above the lowest priced card (that also has shipping below minPriceShipping below) do you want results for?
const minPriceShipping = 3; // Keep at 2 for a reasonable outcome, combines with priceRange above to determine what the true "min price" is
const maxQuantPerCard = 17; // How many of each card do you wish to purchase at maximum? 
const filters = {
    maxShippingPerItem: 0.15 // Final results will not include those with shippingPerItem > maxShippingPerItem, set to false to ignore
};
urlOptions = {
    'Show Non-Foil': false,
    'Show Foil': true,
    'Quality': {
        'Show Near Mint': true,
        'Show Lightly Played': false,
        'Show Moderately Played': false,
        'Show Heavily Played': false,
        'Show Damaged': false
    }
}

cardurls = processUrls(cardurls, urlOptions);

(async () => {
    const browser = await puppeteer.launch({headless: headless});
    const page = await browser.newPage();
    let gatheredData = {};
    let dropdownLock = false;
    for(cardurl of cardurls) {
        console.log('\n');
        try {
            await page.goto(cardurl, {timeout: 30000});
            //Loads Item Name
            await page.waitForSelector('.product-details__name');
            let itemName = await page.$('.product-details__name');
            itemName = await page.evaluate(el => el.textContent, itemName);
            console.log('GATHERING DATA FOR: ' + `${itemName}`);

            if(!dropdownLock) {
                dropdownLock = true;
                //Selects "Item Price Only" to capture lowest prices possible
                await page.waitForSelector('select[data-testid="mp-select__UpdateSortBy"]');
                await page.click('select[data-testid="mp-select__UpdateSortBy"]');
                await page.select('select[data-testid="mp-select__UpdateSortBy"]', 'price');

                //Loads the max of 50 results instead of 10
                await page.waitForSelector('select[data-testid="mp-select__UpdateListingsPerPage"]');
                await page.click('select[data-testid="mp-select__UpdateListingsPerPage"]');
                await page.select('select[data-testid="mp-select__UpdateListingsPerPage"]', '50');
            }

            //Selects all items on page
            await page.waitForSelector('.listing-item');
            let listings = await page.$$('.listing-item');
            let seenMinPrice = false;
            let minPrice = 0;
            
            for(listing of listings) {
                let shopName = await listing.$eval('a[href*="sellerfeedback"]', el => el.textContent);
                let shopUrl = await listing.$('a[href*="sellerfeedback"]');
                shopUrl = await shopUrl.getProperty('href');
                shopUrl = await shopUrl.jsonValue();                
                let price = await listing.$eval('div.listing-item__price', el => el.textContent);
                let quant = await listing.$eval('div > div.add-to-cart.quantity-input > div > span', el => el.textContent);
                let shippingPolicy = await listing.$eval('div.listing-item__info > div:nth-child(2)', el => el.textContent);
                
                quant = getFloatFromString(quant) >= maxQuantPerCard ? maxQuantPerCard : getFloatFromString(quant);
                shippingPolicy = getFloatFromString(shippingPolicy);
                price = getFloatFromString(price);

                if(!seenMinPrice && (shippingPolicy === 50 || shippingPolicy < minPriceShipping)) {
                    minPrice = price;
                    seenMinPrice = true;
                }
                if(seenMinPrice && price > minPrice + priceRange) {
                    break;
                }

                gatheredData = processData(shopName, shopUrl, itemName, price, quant, shippingPolicy, gatheredData, minPrice);
            }
        } catch(err) {
            console.log(err);
        }
    } 
    gatheredData = filterData(gatheredData, filters)

    fs.writeFile('results.js', "const results = " + JSON.stringify(gatheredData, null, 4), (err) => {
        if (err) return console.log(err);
        console.log('Results have been saved to results.js');
    });
    
    await browser.close();
})();



