const chalk = require('chalk')

function makeLog() {
    const PREFIX = chalk.magenta('[lastfm]')
    return {
        info: (msg) => console.log(`${PREFIX} ${chalk.cyan('(info)')} ${msg}`),
        error: (msg) => console.log(`${PREFIX} ${chalk.red('(error)')} ${msg}`),
        warn: (msg) => console.log(`${PREFIX} ${chalk.yellow('(warn)')} ${msg}`),
    }
}

const log = makeLog()
module.exports = log
