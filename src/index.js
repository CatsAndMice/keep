const login = require('./login');
const getRecentUpdates = require('./getRecentUpdates');
const getRunTotal = require('./run');
const getCycleTotal = require('./cycling');
const { isEmpty, toArray } = require("medash");
require('dotenv').config();

const query = {
    token: '',
    date: 0
}

const two = 2 * 24 * 60 * 60 * 1000


const data = { mobile: process.env.MOBILE, password: process.env.PASSWORD };

const getFirstPageRecentUpdates = async () => {
    const diff = Math.abs(Date.now() - query.date);
    if (diff > two) {
        const token = await login(data);
        query.token = token;
        query.date = Date.now();
    }

    return await getRecentUpdates(query.token);
    // return {k:1}
}

const getTotal = async () => {
    const diff = Math.abs(Date.now() - query.date);
    if (diff > two) {
        const token = await login(data);
        query.token = token;
        query.date = Date.now();
    }
    const result = await Promise.all([getRunTotal(query.token), getCycleTotal(query.token)])
    const yearMap = new Map();
    if (isEmpty(result)) return;
    if (isEmpty(result[0])) return;
    result[0].forEach(r => {
        const { year, kmDistance } = r;
        const mapValue = yearMap.get(year);
        if (mapValue) {
            mapValue.year = year
            mapValue.data.runKmDistance = kmDistance
        } else {
            yearMap.set(year, {
                year, data: {
                    runKmDistance: kmDistance,
                    cycleKmDistance: 0
                }
            })
        }
    })
    if (isEmpty(result[1])) return;
    result[1].forEach(r => {
        const { year, kmDistance } = r;
        const mapValue = yearMap.get(year);
        if (mapValue) {
            mapValue.year = year
            mapValue.data.cycleKmDistance = kmDistance
        } else {
            yearMap.set(year, {
                year, data: {
                    runKmDistance: 0,
                    cycleKmDistance: kmDistance
                }
            })
        }
    })
    return toArray(yearMap.values())
}





module.exports = {
    getFirstPageRecentUpdates,
    getTotal
}


