const getRunning = require('./getRunning');
const getAllRunning = require('./getAllLogs');
const getYearTotal = require('./getYearTotal');

module.exports = async (token) => {
    const result = await getRunning(token)
    // 获取全部的跑步数据
    const allRunning = await getAllRunning(token, result, getRunning);
    // 按年份计算跑步运动量
    const yearRunning = getYearTotal(allRunning)
    return yearRunning
}