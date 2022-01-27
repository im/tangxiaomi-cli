module.exports = async ({ owner, repositoryName, branch }) => {
    const url = `https://api.github.com/repos/${owner}/${repositoryName}/commits/${branch}`
    const axios = require('axios')
    const chalk = require('chalk')

    const res = await axios.get(url).catch(() => {
        console.log(chalk.red('获取模板最新版本失败'))
    })
    if (res && res.data && res.data.sha) {
        return res.data.sha
    }
    return null
}