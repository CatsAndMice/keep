
(async () => {
    $.ajax({
        url: 'http://127.0.0.1:3000/total',
        dataType: 'json',
        success(result) {
            console.log(result);
            const { code, data = [] } = result
            if (code === 200) {
                let str = ''
                console.log(data);
                data.forEach(d => {
                    const { year, data: { cycleKmDistance, runKmDistance } } = d
                    str += `<dl>
                        <dt class="content-title"><strong>${year}</strong></dt>
                        ${cycleKmDistance ? `<dd class="content-dd">骑行${cycleKmDistance}km</dd>` : ''}
                        ${runKmDistance ? `<dd class="content-dd">跑步${runKmDistance}km</dd>` : ''}
                    </dl>`
                });

                $('.total').html(str)
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
                $('.recent-updates').html(str)
            }
        }
    })
})()