const axios = require('axios');
const { headers } = require('./config');

module.exports = async (data) => {
    const result = await axios.post('https://api.gotokeep.com/v1.1/users/login', data, { headers })
    const {data:tokenObj} = result
    if (tokenObj.ok) {
        return tokenObj.data.token
    }
    return ''
}

