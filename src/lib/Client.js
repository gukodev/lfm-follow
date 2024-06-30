const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const log = require('../log')

puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const rndSleep = async (min, max) => sleep(Math.floor(Math.random() * (max - min + 1)) + min)

module.exports = class Client {
    constructor(username, password) {
        this.BASE_URL = 'https://www.last.fm'
        this.username = username
        this.password = password
        this.browser = null
        this.logged_in = false
    }

    async init() {
        log.info('launching browser')
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
            defaultViewport: null,
        })
        log.info('browser launched')
    }

    async login() {
        log.info('logging in')

        const page = await this.browser.newPage()

        await page.goto(`${this.BASE_URL}/login`)
        await page.waitForSelector('input[name="username_or_email"]')
        await page.type('input[name="username_or_email"]', this.username)

        await sleep(1000)

        await page.waitForSelector('input[name="password"]')
        await page.type('input[name="password"]', this.password)

        await sleep(1000)
        await page.keyboard.press('Enter')

        await page.waitForNavigation() // wait for the page to reload
        log.info('logged in')

        this.logged_in = true
        await sleep(1000)
    }

    async followNeighbours() {
        if (!this.logged_in) throw new Error('Not logged in')

        log.info('following neighbours')
        const page = await this.browser.newPage()
        await page.goto(`${this.BASE_URL}/user/${this.username}/neighbours`)

        await page.waitForSelector('.user-list')

        const followButtons = await page.$$('.user-list button[data-analytics-action="FollowUser"]')
        if (followButtons.length === 0) {
            log.warn('no neighbours to follow')
            return
        }
        log.info(`found ${followButtons.length} neighbours to follow`)

        await sleep(1000)

        for (const button of followButtons) {
            await button.click()
            await rndSleep(250, 500)
        }

        log.info('followed neighbours')
    }

    async close() {
        // close pages
        const pages = await this.browser.pages()
        await Promise.all(pages.map((page) => page.close()))
        await this.browser.close()
        this.logged_in = false
        log.info('browser closed')
    }
}
