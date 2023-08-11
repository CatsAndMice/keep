const express = require('express');
const { getTotal, getFirstPageRecentUpdates } = require("./src")
const { to } = require('await-to-js')
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
    const [err,result] = await to(getFirstPageRecentUpdates()) 
    if (result) {
        res.send(JSON.stringify({ code: 200, data: result, msg: '请求成功' }));
        return
    }
    res.send(JSON.stringify({ code: 400, data: null, msg: '请求失败' }));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})