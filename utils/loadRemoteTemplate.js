module.exports = async ({ owner, repositoryName, branch, clone = false }) => {
    const download = require('download-git-repo')
    const os = require('os')
    const path = require('path')
    const chalk = require('chalk')
    const repositoryUrl = `github:${owner}/${repositoryName}#${branch}`

    const tmpdir = path.join(os.tmpdir(), 'tangxiaomi-cli-template', branch)

    return await new Promise((resolve, reject) => {
        download(repositoryUrl, tmpdir, { clone }, err => {
            if (err) return reject(err)
            resolve(tmpdir)
        })
    }).catch((err) => {
        console.log(chalk.red('模板下载失败'), err)
    })
}
