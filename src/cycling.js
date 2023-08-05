const getCycling = require('./getCycling');
const getAllLogs = require('./getAllLogs');
const getYearTotal = require('./getYearTotal');

module.exports = async (token) => {
    const result = await getCycling(token)
    const allCycling = await getAllLogs(token, result, getCycling);
    const yearCycling = getYearTotal(allCycling)
    return yearCycling
}