# 用Node.js吭哧吭哧撸一个运动主页

## 简单唠唠

某乎问题：人这一生，应该养成哪些好习惯？

问题链接：[https://www.zhihu.com/question/460674063](https://www.zhihu.com/question/460674063) 

如果我来回答肯定会有**定期运动**的字眼。

平日里也有煅练的习惯，时间久了后一直想把运动数据公开，可惜某运动软件未开放公共的接口出来。

幸运的是，在Github平台冲浪我发现了有同行和我有类似的想法，并且已经用Python实现了他自己的运动主页。

项目链接：[https://github.com/yihong0618/running_page](https://github.com/yihong0618/running_page)

Python嘛简单，看明白后用Node.js折腾一波，自己撸两个接口玩玩。

完成的运动页面挂在我的博客网址。
![](https://files.mdnice.com/user/38618/ff756bdb-4444-4e91-aa90-875f4cc7f6a3.png)
![](https://files.mdnice.com/user/38618/94e3062e-ec1c-4e4d-93dc-18eef8f63420.png)

我的博客：[https://www.linglan01.cn](https://www.linglan01.cn/c/keep/index.html)

我的运动主页：[https://www.linglan01.cn/c/keep/index.html](https://www.linglan01.cn/c/keep/index.html)

Github地址：[https://github.com/CatsAndMice/keep](https://github.com/CatsAndMice/keep)

## 梳理思路

平时跑步、骑行这两项活动多，所以我只需要调用这两个接口，再调用这两个接口前需要先登录获取到token。

```Bash
1. 登陆接口: https://api.gotokeep.com/v1.1/users/login 
   请求方法:post   
   Content-Type: "application/x-www-form-urlencoded;charset=utf-8"

2. 骑行数据接口：https://api.gotokeep.com/pd/v3/stats/detail?dateUnit=all&type=cycling&lastDate={last_date}
   请求方法: get   
   Content-Type: "application/x-www-form-urlencoded;charset=utf-8"
   Authorization：`Bearer ${token}`
   
3. 跑步数据接口：https://api.gotokeep.com/pd/v3/stats/detail?dateUnit=all&type=running&lastDate={last_date}
   请求方法: get   
   Content-Type: "application/x-www-form-urlencoded;charset=utf-8"
   Authorization：`Bearer ${token}`
```

Node.js服务属于代理层，解决跨域问题并再对数据包裹一层逻辑处理，最后发给客户端。

![](https://files.mdnice.com/user/38618/a0ee38b8-b1e8-43b9-a47f-d639045ba47b.png)

不明白代理的同学可以看看这篇《Nginx之正、反向代理》

文章链接：[https://linglan01.cn/post/47](https://linglan01.cn/post/47)

## 运动数据总和

请求跑步接口方法：

`getRunning.js`文件链接[https://github.com/CatsAndMice/keep/blob/master/src/getRunning.js](https://github.com/CatsAndMice/keep/blob/master/src/getRunning.js)

```JavaScript
const { headers } = require('./config');
const { isEmpty } = require("medash");
const axios = require('axios');

module.exports = async (token, last_date = 0) => {
    if (isEmpty(token)) return {}
    headers["Authorization"] = `Bearer ${token}`;
    const result = await axios.get(`https://api.gotokeep.com/pd/v3/stats/detail?dateUnit=all&type=running&lastDate=${last_date}`, { headers })
    if (result.status === 200) {
        const { data: loginResult } = result;
        return loginResult.data;
    }

    return {};
}
```

请求骑行接口方法：

`getRunning.js`文件链接 [https://github.com/CatsAndMice/keep/blob/master/src/getCycling.js](https://github.com/CatsAndMice/keep/blob/master/src/getCycling.js)

```JavaScript
const { headers } = require('./config');
const { isEmpty } = require("medash");
const axios = require('axios');

module.exports = async (token, last_date = 0) => {
    if (isEmpty(token)) return {}
    headers["Authorization"] = `Bearer ${token}`;
    const result = await axios.get(`https://api.gotokeep.com/pd/v3/stats/detail?dateUnit=all&type=cycling&lastDate=${last_date}`, { headers })
    if (result.status === 200) {
        const { data: loginResult } = result;
        return loginResult.data;
    }

    return {};
}
```

现在要计算跑步、骑行的总数据，因此需要分别请求跑步、骑行的接口获取到所有的数据。

`getAllLogs.js`文件链接[https://github.com/CatsAndMice/keep/blob/master/src/getAllLogs.js](https://github.com/CatsAndMice/keep/blob/master/src/getAllLogs.js)

```JavaScript
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
        if (isEmpty(result)) break;
        const { lastTimestamp: lastTime, records: nextRecords } = result
        records.push(...nextRecords);
        if (isEmpty(lastTime)) break;
        lastTimestamp = lastTime
    }
    return records
}
```

一个`while`循环干到底，所有的数据都会被`push`到`records`数组中。

返回的`records`数据再按年份分类计算某年的总骑行数或总跑步数，使用`Map`做这类事别提多爽了。

`getYearTotal.js`文件链接 [https://github.com/CatsAndMice/keep/blob/master/src/getYearTotal.js](https://github.com/CatsAndMice/keep/blob/master/src/getYearTotal.js)

```JavaScript
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
```

处理过后的数据是这样子的：

```JSON
[
  {year:2023,kmDistance:99},
  {year:2022,kmDistance:66},
  //...
]
```

计算跑步、骑行的逻辑，唯一的变量为请求接口方法的不同，`getAllLogs.js、getYearTotal.js`我们可以复用。

骑行计算总和：

`cycling.js`文件链接[https://github.com/CatsAndMice/keep/blob/master/src/cycling.js](https://github.com/CatsAndMice/keep/blob/master/src/cycling.js)

```JavaScript
const getCycling = require('./getCycling');
const getAllLogs = require('./getAllLogs');
const getYearTotal = require('./getYearTotal');

module.exports = async (token) => {
    const result = await getCycling(token)
    const allCycling = await getAllLogs(token, result, getCycling);
    const yearCycling = getYearTotal(allCycling)
    return yearCycling
}
```

跑步计算总和：

`run.js`文件链接 [https://github.com/CatsAndMice/keep/blob/master/src/run.js](https://github.com/CatsAndMice/keep/blob/master/src/run.js)

```JavaScript
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
```

最后一步，骑行、跑步同年份数据汇总。

`src/index.js`文件链接[https://github.com/CatsAndMice/keep/blob/master/src/index.js](https://github.com/CatsAndMice/keep/blob/master/src/index.js)

```JavaScript
const login = require('./login');
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
const getTotal = async () => {
    const diff = Math.abs(Date.now() - query.date);
    if (diff > two) {
        const token = await login(data);
        query.token = token;
        query.date = Date.now();
    }
    //Promise.all并行请求
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
    getTotal
}

```

`getTotal`方法会将跑步、骑行数据汇总成这样：

```JSON
[
  {
     year:2023,
     runKmDistance: 999,//2023年，跑步总数据
     cycleKmDistance: 666//2023年，骑行总数据
  },
  {
     year:2022,
     runKmDistance: 99,
     cycleKmDistance: 66
  },
  //...
]
```

每次调用`getTotal`方法都会调用`login`方法获取一次token。这里做了一个优化，获取的token会被缓存2天省得每次都调，调多了登陆接口会出问题。

```JavaScript
//省略
const query = {
    token: '',
    date: 0
}
const two = 2 * 24 * 60 * 60 * 1000
const data = { mobile: process.env.MOBILE, password: process.env.PASSWORD };
const getTotal = async () => {
    const diff = Math.abs(Date.now() - query.date);
    if (diff > two) {
        const token = await login(data);
        query.token = token;
        query.date = Date.now();
    }
   //省略   
}

//省略
```

## 最新动态

骑行、跑步接口都只请求一次，同年同月同日的骑行、跑步数据放在一起，最后按`endTime`字段的时间倒序返回结果。

`getRecentUpdates.js`文件链接 [https://github.com/CatsAndMice/keep/blob/master/src/getRecentUpdates.js](https://github.com/CatsAndMice/keep/blob/master/src/getRecentUpdates.js)

```JavaScript
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
```

得到的数据是这样的：

```JSON
[
  {
    date: '2023年8月12',
    endTime: 1691834351501,
    data: [
        '户外跑步 99km',
        '户外骑行 99km'
    ]
  },
  //...
]
```

同样的要先获取token，在`src/index.js`文件：

```JavaScript
const login = require('./login');
const getRecentUpdates = require('./getRecentUpdates');
//省略
const getFirstPageRecentUpdates = async () => {
    const diff = Math.abs(Date.now() - query.date);
    if (diff > two) {
        const token = await login(data);
        query.token = token;
        query.date = Date.now();
    }

    return await getRecentUpdates(query.token);
}

//省略
```

最新动态这个接口还是简单的。

## express创建接口

运动主页由于我要将其挂到我的博客，因为端口不同会出现跨域问题，所以要开启跨源资源共享（CORS）。

```JavaScript
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Content-Type', 'application/json;charset=utf8');
    next();
})
```

另外，我的博客网址使用的是https协议，Node.js服务也需要升级为https，否则会请求出错。以前写过一篇文章介绍Node.js升级https协议，不清楚的同学可以看看这篇《Node.js搭建Https服务 》文章链接[https://linglan01.cn/post/47](https://linglan01.cn/post/47)。

`index.js`文件链接[https://github.com/CatsAndMice/keep/blob/master/index.js](https://github.com/CatsAndMice/keep/blob/master/index.js)

```JavaScript
const express = require('express');
const { getTotal, getFirstPageRecentUpdates } = require("./src")
const { to } = require('await-to-js');
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = express();
const port = 3000;
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Content-Type', 'application/json;charset=utf8');
    next();
})
app.get('/total', async (req, res) => {
    const [err, result] = await to(getTotal())
    if (result) {
        res.send(JSON.stringify({ code: 200, data: result, msg: '请求成功' }));
        return
    }
    res.send(JSON.stringify({ code: 400, data: null, msg: '请求失败' }));
})
app.get('/recent-updates', async (req, res) => {
    const [err, result] = await to(getFirstPageRecentUpdates())
    if (result) {
        res.send(JSON.stringify({ code: 200, data: result, msg: '请求成功' }));
        return
    }
    res.send(JSON.stringify({ code: 400, data: null, msg: '请求失败' }));
})
const options = {
    key: fs.readFileSync(path.join(__dirname, './ssl/9499016_www.linglan01.cn.key')),
    cert: fs.readFileSync(path.join(__dirname, './ssl/9499016_www.linglan01.cn.pem')),
};
const server = https.createServer(options, app);
server.listen(port, () => {
    console.log('服务已开启');
})
```

## 最后的话

贵在坚持，做好「简单而正确」的事情，坚持是一项稀缺的能力，不仅仅是运动、写文章，在其他领域，也是如此。

这段时间对投资、理财小有研究，坚持运动也是一种对身体健康的投资。

又完成了一篇文章，奖励自己一顿火锅。
![](https://files.mdnice.com/user/38618/f8c8c8a8-0d97-4fac-a89c-43fbdf34e989.png)
如果我的文章对你有帮助，您的👍就是对我的最大支持^_^。

更多文章：[http://linglan01.cn/about](http://linglan01.cn/about)

