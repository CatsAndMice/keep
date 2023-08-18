const getRunning = require('./getRunning');
const getCycling = require('./getCycling');
const { isEmpty, getYmdHms, toArray } = require('medash');

module.exports = async (token) => {
    if (isEmpty(token)) return
    const recentUpdateMap = new Map();
    const result = await Promise.all([getRunning(token), getCycling(token)]);
    result.forEach((r) => {
        if (isEmpty(r)) return;
        const records = r.records || [];
        if (isEmpty(r.records)) return;
        records.forEach(rs => {
            rs.logs.forEach(l => {
                const { stats } = l;
                if (isEmpty(stats)) return;
                // 运动距离小于1km 则忽略该动态
                if (stats.kmDistance < 1) return;
                const { year, month, date, } = getYmdHms(stats.endTime);
                const key = `${year}年${month + 1}月${date}日`;
                const mapValue = recentUpdateMap.get(key);
                const value = `${stats.name} ${stats.kmDistance}km`;
                if (mapValue) {
                    mapValue.data.push(value)
                } else {
                    recentUpdateMap.set(key, {
                        date: key,
                        endTime: stats.endTime,
                        data: [
                            value
                        ]
                    });
                }
            })
        })
    })

    return toArray(recentUpdateMap.values()).sort((a, b) => {
        return b.endTime - a.endTime
    })

}