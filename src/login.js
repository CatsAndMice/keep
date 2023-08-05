const axios = require('axios');
const { headers } = require('./config');

module.exports = async (data) => {
    const result = await axios.post('https://api.gotokeep.com/v1.1/users/login', data, { headers })
    if (result.status === 200) {
        const { data: loginResult } = result
        return loginResult.data.token
    }
    return ''
}

