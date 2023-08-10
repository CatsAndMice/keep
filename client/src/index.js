
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
                let str = ''
                data.slice(0, 30).forEach(d => {
                    const { date, data: result } = d
                    str += `<p>${date}${result.map(dt => dt).join('、')}</p>`
                });
                $('#recent-updates').html(str)
            }
        }
    })
})()