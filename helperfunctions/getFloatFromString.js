//Returns the float found in the argument string
const getFloatFromString = (string) => {
    return parseFloat(string.replace( /[^\d.]/g, '' ));
}

module.exports.getFloatFromString = getFloatFromString;