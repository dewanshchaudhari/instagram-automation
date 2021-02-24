const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const iPhone = puppeteer.devices['iPhone X'];
const BASE_URL = `https://instagram.com`;
const fs = require('fs');
const instagram = {
    browser: null,
    page: null,

    initialize: async () => {
        instagram.browser = await puppeteer.launch({
            headless: false
        });
        instagram.page = await instagram.browser.newPage();
        await instagram.page.emulate(iPhone);
    },
    login: async (username, password) => {
        await instagram.page.goto(BASE_URL, { waitUntil: "networkidle2" });
        await instagram.page.waitFor('//button[contains(text(),"Log In")]');
        let loginButton = await instagram.page.$x('//button[contains(text(),"Log In")]');
        await loginButton[0].click();

        //writing username ans Password
        // debugger;
        await instagram.page.type('input[name="username"]', username, { delay: 50 });
        await instagram.page.type('input[name="password"]', password, { delay: 50 });

        // //clicking on login button
        loginButton = await instagram.page.$x('//div[contains(text(),"Log In")]');
        await loginButton[0].click();

        //clicking on not now

        await instagram.page.waitFor('//button[contains(text(),"Not Now")]');
        let notSaveButton = await instagram.page.$x('//button[contains(text(),"Not Now")]');
        await notSaveButton[0].click();
        await instagram.page.waitFor('img[data-testid="user-avatar"]');

    },
    getImage: async (previousUrl) => {
        await instagram.page.goto(previousUrl, { waitUntil: "networkidle2" });
        await instagram.page.waitFor('article img[decoding="auto"]');
        let latestPost = await instagram.page.$eval('article img[decoding="auto"]', (elm) => elm.src);
        const response = await fetch(latestPost);
        const buffer = await response.buffer();
        fs.writeFile(`./image.jpg`, buffer, () => console.log('finished downloading!'));
        await instagram.page.waitFor(500);
        let moreEle = await instagram.page.$x('//button[contains(text(),"more")]');
        if (moreEle) {
            await moreEle[0].click();
        }
        let latestPostCaption = await instagram.page.$eval('article div[data-testid="post-comment-root"] span', elm => elm.textContent);
        await console.log(latestPostCaption);
        // console.log(latestPost);
        // fs.writeFile('previous.txt', previousUrl, function (err) {
        //     if (err) return console.log(err);
        // });

    },
    previousPost: async () => {
        await instagram.page.goto(`${BASE_URL}/linustech`, { waitUntil: "networkidle2" });
        let notNow = await instagram.page.$x('//div[contains(text(),"Not Now")]');
        await notNow[0].click();
        let previousUrl = await instagram.page.$eval('article > div:nth-child(1) a', (elm) => elm.href);
        let sameUrl;
        fs.readFile('./previous.txt', 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            if (previousUrl !== data)
                return instagram.getImage(previousUrl);
        });
    },
    repost: async () => {


    },



}









module.exports = instagram;