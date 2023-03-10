//Filters the data based off the options configured by user
const filterData = (data, filters) => {
    if(filters['maxShippingPerItem']) {
        for(datum in data) {
            if(data[datum]['Shipping Per Item'] > filters['maxShippingPerItem']) {
                delete data[datum];
            }
        }
    }
    return data;
}

module.exports.filterData = filterData;