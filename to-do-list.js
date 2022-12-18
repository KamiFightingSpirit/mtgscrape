

/*
    TO DO:
        15. There isn't really a tie out between quantity/price and the item which is annoying
        16. Export Options?
        19. Max quant for TCG shop is kinda busted -> It needs to know when it has seen a different card (it will count over the maxQUant per card)
        23. Results should really be an object holding multiple shop classes with TCG shop extending class and overriding some methods.
        24. Could build out HTML based off the results, doubt worth (UI feels like overkill)
        

    DONE:
        7. Ability to pass in url parameters as options, such as near mint, foil (could edit the url directly instead of use puppeteer)
            a. have a URL builder
        14. provide links to shops?
        20. Test if you can avoid dropping down the 50 and item price only on 2nd item (would speed up the app) -> can and updated
        25. Make the results a valid json object
*/  