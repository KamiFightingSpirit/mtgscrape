const { moneyRound } = require('./moneyRound');

const processData = (shopName, itemName, price, quant, shippingPolicy, gatheredData, minPrice) => {
    if(shippingPolicy === 50) { 
        //Shop is TCG Direct and can share inventory
        if('TCG Shop' in gatheredData) {
          //requires update to data
            let shop = gatheredData['TCG Shop'];
            shop['Shop Names'][shopName] = shopName; 
            shop['Item Names'][itemName] = itemName;
            shop['Price'].push(price);
            shop['Lowest Price Available'].push(minPrice);
            shop['Quantities'].push(quant);
            shop['Total Cost'] = moneyRound(shop['Total Cost'] + price * quant);        
            shop['Total Quant'] += quant;    
            shop['Cost over Market Minimum Per Item'].push(moneyRound((price - minPrice) * quant));
            shop['Cart Cost over Market Minimum'] = moneyRound(shop['Cart Cost over Market Minimum'] + (price - minPrice) * quant);
        } else {
            //have encountered a TCG Direct shop for the first time
            gatheredData['TCG Shop'] = {
                'Shop Names': {
                    [shopName]: shopName
                },
                'Item Names': {
                    [itemName]: itemName
                },
                'Price': [price],
                'Lowest Price Available': [minPrice],
                'Quantities': [quant],
                'Total Quant': quant,
                'Total Shipping': 'Free if order over $50',
                'Total Cost': moneyRound(price * quant),
                'Cost over Market Minimum Per Item': [moneyRound((price - minPrice) * quant)],
                'Cart Cost over Market Minimum': moneyRound((price - minPrice) * quant)
            }
        }
    } else if(shopName in gatheredData) {
        //requires update to data
        let shop = gatheredData[shopName];
        shop['Item Names'].push(itemName);
        shop['Price'].push(price);
        shop['Lowest Price Available'].push(minPrice);
        shop['Quantities'].push(quant);
        shop['Total Cost'] = moneyRound(shop['Total Cost'] + price * quant);        
        shop['Total Quant'] += quant;
        shop['Shipping Per Item'] = moneyRound(shippingPolicy / shop['Total Quant']);
        shop['Cost over Market Minimum Per Item'].push(moneyRound((price - minPrice) * quant));
        shop['Cart Cost over Market Minimum'] = moneyRound(shop['Cart Cost over Market Minimum'] + (price - minPrice) * quant);

    } else {
        //encountered shop for the first time
        gatheredData[shopName] = {
                'Item Names': [itemName],
                'Price': [price],
                'Lowest Price Available': [minPrice],
                'Quantities': [quant],
                'Total Quant': quant,
                'Total Cost': moneyRound(price * quant),
                'Total Shipping': shippingPolicy,
                'Shipping Per Item': moneyRound(shippingPolicy / quant),
                'Cost over Market Minimum Per Item': [moneyRound((price - minPrice) * quant)],
                'Cart Cost over Market Minimum': (moneyRound(price - minPrice) * quant)
            }
    }
    return gatheredData;
}

module.exports.processData = processData;