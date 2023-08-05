const { getYmdHms, mapToObj, each, isEmpty } = require('medash');

module.exports = (totals = []) => {
    const yearMap = new Map()
    totals.forEach((t) => {
        const { logs = [] } = t
        logs.forEach(log => {
            if(isEmpty(log))return
            const { stats: { endTime, kmDistance } } = log
            const { year } = getYmdHms(endTime);
            const mapValue = yearMap.get(year);
            if (mapValue) {
                yearMap.set(year, mapValue + kmDistance);
                return
            }
            yearMap.set(year, kmDistance);
        })
    })
    let keepRunningTotals = [];
    each(mapToObj(yearMap), (key, value) => {
        keepRunningTotals.push({ year: key, kmDistance:  Math.ceil(value) });
    })
    return keepRunningTotals.sort((a, b) => {
        return b.year - a.year;
    });
}