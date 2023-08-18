const express = require('express');
const { getTotal, getFirstPageRecentUpdates } = require("./src")
const { to } = require('await-to-js');
const https = require('https');
const path = require('path');
const fs = require('node:fs')
const app = express();
const port = 3000;

const htmlPath = path.join(__dirname, './client');
const contentType = {
    '.js': 'application/javascript;charset=utf8'
}
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

app.all('/src/*', (req, res) => {
    const { url } = req;
    const filePath = htmlPath + url;
    const extname = path.extname(filePath);
    res.setHeader('Content-Type', contentType[extname]);
    const content = fs.readFileSync(filePath);
    res.send(content);
})

app.get('/', async (req, res) => {
    res.setHeader('Content-Type', 'text/html;charset=utf8');
    const readHtmlPath = htmlPath + '/index.html'
    const html = fs.readFileSync(readHtmlPath)
    res.send(html)
})


const options = {
    key: fs.readFileSync(path.join(__dirname, './ssl/9499016_www.linglan01.cn.key')),
    cert: fs.readFileSync(path.join(__dirname, './ssl/9499016_www.linglan01.cn.pem')),
};
const server = https.createServer(options, app);


server.listen(port, () => {
    console.log('服务已开启');
})