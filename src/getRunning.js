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