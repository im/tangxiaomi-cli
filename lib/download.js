const inquirer = require('inquirer')
const downloadNpm = require('get-npm-package')
const downloadGit = require('download-git-repo')
const chalk = require('chalk')
const minimist = require('minimist')

const getType = async (argv) => {
    const { t, type } = argv
    if (t || type) {
        return t || type
    }
    const { data } = await inquirer.prompt([
        {
            name: 'data',
            type: 'list',
            message: `请选择要下载的类型`,
            choices: [
                { name: 'npm', value: 'npm' },
                { name: 'github', value: 'github', },
                { name: 'gitlab', value: 'gitlab', },
                { name: 'bitbucket', value: 'bitbucket' }
            ]
        }
    ])
    return data
}

const getName = async (argv, type) => {
    const { n, name } = argv
    if (n || name) {
        return n || name
    }
    const message = type === 'npm' ? '请输入npm包名, 如(vue或vue@0.0.1) :>' : '请输入git仓库名 :>'
    const { data } = await inquirer.prompt([
        {
            name: 'data',
            type: 'input',
            message: message
        }
    ])
    return data
}

const getBranch = async (argv) => {
    const { b, branch } = argv
    if (b || branch) {
        return b || branch
    }
    const { data } = await inquirer.prompt([
        {
            name: 'data',
            type: 'input',
            message: `请输入分支名 (不填为默认分支) : >`
        }
    ])
    return data
}

const getOwner = async (argv) => {
    const { o, owner } = argv
    if (o || owner) {
        return o || owner
    }
    const { data } = await inquirer.prompt([
        {
            name: 'data',
            type: 'input',
            message: `请输入仓库所有者 : >`
        }
    ])
    return data
}

const getDest = async (argv) => {
    const { d, dest } = argv
    if (d || dest) {
        return d || dest
    }
    const { data } = await inquirer.prompt([
        {
            name: 'data',
            type: 'input',
            message: `请输入下载完成的路径, 如(package/vue) 默认路径(.download): >`
        }
    ])
    return data || './download'
}

module.exports = async () => {
    const argv = minimist(process.argv.slice(3)) || {}

    const type = await getType(argv)

    if (!type) {
        console.log('下载的类型不能为空')
        return
    }

    const name = await getName(argv, type)

    if (!name) {
        console.log('npm包名 | git创库名 不能为空')
        return
    }

    if (type === 'npm') {
        const dest = await getDest(argv)
        await downloadNpm(name, dest)

    } else {
        const owner = await getOwner(argv)
        const branch = await getBranch(argv)

        if (!owner) {
            console.log('仓库所有者不能为空')
            return
        }
        const dest = await getDest(argv)

        const url = branch ? `${type}:${owner}/${name}#${branch}` : `${type}:${owner}/${name}`
        console.log('  ')
        console.log('  Owner: ' + chalk.green(owner))
        console.log('  Name:  ' + chalk.green(name))
        console.log('  ')
        console.log('url: ', url)
        console.log('dest: ', dest)
        downloadGit(url, dest, () => {
            console.log('  ' + chalk.green(`${name} download `) + chalk.yellow(`successful`))
            console.log('  ')
        })
    }
}