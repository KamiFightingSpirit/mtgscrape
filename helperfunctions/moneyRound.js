//Rounds to the nearest 100th place
const moneyRound = (num) => {
    return Math.ceil(num * 100) / 100;
}

module.exports.moneyRound = moneyRound;