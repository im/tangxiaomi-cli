const getLatest = async (packageName) => {
    const axios = require('axios')
    const tplUrl = `https://registry.npm.taobao.org/${packageName}`
    const res = await axios.get(tplUrl)
    if (res.status === 200) {
        return res.data['dist-tags'].latest
    }

    console.log('获取模板最新版本号失败')
    return null
}

module.exports = async (packageName) => {
    const os = require('os')
    const path = require('path')
    const download = require('get-npm-package')

    const tmpdir = path.join(os.tmpdir(), 'tangxiaomi-cli-template')

    const packageJsonPath = path.join(tmpdir, 'package.json')
    try {
        const packageJson = require(packageJsonPath)
        if (packageJson.version) {
            const version = packageJson.version
            const latest = await getLatest(packageName)
            if (latest && version !== latest) {
                await download(packageName, tmpdir, { log: false })
            }
        } else {
            await download(packageName, tmpdir, { log: false })
        }
    } catch (e) {
        await download(packageName, tmpdir, { log: false })
    }

    return tmpdir
}
