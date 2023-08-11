
(async () => {
    $.ajax({
        url: 'http://127.0.0.1:3000/total',
        dataType: 'json',
        success(result) {
            console.log(result);
            const { code, data = [] } = result
            if (code === 200) {
                let cycling = 0,
                    running = 0;

                data.forEach(d => {
                    const { data: { cycleKmDistance, runKmDistance } } = d
                    cycling += cycleKmDistance
                    running += runKmDistance
                });

                $('#cycling').text(`骑行${cycling}km`)
                $('#running').text(`跑步${running}km`)
            }
        }
    })

    $.ajax({
        url: 'http://127.0.0.1:3000/recent-updates',
        dataType: 'json',
        success(result) {
            const { code, data = [] } = result
            if (code === 200) {
                let str = `<div style="padding-top:20px; color: #00bc71; margin: 20px 0;
                font-size: 25px;">最新动态</div>`
                const type = {}
                data.forEach(d => {
                    const { date } = d
                    const year = parseInt(date)
                    const typeValue = type[`${year}`]
                    if (typeValue) {
                        typeValue.push(d)
                    } else {
                        type[`${year}`] = [d]
                    }
                });
                console.log(type);
                const keys = Array.from(Object.keys(type)).sort((a, b) => b - a)
                keys.forEach(k => {
                    const values = type[k];
                    let dataStr = ''
                    values.forEach((v) => {
                        const { date, data } = v
                        dataStr += `<div>
                                    ${date.replace(`${k}年`, '') +'，'+ data.map(dt => dt).join('、')}
                                    </div ><br>`
                    })
                    str += `<div style="display:flex;margin-bottom:30px;color: #3f3f3f;font-size:14px"> <div style="width:50px;">${k}</div><div>${dataStr}</div></div>`
                })
                $('#recent-updates').html(str)
            }
        }
    })
})()