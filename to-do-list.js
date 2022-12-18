

/*
    TO DO:
        7. Ability to pass in url parameters as options, such as near mint, foil (could edit the url directly instead of use puppeteer)
            a. have a URL builder
        14. provide links to shops?
        15. There isn't really a tie out between quantity/price and the item which is annoying
        16. Export Options?
        19. Max quant for TCG shop is kinda busted -> It needs to know when it has seen a different card (it will count over the maxQUant per card)
        20. Test if you can avoid dropping down the 50 and item price only on 2nd item (would speed up the app)
        23. Results should really be an object holding multiple shop classes with TCG shop extending class and overriding some methods.
        

    DONE:
        17. Add max quant option
        18. Have a min price array so that you can see what the lowest price was for each item
        21. Fix the way the keys look in results.
        22. Add in a way to see how much the cart would cost above the market minimum
*/  