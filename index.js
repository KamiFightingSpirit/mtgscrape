const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { getFloatFromString } = require('./helperfunctions/getFloatFromString');
const { filterData } = require('./helperfunctions/filterData');
const { processData } = require('./helperfunctions/processData');

//OPTIONS
const headless = true; // false -> show chromium (will be slower)
const priceRange = 0.25; // How far above the lowest priced card (that also has shipping below minPriceShipping below) do you want results for?
const minPriceShipping = 2; // Keep at 2 for a reasonable outcome, combines with priceRange above to determine what the true "min price" is
const maxQuantPerCard = 17; // How many of each card do you wish to purchase at maximum? 
const filters = {
    minQuant: 2, // Final results will not include those with totalQuan < minQuant, set to false to ignore
    maxShippingPerItem: 0.2 // Final results will not include those with shippingPerItem > maxShippingPerItem, set to false to ignore
};
const urls = [
    'https://www.tcgplayer.com/product/448396/magic-the-brothers-war-island-280-full-art?xid=pi98058232-5747-49cf-a2fa-434df0f25111&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/448399/magic-the-brothers-war-island-281-full-art?xid=ci7f7273bf-deb0-4339-a914-2ea625d9c5fe&Printing=Foil&Condition=Near+Mint&page=1&Language=English',
    'https://www.tcgplayer.com/product/287143/magic-unfinity-plains-486-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287144/magic-unfinity-island-487-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287145/magic-unfinity-swamp-488-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287147/magic-unfinity-forest-490-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287148/magic-unfinity-plains-491-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287149/magic-unfinity-island-492-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287150/magic-unfinity-swamp-493-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287151/magic-unfinity-mountain-494-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/287152/magic-unfinity-forest-495-borderless-galaxy-foil?xid=pibd96c4ff-72cd-47d3-9da4-8b0262857b14&Printing=Foil&Language=English&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279830/magic-dominaria-united-plains-showcase?xid=pi1a273af3-3be6-4eb5-b1bb-8477b8316c6d&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279831/magic-dominaria-united-island-showcase?xid=pic51c2dee-bcca-4727-9f9d-854e08f58634&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279832/magic-dominaria-united-swamp-showcase?Language=English&Printing=Foil&page=1&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279833/magic-dominaria-united-mountain-showcase?xid=pi1a273af3-3be6-4eb5-b1bb-8477b8316c6d&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    'https://www.tcgplayer.com/product/279834/magic-dominaria-united-forest-showcase?Language=English&Printing=Foil&page=1&Condition=Near+Mint'
    // 'https://www.tcgplayer.com/product/265356/magic-streets-of-new-capenna-mountain-279?xid=ci05359d90-ae41-403a-aa5d-dac9ec0ea090&Printing=Foil&Condition=Near+Mint&page=1&Language=English',
    // 'https://www.tcgplayer.com/product/257676/magic-kamigawa-neon-dynasty-plains-293-jp-full-art?xid=pi307ef627-2a1c-459c-8181-ddc2a6b5d2a6&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/257677/magic-kamigawa-neon-dynasty-plains-294-jp-full-art?xid=pi1bffed2e-6e5f-4703-a626-cf04d33fbf5e&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/257678/magic-kamigawa-neon-dynasty-island-295-jp-full-art?xid=pi1bffed2e-6e5f-4703-a626-cf04d33fbf5e&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/257679/magic-kamigawa-neon-dynasty-island-296-jp-full-art?xid=pi307ef627-2a1c-459c-8181-ddc2a6b5d2a6&page=1&Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/257680/magic-kamigawa-neon-dynasty-swamp-297-jp-full-art?xid=pi307ef627-2a1c-459c-8181-ddc2a6b5d2a6&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/257681/magic-kamigawa-neon-dynasty-swamp-298-jp-full-art?xid=pi1bffed2e-6e5f-4703-a626-cf04d33fbf5e&page=1&Language=English&Printing=Foil&Condition=Near+Mint'
    // 'https://www.tcgplayer.com/product/257682/magic-kamigawa-neon-dynasty-mountain-299-jp-full-art?xid=pi1bffed2e-6e5f-4703-a626-cf04d33fbf5e&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/257685/magic-kamigawa-neon-dynasty-forest-302-jp-full-art?xid=pi1bffed2e-6e5f-4703-a626-cf04d33fbf5e&page=1&Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/253433/magic-innistrad-crimson-vow-plains-268?xid=pi1354bc0b-c606-4e14-8e55-239dbe3e8779&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253434/magic-innistrad-crimson-vow-plains-269?xid=pi1354bc0b-c606-4e14-8e55-239dbe3e8779&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253429/magic-innistrad-crimson-vow-island-270?Language=English&Printing=Foil&page=1&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253430/magic-innistrad-crimson-vow-island-271?xid=pi1354bc0b-c606-4e14-8e55-239dbe3e8779&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253435/magic-innistrad-crimson-vow-swamp-272?xid=pif8ab3020-6e22-4a16-840f-e3aa5a6ec82d&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253436/magic-innistrad-crimson-vow-swamp-273?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/253431/magic-innistrad-crimson-vow-mountain-274?xid=pi1354bc0b-c606-4e14-8e55-239dbe3e8779&page=1&Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/253432/magic-innistrad-crimson-vow-mountain-275?xid=pi1354bc0b-c606-4e14-8e55-239dbe3e8779&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253427/magic-innistrad-crimson-vow-forest-276?xid=pi1354bc0b-c606-4e14-8e55-239dbe3e8779&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/253428/magic-innistrad-crimson-vow-forest-277?xid=pi1354bc0b-c606-4e14-8e55-239dbe3e8779&page=1&Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246250/magic-innistrad-midnight-hunt-plains-268?xid=cidf48195e-8459-482c-af58-4c628c2a1067&Condition=Near+Mint&Printing=Foil&page=1&Language=English',
    // 'https://www.tcgplayer.com/product/246245/magic-innistrad-midnight-hunt-plains-269?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246241/magic-innistrad-midnight-hunt-island-270?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246246/magic-innistrad-midnight-hunt-island-271?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246242/magic-innistrad-midnight-hunt-swamp-272?Language=English&Printing=Foil&page=1&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/246247/magic-innistrad-midnight-hunt-swamp-273?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246243/magic-innistrad-midnight-hunt-mountain-274?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246248/magic-innistrad-midnight-hunt-mountain-275?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246244/magic-innistrad-midnight-hunt-forest-276?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/246249/magic-innistrad-midnight-hunt-forest-277?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/221825/magic-zendikar-rising-plains-268-full-art?xid=piab8d0429-69e4-46ce-bf87-4a292779ac5c&page=1&Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/221827/magic-zendikar-rising-island-270-full-art?xid=pi7e68cc8a-5128-4fe8-96b2-2cf37fdf4545&Printing=Foil&Condition=Near+Mint&Language=English&page=1',
    // 'https://www.tcgplayer.com/product/221828/magic-zendikar-rising-island-271-full-art?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/221835/magic-zendikar-rising-mountain-275-full-art?xid=pie691a7f8-4267-48a3-b2ba-7f4e9fce5f08&Printing=Foil&Condition=Near+Mint&Language=English&page=1',
    // 'https://www.tcgplayer.com/product/221839/magic-zendikar-rising-forest-280-full-art?xid=pi4b9e9739-b88c-4c32-85a4-c7d912994634&page=1&Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/206022/magic-theros-beyond-death-plains?Language=English&Condition=Near+Mint&page=1&Printing=Foil',
    // 'https://www.tcgplayer.com/product/206026/magic-theros-beyond-death-forest?xid=ci1f2dc091-471a-4e54-be0f-51e3ab23657e&Printing=Foil&Condition=Near+Mint&page=1&Language=English',
    // 'https://www.tcgplayer.com/product/206024/magic-theros-beyond-death-swamp?xid=pice9edba7-bb39-41ac-93b8-6275c7c78095&Condition=Near+Mint&page=1&Language=English&Printing=Foil',
    // 'https://www.tcgplayer.com/product/206023/magic-theros-beyond-death-island?xid=ci1f2dc091-471a-4e54-be0f-51e3ab23657e&Printing=Foil&Condition=Near+Mint&page=1&Language=English',
    // 'https://www.tcgplayer.com/product/135049/magic-hour-of-devastation-plains-185-full-art?xid=pi0aecbc45-102d-48d1-85ad-7afa69863631&page=1&Language=English&direct=true&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/135048/magic-hour-of-devastation-mountain-188-full-art?xid=pia110d076-418f-4a5f-92bd-3ffd53974ea1&Condition=Near+Mint&page=1&Language=English&Printing=Foil',
    // 'https://www.tcgplayer.com/product/135046/magic-hour-of-devastation-forest-189-full-art?xid=pi0aecbc45-102d-48d1-85ad-7afa69863631&page=1&Language=English&Printing=Foil&Condition=Near+Mint',
    // 'https://www.tcgplayer.com/product/135050/magic-hour-of-devastation-swamp-187-full-art?xid=pi0aecbc45-102d-48d1-85ad-7afa69863631&page=1&Language=English&Condition=Near+Mint&Printing=Foil',
    // 'https://www.tcgplayer.com/product/135047/magic-hour-of-devastation-island-186-full-art?xid=pi0aecbc45-102d-48d1-85ad-7afa69863631&page=1&Language=English&Condition=Near+Mint&Printing=Foil'
];


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

                gatheredData = processData(shopName, itemName, price, quant, shippingPolicy, gatheredData, minPrice);
            }
        } catch(err) {
            console.log(err);
        }
    } 
    gatheredData = filterData(gatheredData, filters)
    
    console.log(gatheredData);
    fs.writeFile('results.js', "let results = " + JSON.stringify(gatheredData, null, 4), (err) => {
        if (err) return console.log(err);
        console.log('Results have also been saved to results.js');
    });
    
    await browser.close();
})();



