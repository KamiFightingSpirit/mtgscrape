const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { getFloatFromString } = require('./helperfunctions/getFloatFromString');
const { filterData } = require('./helperfunctions/filterData');
const { processData } = require('./helperfunctions/processData');
const { processUrls } = require('./helperfunctions/processUrls');

//OPTIONS
const headless = true; // false -> show chromium (will be slower)
const priceRange = 0.25; // How far above the lowest priced card (that also has shipping below minPriceShipping below) do you want results for?
const minPriceShipping = 2; // Keep at 2 for a reasonable outcome, combines with priceRange above to determine what the true "min price" is
const maxQuantPerCard = 17; // How many of each card do you wish to purchase at maximum? 
const filters = {
    minQuant: 2, // Final results will not include those with totalQuan < minQuant, set to false to ignore
    maxShippingPerItem: 0.2 // Final results will not include those with shippingPerItem > maxShippingPerItem, set to false to ignore
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

let urls = [
    'https://www.tcgplayer.com/product/448396/magic-the-brothers-war-island-280-full-art?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/448399/magic-the-brothers-war-island-281-full-art?Printing=Foil&Condition=Near+Mint&page=1&Language=English',
    'https://www.tcgplayer.com/product/448395/magic-the-brothers-war-swamp-282-full-art?Language=English&Condition=Near+Mint&Printing=Foil',
    'https://www.tcgplayer.com/product/287143/magic-unfinity-plains-486-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287144/magic-unfinity-island-487-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287145/magic-unfinity-swamp-488-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287147/magic-unfinity-forest-490-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287148/magic-unfinity-plains-491-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287149/magic-unfinity-island-492-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287150/magic-unfinity-swamp-493-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287151/magic-unfinity-mountain-494-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287152/magic-unfinity-forest-495-borderless-galaxy-foil?Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279830/magic-dominaria-united-plains-showcase?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279831/magic-dominaria-united-island-showcase?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279832/magic-dominaria-united-swamp-showcase?Language=English&Printing=Foil&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279833/magic-dominaria-united-mountain-showcase?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279834/magic-dominaria-united-forest-showcase?Language=English&Printing=Foil&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/265356/magic-streets-of-new-capenna-mountain-279?Printing=Foil&Condition=Near+Mint&page=1&Language=English',
    'https://www.tcgplayer.com/product/257676/magic-kamigawa-neon-dynasty-plains-293-jp-full-art?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/257677/magic-kamigawa-neon-dynasty-plains-294-jp-full-art?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/257678/magic-kamigawa-neon-dynasty-island-295-jp-full-art?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/257679/magic-kamigawa-neon-dynasty-island-296-jp-full-art?Language=English&Condition=Near+Mint&Printing=Foil',
    'https://www.tcgplayer.com/product/257680/magic-kamigawa-neon-dynasty-swamp-297-jp-full-art?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/257681/magic-kamigawa-neon-dynasty-swamp-298-jp-full-art?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/257682/magic-kamigawa-neon-dynasty-mountain-299-jp-full-art?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/257685/magic-kamigawa-neon-dynasty-forest-302-jp-full-art?Language=English&Condition=Near+Mint&Printing=Foil',
    'https://www.tcgplayer.com/product/253433/magic-innistrad-crimson-vow-plains-268?Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/253434/magic-innistrad-crimson-vow-plains-269?Language=English&Printing=Foil&Condition=Near+Mint'
    // 'https://www.tcgplayer.com/product/253429/magic-innistrad-crimson-vow-island-270?Language=English&Printing=Foil&page=1&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253430/magic-innistrad-crimson-vow-island-271?Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253435/magic-innistrad-crimson-vow-swamp-272?Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253436/magic-innistrad-crimson-vow-swamp-273?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/253431/magic-innistrad-crimson-vow-mountain-274?Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/253432/magic-innistrad-crimson-vow-mountain-275?Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253427/magic-innistrad-crimson-vow-forest-276?Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253428/magic-innistrad-crimson-vow-forest-277?Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246250/magic-innistrad-midnight-hunt-plains-268?Condition=Near+Mint&Printing=Foil&page=1&Language=English',
    // 'https://www.tcgplayer.com/product/246245/magic-innistrad-midnight-hunt-plains-269?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246241/magic-innistrad-midnight-hunt-island-270?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246246/magic-innistrad-midnight-hunt-island-271?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246242/magic-innistrad-midnight-hunt-swamp-272?Language=English&Printing=Foil&page=1&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/246247/magic-innistrad-midnight-hunt-swamp-273?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246243/magic-innistrad-midnight-hunt-mountain-274?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246248/magic-innistrad-midnight-hunt-mountain-275?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246244/magic-innistrad-midnight-hunt-forest-276?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246249/magic-innistrad-midnight-hunt-forest-277?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/221825/magic-zendikar-rising-plains-268-full-art?Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/221827/magic-zendikar-rising-island-270-full-art?Printing=Foil&Condition=Near+Mint&Language=English&page=1',
    // 'https://www.tcgplayer.com/product/221828/magic-zendikar-rising-island-271-full-art?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/221835/magic-zendikar-rising-mountain-275-full-art?Printing=Foil&Condition=Near+Mint&Language=English&page=1',
    // 'https://www.tcgplayer.com/product/221839/magic-zendikar-rising-forest-280-full-art?Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/206022/magic-theros-beyond-death-plains?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/206026/magic-theros-beyond-death-forest?Printing=Foil&Condition=Near+Mint&page=1&Language=English',
    // 'https://www.tcgplayer.com/product/206024/magic-theros-beyond-death-swamp?Condition=Near+Mint&page=1&Language=English&Printing=Foil',
    // 'https://www.tcgplayer.com/product/206023/magic-theros-beyond-death-island?Printing=Foil&Condition=Near+Mint&page=1&Language=English',
    // 'https://www.tcgplayer.com/product/135049/magic-hour-of-devastation-plains-185-full-art?Language=English&direct=true&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/135048/magic-hour-of-devastation-mountain-188-full-art?Condition=Near+Mint&page=1&Language=English&Printing=Foil',
    // 'https://www.tcgplayer.com/product/135046/magic-hour-of-devastation-forest-189-full-art?Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/135050/magic-hour-of-devastation-swamp-187-full-art?Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/135047/magic-hour-of-devastation-island-186-full-art?Language=English&Condition=Near+Mint&Printing=Foil'
];

urls = processUrls(urls, urlOptions);

(async () => {
    const browser = await puppeteer.launch({headless: headless});
    const page = await browser.newPage();
    let gatheredData = {};
    let dropdownLock = false;
    for(url of urls) {
        console.log('\n');
        try {
            await page.goto(url, {timeout: 30000});
            //Loads Item Name
            await page.waitForSelector('.product-details__name');
            let itemName = await page.$('.product-details__name');
            itemName = await page.evaluate(el => el.textContent, itemName);
            
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
            
            console.log('GATHERING DATA FOR: ' + `${itemName}`);

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
    
    console.log(gatheredData);
    fs.writeFile('results.js', "const results = " + JSON.stringify(gatheredData, null, 4), (err) => {
        if (err) return console.log(err);
        console.log('Results have also been saved to results.js');
    });
    
    await browser.close();
})();



