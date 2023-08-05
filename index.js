const express = require('express');
const { getTotal, getFirstPageRecentUpdates } = require("./src")
const app = express();
const port = 3000;

app.get('/total', async (req, res) => {
    const result = await getTotal()
    res.send(JSON.stringify(result));
})

app.get('/recent-updates', async (req, res) => {
    const result = await getFirstPageRecentUpdates()
    res.send(JSON.stringify(result));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})