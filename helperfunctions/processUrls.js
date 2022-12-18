const processUrls = (urls, urlOptions) => {
    urls = urls.map((url) => {
        url = url.slice(0, url.indexOf('?')) + '?Language=English';
        
        // Sets Foil and/or Non-Foil URL Parameters
        if(urlOptions['Show Non-Foil'] && urlOptions['Show Foil']) {
            url = url + '&Printing=Foil|Normal';
        } else if(urlOptions['Show Non-Foil']) {
            url = url + '&Printing=Normal';
        } else if(urlOptions['Show Foil']) {
            url = url + '&Printing=Foil';
        }
        
        // Sets Quality Parameters
        let qOptions = urlOptions['Quality'];
        let seenOption = false;
        for(option in qOptions) {
            if(qOptions[option] === true) {
                if(!seenOption) {
                    url += "&Condition=" + translateVal(option);
                    seenOption = true;
                } else {
                    url += '|' + translateVal(option);
                }
            }
        }
        return url;
    })
    return urls;
}

function translateVal(option) {
    let returnVal = "";
    switch(option) {
        case 'Show Near Mint':
            returnVal = "Near+Mint";
            break;
        case 'Show Lightly Played':
            returnVal = "Lightly+Played";
            break;
        case 'Show Moderately Played':
            returnVal = "Moderately+Played";
            break;
        case 'Show Heavily Played':
            returnVal = "Heavily+Played";
            break;
        case 'Show Damaged':
            returnVal = "Damaged";
            break;
    }
    return returnVal
}


module.exports.processUrls = processUrls;