const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { getFloatFromString } = require('./helperfunctions/getFloatFromString');
const { filterData } = require('./helperfunctions/filterData');
const { processData } = require('./helperfunctions/processData');
const { processUrls } = require('./helperfunctions/processUrls');

//OPTIONS
const headless = true; // false -> show chromium (will be slower)
const priceRange = 0.17; // How far above the lowest priced card (that also has shipping below minPriceShipping below) do you want results for?
const minPriceShipping = 2; // Keep at 2 for a reasonable outcome, combines with priceRange above to determine what the true "min price" is
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

let urls = [
    //Brother's War
    'https://www.tcgplayer.com/product/448396/magic-the-brothers-war-island-280-full-art',
    'https://www.tcgplayer.com/product/448399/magic-the-brothers-war-island-281-full-art',
    'https://www.tcgplayer.com/product/448395/magic-the-brothers-war-swamp-282-full-art',
    //Unfinity
    'https://www.tcgplayer.com/product/287143/magic-unfinity-plains-486-borderless-galaxy-foil',
    'https://www.tcgplayer.com/product/287144/magic-unfinity-island-487-borderless-galaxy-foil',
    'https://www.tcgplayer.com/product/287145/magic-unfinity-swamp-488-borderless-galaxy-foil',
    'https://www.tcgplayer.com/product/287147/magic-unfinity-forest-490-borderless-galaxy-foil',
    'https://www.tcgplayer.com/product/287148/magic-unfinity-plains-491-borderless-galaxy-foil',
    'https://www.tcgplayer.com/product/287149/magic-unfinity-island-492-borderless-galaxy-foil',
    'https://www.tcgplayer.com/product/287150/magic-unfinity-swamp-493-borderless-galaxy-foil',
    'https://www.tcgplayer.com/product/287151/magic-unfinity-mountain-494-borderless-galaxy-foil',
    'https://www.tcgplayer.com/product/287152/magic-unfinity-forest-495-borderless-galaxy-foil',
    //Dominaria
    'https://www.tcgplayer.com/product/279830/magic-dominaria-united-plains-showcase',
    'https://www.tcgplayer.com/product/279831/magic-dominaria-united-island-showcase',
    'https://www.tcgplayer.com/product/279832/magic-dominaria-united-swamp-showcase',
    'https://www.tcgplayer.com/product/279833/magic-dominaria-united-mountain-showcase',
    'https://www.tcgplayer.com/product/279834/magic-dominaria-united-forest-showcase',
    //Streets of New Capenna
    'https://www.tcgplayer.com/product/265356/magic-streets-of-new-capenna-mountain-279',
    //Kamigawa - Neon Dynasty
    'https://www.tcgplayer.com/product/257676/magic-kamigawa-neon-dynasty-plains-293-jp-full-art',
    'https://www.tcgplayer.com/product/257677/magic-kamigawa-neon-dynasty-plains-294-jp-full-art',
    'https://www.tcgplayer.com/product/257678/magic-kamigawa-neon-dynasty-island-295-jp-full-art',
    'https://www.tcgplayer.com/product/257679/magic-kamigawa-neon-dynasty-island-296-jp-full-art',
    'https://www.tcgplayer.com/product/257680/magic-kamigawa-neon-dynasty-swamp-297-jp-full-art',
    'https://www.tcgplayer.com/product/257681/magic-kamigawa-neon-dynasty-swamp-298-jp-full-art',
    'https://www.tcgplayer.com/product/257682/magic-kamigawa-neon-dynasty-mountain-299-jp-full-art',
    'https://www.tcgplayer.com/product/257685/magic-kamigawa-neon-dynasty-forest-302-jp-full-art',
    //Crimson Vow
    'https://www.tcgplayer.com/product/253433/magic-innistrad-crimson-vow-plains-268',
    'https://www.tcgplayer.com/product/253434/magic-innistrad-crimson-vow-plains-269',
    'https://www.tcgplayer.com/product/253429/magic-innistrad-crimson-vow-island-270',
    'https://www.tcgplayer.com/product/253430/magic-innistrad-crimson-vow-island-271',
    'https://www.tcgplayer.com/product/253435/magic-innistrad-crimson-vow-swamp-272',
    'https://www.tcgplayer.com/product/253436/magic-innistrad-crimson-vow-swamp-273',
    'https://www.tcgplayer.com/product/253431/magic-innistrad-crimson-vow-mountain-274',
    'https://www.tcgplayer.com/product/253432/magic-innistrad-crimson-vow-mountain-275',
    'https://www.tcgplayer.com/product/253427/magic-innistrad-crimson-vow-forest-276',
    'https://www.tcgplayer.com/product/253428/magic-innistrad-crimson-vow-forest-277',
    //Midnight Hunt
    'https://www.tcgplayer.com/product/246250/magic-innistrad-midnight-hunt-plains-268',
    'https://www.tcgplayer.com/product/246245/magic-innistrad-midnight-hunt-plains-269',
    'https://www.tcgplayer.com/product/246241/magic-innistrad-midnight-hunt-island-270',
    'https://www.tcgplayer.com/product/246246/magic-innistrad-midnight-hunt-island-271',
    'https://www.tcgplayer.com/product/246242/magic-innistrad-midnight-hunt-swamp-272',
    'https://www.tcgplayer.com/product/246247/magic-innistrad-midnight-hunt-swamp-273',
    'https://www.tcgplayer.com/product/246243/magic-innistrad-midnight-hunt-mountain-274',
    'https://www.tcgplayer.com/product/246248/magic-innistrad-midnight-hunt-mountain-275',
    'https://www.tcgplayer.com/product/246244/magic-innistrad-midnight-hunt-forest-276',
    'https://www.tcgplayer.com/product/246249/magic-innistrad-midnight-hunt-forest-277',
    //Zendikar Rising
    'https://www.tcgplayer.com/product/221825/magic-zendikar-rising-plains-268-full-art',
    'https://www.tcgplayer.com/product/221827/magic-zendikar-rising-island-270-full-art',
    'https://www.tcgplayer.com/product/221828/magic-zendikar-rising-island-271-full-art',
    'https://www.tcgplayer.com/product/221835/magic-zendikar-rising-mountain-275-full-art',
    'https://www.tcgplayer.com/product/221839/magic-zendikar-rising-forest-280-full-art',
    //Theros Beyond Death
    'https://www.tcgplayer.com/product/206022/magic-theros-beyond-death-plains',
    'https://www.tcgplayer.com/product/206025/magic-theros-beyond-death-mountain',
    'https://www.tcgplayer.com/product/206026/magic-theros-beyond-death-forest',
    'https://www.tcgplayer.com/product/206024/magic-theros-beyond-death-swamp',
    'https://www.tcgplayer.com/product/206023/magic-theros-beyond-death-island',
    //Hour of Devestation
    'https://www.tcgplayer.com/product/135049/magic-hour-of-devastation-plains-185-full-art',
    'https://www.tcgplayer.com/product/135048/magic-hour-of-devastation-mountain-188-full-art',
    'https://www.tcgplayer.com/product/135046/magic-hour-of-devastation-forest-189-full-art',
    'https://www.tcgplayer.com/product/135050/magic-hour-of-devastation-swamp-187-full-art',
    'https://www.tcgplayer.com/product/135047/magic-hour-of-devastation-island-186-full-art',
    //Amonkhet
    'https://www.tcgplayer.com/product/129689/magic-amonkhet-plains-250-full-art',
    'https://www.tcgplayer.com/product/129687/magic-amonkhet-island-251-full-art',
    'https://www.tcgplayer.com/product/129690/magic-amonkhet-swamp-252-full-art',
    'https://www.tcgplayer.com/product/129688/magic-amonkhet-mountain-253-full-art',
    'https://www.tcgplayer.com/product/129686/magic-amonkhet-forest-254-full-art',
    //Zendikar
    'https://www.tcgplayer.com/product/71495/magic-zendikar-plains-230-full-art',
    'https://www.tcgplayer.com/product/71497/magic-zendikar-plains-231-full-art',
    'https://www.tcgplayer.com/product/71499/magic-zendikar-plains-232-full-art',
    'https://www.tcgplayer.com/product/71501/magic-zendikar-plains-233-full-art',
    'https://www.tcgplayer.com/product/71479/magic-zendikar-island-234-full-art',
    'https://www.tcgplayer.com/product/71481/magic-zendikar-island-235-full-art',
    'https://www.tcgplayer.com/product/71483/magic-zendikar-island-236-full-art',
    'https://www.tcgplayer.com/product/71485/magic-zendikar-island-237-full-art',
    'https://www.tcgplayer.com/product/71503/magic-zendikar-swamp-238-full-art',
    'https://www.tcgplayer.com/product/71505/magic-zendikar-swamp-239-full-art',
    'https://www.tcgplayer.com/product/71507/magic-zendikar-swamp-240-full-art',
    'https://www.tcgplayer.com/product/71509/magic-zendikar-swamp-241-full-art',
    'https://www.tcgplayer.com/product/71487/magic-zendikar-mountain-242-full-art',
    'https://www.tcgplayer.com/product/71489/magic-zendikar-mountain-243-full-art',
    'https://www.tcgplayer.com/product/71491/magic-zendikar-mountain-244-full-art',
    'https://www.tcgplayer.com/product/71493/magic-zendikar-mountain-245-full-art',
    'https://www.tcgplayer.com/product/71470/magic-zendikar-forest-246-full-art',
    'https://www.tcgplayer.com/product/71472/magic-zendikar-forest-247-full-art',
    'https://www.tcgplayer.com/product/71473/magic-zendikar-forest-248-full-art',
    'https://www.tcgplayer.com/product/71474/magic-zendikar-forest-249-full-art',
    //WPN and Gateway Promos
    // 'https://www.tcgplayer.com/product/257552/magic-wpn-and-gateway-promos-plains-moonlit-land-foil-etched',
    // 'https://www.tcgplayer.com/product/257553/magic-wpn-and-gateway-promos-island-moonlit-land-foil-etched',
    // 'https://www.tcgplayer.com/product/257554/magic-wpn-and-gateway-promos-swamp-moonlit-land-foil-etched',
    // 'https://www.tcgplayer.com/product/257555/magic-wpn-and-gateway-promos-mountain-moonlit-land-foil-etched',
    // 'https://www.tcgplayer.com/product/257551/magic-wpn-and-gateway-promos-forest-moonlit-land-foil-etched',
    //Unstable
    'https://www.tcgplayer.com/product/151824/magic-unstable-plains',
    'https://www.tcgplayer.com/product/151825/magic-unstable-island',
    'https://www.tcgplayer.com/product/151826/magic-unstable-swamp',
    'https://www.tcgplayer.com/product/151827/magic-unstable-mountain',
    'https://www.tcgplayer.com/product/151828/magic-unstable-forest',
    //Unsanctioned
    'https://www.tcgplayer.com/product/208386/magic-unsanctioned-plains-full-art',
    'https://www.tcgplayer.com/product/208383/magic-unsanctioned-island-full-art',
    'https://www.tcgplayer.com/product/208384/magic-unsanctioned-swamp-full-art',
    'https://www.tcgplayer.com/product/208382/magic-unsanctioned-mountain-full-art',
    'https://www.tcgplayer.com/product/208379/magic-unsanctioned-forest-full-art',
    //Core Set 2021
    'https://www.tcgplayer.com/product/215509/magic-core-set-2021-plains-showcase',
    'https://www.tcgplayer.com/product/215360/magic-core-set-2021-island-showcase',
    'https://www.tcgplayer.com/product/215654/magic-core-set-2021-swamp-showcase',
    'https://www.tcgplayer.com/product/215544/magic-core-set-2021-mountain-showcase',
    'https://www.tcgplayer.com/product/215712/magic-core-set-2021-forest-showcase',
    //Double Masters
    'https://www.tcgplayer.com/product/218403/magic-double-masters-plains-373',
    'https://www.tcgplayer.com/product/218412/magic-double-masters-plains-374',
    'https://www.tcgplayer.com/product/218404/magic-double-masters-island-375',
    'https://www.tcgplayer.com/product/218411/magic-double-masters-island-376',
    'https://www.tcgplayer.com/product/218405/magic-double-masters-swamp-377',
    'https://www.tcgplayer.com/product/218410/magic-double-masters-swamp-378',
    'https://www.tcgplayer.com/product/218406/magic-double-masters-mountain-379',
    'https://www.tcgplayer.com/product/218409/magic-double-masters-mountain-380',
    'https://www.tcgplayer.com/product/218407/magic-double-masters-forest-381',
    'https://www.tcgplayer.com/product/218408/magic-double-masters-forest-382',
    //Battle for Zendikar
    // 'https://www.tcgplayer.com/product/104401/magic-battle-for-zendikar-plains-250-full-art',
    // 'https://www.tcgplayer.com/product/104402/magic-battle-for-zendikar-plains-251-full-art',
    // 'https://www.tcgplayer.com/product/104403/magic-battle-for-zendikar-plains-252-full-art',
    // 'https://www.tcgplayer.com/product/104404/magic-battle-for-zendikar-plains-253-full-art',
    // 'https://www.tcgplayer.com/product/104405/magic-battle-for-zendikar-plains-254-full-art',
    // 'https://www.tcgplayer.com/product/104391/magic-battle-for-zendikar-island-255-full-art',
    // 'https://www.tcgplayer.com/product/104392/magic-battle-for-zendikar-island-256-full-art',
    // 'https://www.tcgplayer.com/product/104393/magic-battle-for-zendikar-island-257-full-art',
    // 'https://www.tcgplayer.com/product/104394/magic-battle-for-zendikar-island-258-full-art',
    // 'https://www.tcgplayer.com/product/104395/magic-battle-for-zendikar-island-259-full-art',
    // 'https://www.tcgplayer.com/product/104406/magic-battle-for-zendikar-swamp-260-full-art',
    // 'https://www.tcgplayer.com/product/104407/magic-battle-for-zendikar-swamp-261-full-art',
    // 'https://www.tcgplayer.com/product/104408/magic-battle-for-zendikar-swamp-262-full-art',
    // 'https://www.tcgplayer.com/product/104409/magic-battle-for-zendikar-swamp-263-full-art',
    // 'https://www.tcgplayer.com/product/104410/magic-battle-for-zendikar-swamp-264-full-art',
    // 'https://www.tcgplayer.com/product/104396/magic-battle-for-zendikar-mountain-265-full-art',
    // 'https://www.tcgplayer.com/product/104397/magic-battle-for-zendikar-mountain-266-full-art',
    // 'https://www.tcgplayer.com/product/104398/magic-battle-for-zendikar-mountain-267-full-art',
    // 'https://www.tcgplayer.com/product/104399/magic-battle-for-zendikar-mountain-268-full-art',
    // 'https://www.tcgplayer.com/product/104400/magic-battle-for-zendikar-mountain-269-full-art',
    // 'https://www.tcgplayer.com/product/104386/magic-battle-for-zendikar-forest-270-full-art',
    // 'https://www.tcgplayer.com/product/104387/magic-battle-for-zendikar-forest-271-full-art',
    // 'https://www.tcgplayer.com/product/104388/magic-battle-for-zendikar-forest-272-full-art',
    // 'https://www.tcgplayer.com/product/104389/magic-battle-for-zendikar-forest-273-full-art',
    // 'https://www.tcgplayer.com/product/104390/magic-battle-for-zendikar-forest-274-full-art',
    //Kaldheim
    'https://www.tcgplayer.com/product/230147/magic-kaldheim-snow-covered-plains-276',
    'https://www.tcgplayer.com/product/230099/magic-kaldheim-snow-covered-plains-277',
    'https://www.tcgplayer.com/product/230148/magic-kaldheim-snow-covered-island-278',
    'https://www.tcgplayer.com/product/230100/magic-kaldheim-snow-covered-island-279',
    'https://www.tcgplayer.com/product/230149/magic-kaldheim-snow-covered-swamp-280',
    'https://www.tcgplayer.com/product/230101/magic-kaldheim-snow-covered-swamp-281',
    'https://www.tcgplayer.com/product/230150/magic-kaldheim-snow-covered-mountain-282',
    'https://www.tcgplayer.com/product/230103/magic-kaldheim-snow-covered-mountain-283',
    'https://www.tcgplayer.com/product/230146/magic-kaldheim-snow-covered-forest-284',
    'https://www.tcgplayer.com/product/230105/magic-kaldheim-snow-covered-forest-285'
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



