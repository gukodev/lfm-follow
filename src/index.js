require('dotenv').config()
const Client = require('./lib/Client')
const log = require('./log')

const CRON_INTERVAL = 1000 * 60 * 60 * 12 // 12 hours
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const cred = {
    username: process.env.LASTFM_USERNAME,
    password: process.env.LASTFM_PASSWORD,
}

if (!cred.username || !cred.password) {
    throw new Error('LASTFM_USERNAME and LASTFM_PASSWORD must be set in .env')
    process.exit(1)
}

async function task(client) {
    await client.init()
    await client.login()
    await client.followNeighbours()
    await sleep(1000)
}

async function main() {
    const args = process.argv.slice(2)
    const cronMode = args.includes('--cron')
    const client = new Client(cred.username, cred.password)

    if (cronMode) {
        log.info(`running in cron mode (${CRON_INTERVAL / 1000}s)`)
        while (true) {
            await task(client)
                .catch((err) => {
                    log.error(err)
                })
                .finally(async () => await client.close())

            const now = new Date()
            const nextRun = new Date(now.getTime() + CRON_INTERVAL)
            log.info(`next run at ${nextRun.toLocaleString()}`)

            await sleep(CRON_INTERVAL)
        }
    } else {
        await task(client).finally(async () => await client.close())
    }
}

main()
