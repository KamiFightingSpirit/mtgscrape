//Filters the data based off the options configured by user
const filterData = (data, filters) => {
    if(filters['minQuant']) {
        for(datum in data) {
            if(data[datum]['totalQuant'] < filters['minQuant']) {
                delete data[datum];
            }
        }
    }
    if(filters['maxShippingPerItem']) {
        for(datum in data) {
            if(data[datum]['shippingPerItem'] > filters['maxShippingPerItem']) {
                delete data[datum];
            }
        }
    }
    return data;
}

module.exports.filterData = filterData;