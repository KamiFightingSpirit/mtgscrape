const { moneyRound } = require('./helperfunctions/moneyRound');

const processData = (shopName, itemName, price, quant, shippingPolicy, gatheredData) => {
    if(shippingPolicy === 50) { 
        //Shop is TCG Direct and can share inventory
        if('tcgShop' in gatheredData) {
          //requires update to data
            let shop = gatheredData['tcgShop'];
            shop['shopNames'][shopName] = shopName; 
            shop['itemNames'][itemName] = itemName;
            shop['price'].push(price); 
            shop['quantities'].push(quant);
            shop['totalPrice'] += moneyRound(price * quant);        
            shop['totalQuant'] += quant;    
        } else {
            //have encountered a TCG Direct shop for the first time
            gatheredData['tcgShop'] = {
                'shopNames': {
                    [shopName]: shopName
                },
                'itemNames': {
                    [itemName]: itemName
                },
                'price': [price],
                'quantities': [quant],
                'totalQuant': quant,
                'shippingPolicy': shippingPolicy,
                'totalPrice': moneyRound(price * quant),
                'shippingPerItem': 0
            }
        }
    } else if(shopName in gatheredData) {
        //requires update to data
        let shop = gatheredData[shopName];
        shop['itemNames'].push(itemName);
        shop['price'].push(price);
        shop['quantities'].push(quant);
        shop['totalPrice'] += moneyRound(price * quant);        
        shop['totalQuant'] += quant;
        shop['shippingPerItem'] = moneyRound(shippingPolicy / shop['totalQuant']);
    } else {
        //encountered shop for the first time
        gatheredData[shopName] = {
                'itemNames': [itemName],
                'price': [price],
                'quantities': [quant],
                'totalQuant': quant,
                'shippingPolicy': shippingPolicy,
                'totalPrice': moneyRound(price * quant),
                'shippingPerItem': moneyRound(shippingPolicy / quant)
            }
    }
    return gatheredData;
}

module.exports.processData = processData;