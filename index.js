const express = require('express');
const { getTotal, getFirstPageRecentUpdates } = require("./src")
const { to } = require('await-to-js');
const path = require('path');
const fs = require('node:fs')
const app = express();
const port = 3000;

const htmlPath = path.join(__dirname, './client');
const contentType = {
    '.js': 'application/javascript;charset=utf8'
}
app.use((req, res, next) => {
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
    console.log(err);
    if (result) {
        res.send(JSON.stringify({ code: 200, data: result, msg: '请求成功' }));
        return
    }
    res.send(JSON.stringify({ code: 400, data: null, msg: '请求失败' }));
})

app.all('/src/*', (req, res) => {
    const { url } = req;
    const filePath = htmlPath + url;
    if (fs.existsSync(filePath)) {
        const extname = path.extname(filePath);
        res.setHeader('Content-Type', contentType[extname]);
        const content = fs.readFileSync(filePath);
        res.send(content);
        return
    }
    res.sendStatus('404')
})

app.get('/', async (req, res) => {
    res.setHeader('Content-Type', 'text/html;charset=utf8');
    const readHtmlPath = htmlPath + '/index.html'
    const html = fs.readFileSync(readHtmlPath)
    res.send(html)
})

app.listen(port, () => {
    console.log('服务已开启');
})