const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const iPhone = puppeteer.devices['iPhone X'];
const BASE_URL = `https://instagram.com`;
const fs = require('fs');
const instagram = {
    browser: null,
    page: null,
    caption: 'hello my name is dc',
    initialize: async () => {
        instagram.browser = await puppeteer.launch({
            headless: false
        });
        instagram.page = await instagram.browser.newPage();
        await instagram.page.emulate(iPhone);
    },
    login: async (username, password) => {
        await instagram.page.goto(BASE_URL, {
            waitUntil: "networkidle2"
        });
        await instagram.page.waitFor('//button[contains(text(),"Log In")]');
        let loginButton = await instagram.page.$x('//button[contains(text(),"Log In")]');
        await loginButton[0].click();

        //writing username ans Password
        // debugger;
        await instagram.page.type('input[name="username"]', username, {
            delay: 50
        });
        await instagram.page.type('input[name="password"]', password, {
            delay: 50
        });

        // //clicking on login button
        loginButton = await instagram.page.$x('//div[contains(text(),"Log In")]');
        await loginButton[0].click();

        //clicking on not now

        await instagram.page.waitFor('//button[contains(text(),"Not Now")]');
        let notSaveButton = await instagram.page.$x('//button[contains(text(),"Not Now")]');
        await notSaveButton[0].click();
        await instagram.page.waitFor('img[data-testid="user-avatar"]');

    },
    previousPost: async () => {
        console.log('in previous post');
        await instagram.page.goto(`${BASE_URL}/linustech`, {
            waitUntil: "networkidle2"
        });
        let previousUrl = await instagram.page.$eval('article > div:nth-child(1) a', (elm) => elm.href);
        fs.readFile('./previous.txt', 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            if (previousUrl !== data)
                console.log('previousUrl');
            return await instagram.getImage(previousUrl);
        });
    },
    getImage: async (previousUrl) => {
        console.log('in get image');
        await instagram.page.goto(previousUrl, {
            waitUntil: "networkidle2"
        });
        await instagram.page.waitFor('article img[decoding="auto"]');
        let notNowEle = await instagram.page.$x('//div[contains(text(),"Not Now")]');
        if (notNowEle.length)
            await notNowEle[0].click();
        let latestPost = await instagram.page.$eval('article img[decoding="auto"]', (elm) => elm.src);
        const response = await fetch(latestPost);
        const buffer = await response.buffer();
        fs.writeFile(`./image.jpg`, buffer, () => console.log('finished downloading!'));
        await instagram.page.waitFor(500);
        let moreEle = await instagram.page.$x('//button[contains(text(),"more")]');
        if (moreEle.length) {
            await moreEle[0].click();
        }
        let latestPostCaption = await instagram.page.$eval('article div[data-testid="post-comment-root"] span', elm => elm.textContent);
        instagram.caption = latestPostCaption;
        console.log(latestPostCaption);
        // console.log(latestPost);
        // fs.writeFile('previous.txt', previousUrl, function (err) {
        //     if (err) return console.log(err);
        // });
        await instagram.page.goto(BASE_URL, {
            waitUntil: "networkidle2"
        });
        await instagram.page.waitFor(2000);
    },
    repost: async () => {

        let fileInputs = await instagram.page.$$('input[type="file"]');
        let input = await fileInputs[fileInputs.length - 1];
        let newPostBtn = await instagram.page.$('div[data-testid="new-post-button"]');
        await newPostBtn.click();
        await input.uploadFile('./image.jpg');
        await instagram.page.waitFor('//button[contains(text(),"Next")]');
        let nextbtn = await instagram.page.$x('//button[contains(text(),"Next")]');
        await nextbtn[0].click();
        await instagram.page.waitFor('textarea[aria-label="Write a caption…"]');
        await instagram.page.type('textarea[aria-label="Write a caption…"]', instagram.caption, {
            delay: 50
        });
        let shareBtn = await instagram.page.$x('//button[contains(text(),"Share")]');
        await shareBtn[0].click();
    },



}









module.exports = instagram;