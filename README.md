# mtgscrape

What Does this Do?:

Sellers on TCG player often have some low-priced cards to bring in traffic while the rest of their inventory is above market value. Trying to find the best price for a bundle of cards is difficult and time-consuming because of this. This program takes a list of cards (their URLs on TCG Player), allows you to configure the quality, type, and quantity you are searching for, and then finds shops that carry multiple cards in your search that have low prices. Combined with the shipping information it provides to you, you can narrow down your search to the best possible price pretty effectively.

Getting Started:

1. Have Node.js
2. Copy down the repo
3. Navigate to repo in console and `npm install` and then `node index.js`

Configuring:

1. Within `index.js`, near the top are options that you can configure
2. Within `cardurls.js` put in the list of cards that you want -> you will have to navigate to card pages on tcgplayer and paste the urls here
3. Other options have instructions on them, can leave as is or fiddle with them if so desired
4. Results are printed in the console as well as to the results.js file
