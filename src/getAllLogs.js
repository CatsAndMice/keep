
const getRunning = require('./getRunning');
const { isEmpty } = require('medash');

module.exports = async (token, firstResult, callback) => {
    if (isEmpty(firstResult)||isEmpty(token)) {
        console.warn('请求中断');
        return;
    }
    
    let { lastTimestamp, records = [] } = firstResult;
    while (1) {
        if (isEmpty(lastTimestamp)) break;
        const result = await callback(token, lastTimestamp)
        // console.log(result);
        if (isEmpty(result)) break;
        const { lastTimestamp: lastTime, records: nextRecords } = result
        records.push(...nextRecords);
        if (isEmpty(lastTime)) break;
        lastTimestamp = lastTime
    }
    return records
}