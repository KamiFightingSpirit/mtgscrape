const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { getFloatFromString } = require('./helperfunctions/getFloatFromString');
const { filterData } = require('./filterData');
const { processData } = require('./processData');

//OPTIONS
let urls = [
    'https://www.tcgplayer.com/product/448396/magic-the-brothers-war-island-280-full-art?xid=pi3d1636eb-0479-4d80-bf60-a2af5d5f13a8&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/448402/magic-the-brothers-war-forest-287-full-art?xid=pi3d1636eb-0479-4d80-bf60-a2af5d5f13a8&page=1&Language=English&Condition=Near+Mint&Printing=Foil'
];
let headless = true; // false -> show chromium as the program runs (will be slower)
let priceRange = 0.35; // How far above the lowest priced card (that also has shipping below minPriceShipping below) do you want results for?
let minPriceShipping = 2; // Keep at 2 for a reasonable outcome, combines with priceRange above to determine what the true "min price" is
let filters = {
    minQuant: 2, // Final results will not include those with totalQuan < minQuant, set to false to ignore
    maxShippingPerItem: 0.3 // Final results will not include those with shippingPerItem > maxShippingPerItem, set to false to ignore
};

(async () => {
    const browser = await puppeteer.launch({headless: headless});
    const page = await browser.newPage();
    let gatheredData = {};
    
    for(url of urls) {
        console.log('\n');
        try {
            await page.goto(url, {timeout: 30000});
            //Loads Item Name
            await page.waitForSelector('.product-details__name');
            let itemName = await page.$('.product-details__name');
            itemName = await page.evaluate(el => el.textContent, itemName);
            
            //Selects "Item Price Only" to capture lowest prices possible
            await page.waitForSelector('select[data-testid="mp-select__UpdateSortBy"]');
            await page.click('select[data-testid="mp-select__UpdateSortBy"]');
            await page.select('select[data-testid="mp-select__UpdateSortBy"]', 'price');

            //Loads the max of 50 results instead of 10
            await page.waitForSelector('select[data-testid="mp-select__UpdateListingsPerPage"]');
            await page.click('select[data-testid="mp-select__UpdateListingsPerPage"]');
            await page.select('select[data-testid="mp-select__UpdateListingsPerPage"]', '50');

            //Selects all items on page
            await page.waitForSelector('.listing-item');
            let listings = await page.$$('.listing-item');
            let seenMinPrice = false;
            let minPrice = 0;
            
            console.log('GATHERING DATA FOR: ' + `${itemName}`);

            for(listing of listings) {
                let shopName = await listing.$eval('a[href*="sellerfeedback"]', el => el.textContent);
                let price = await listing.$eval('div.listing-item__price', el => el.textContent);
                let quant = await listing.$eval('div > div.add-to-cart.quantity-input > div > span', el => el.textContent);
                let shippingPolicy = await listing.$eval('div.listing-item__info > div:nth-child(2)', el => el.textContent);
                
                quant = getFloatFromString(quant);
                shippingPolicy = getFloatFromString(shippingPolicy);
                price = getFloatFromString(price);

                if(!seenMinPrice && (shippingPolicy === 50 || shippingPolicy < minPriceShipping)) {
                    minPrice = price;
                    seenMinPrice = true;
                }
                if(seenMinPrice && price > minPrice + priceRange) {
                    break;
                }

                gatheredData = processData(shopName, itemName, price, quant, shippingPolicy, gatheredData);
            }
        } catch(err) {
            console.log(err);
        }
    } 
    gatheredData = filterData(gatheredData, filters)
    
    console.log(gatheredData);
    fs.writeFile('results.js', JSON.stringify(gatheredData, null, 4), (err) => {
        if (err) return console.log(err);
        console.log('Results have also been saved to results.js');
    });
    
    await browser.close();
})();



