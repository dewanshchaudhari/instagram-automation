const ig = require('./instagram');
require('dotenv').config();
(async () => {
    await ig.initialize();
    await ig.previousPost();
    // await ig.login(process.env.USERNAME, process.env.PASSWORD);
    debugger;
})();