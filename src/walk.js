const getWalking = require('./getWalking');
const getAllLogs = require('./getAllLogs');
const getYearTotal = require('./getYearTotal');

module.exports = async (token) => {
    const result = await getWalking(token,0)
    // console.log(result);
    // const result1 = await getWalking(token,1687104000000)
    // console.log(result1);
    // 获取全部的跑步数据
    // const allWalking = await getAllLogs(token, result, getWalking);
    // console.log(allWalking);
    // // 按年份计算跑步运动量
    // const yearWalking = getYearTotal(allWalking)
    // console.log(yearWalking);
    // return yearWalking
}