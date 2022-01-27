const inquirer = require('inquirer')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const getGitUser = require('../utils/getGitUser')
const moment = require('moment')
const ora = require('ora')
const loadRemoteTemplate = require('../utils/loadRemoteTemplate')
const version = require('../package.json').version
const spinner = ora()

module.exports = async () => {

    const { tplType } = await inquirer.prompt([
        {
            name: 'tplType',
            type: 'list',
            message: `请选择要创建的组件类型`,
            choices: [
                { name: 'vue组件(sfc)', value: 'vue-sfc' },
                { name: 'vue3组件(sfc)', value: 'vue3-sfc' }
            ]
        }
    ])

    if (!tplType) {
        return
    }
    spinner.text = '模板下载中...'
    spinner.color = 'yellow'

    spinner.start()

    const remoteTemplatePath = await loadRemoteTemplate({
        owner: 'im',
        repositoryName: 'template',
        branch: 'component',
        clone: false
    })
    spinner.stop()

    const tplPath = path.resolve(remoteTemplatePath, tplType)

    const { name } = await inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: `组件名: >`
        }
    ])

    if (!name) {
        return
    }

    const { comPath } = await inquirer.prompt([
        {
            name: 'comPath',
            type: 'input',
            message: `相对组件路径, 如(views/about): >`
        }
    ])

    if (!comPath) {
        return
    }

    const outPath = path.resolve(process.cwd(), comPath, name)

    console.log(`  组件输出路径: ` + chalk.green(outPath))

    const fillData = {
        '__component__': name,
        '__className__': firstToUpper(name),
        '__author__': getGitUser(),
        '__version__': version,
        '__date__': moment().format('YYYY-MM-DD HH:mm:ss')
    }

    if (fs.existsSync(outPath)) {
        const { action } = await inquirer.prompt([
            {
                name: 'action',
                type: 'list',
                message: `当前组件已经存在，是否需要覆盖 ? `,
                choices: [
                    { name: '是', value: 'yes' },
                    { name: '否', value: 'no' }
                ]
            }
        ])

        if (action === 'yes') {
            removeDir(outPath)
            writeFiles(outPath, tplPath, fillData)
        }

    } else {
        writeFiles(outPath, tplPath, fillData)
    }

}

const transform = (filePath, fillData) => {
    const content = fs.readFileSync(filePath, 'utf-8')

    return content.replace(/\${(\w+)}/gi, (match, name) => {
        return fillData[name] ? fillData[name] : ''
    })

}

const firstToUpper = (str) => {
    return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase())
}

const writeFiles = (outPath, tplPath, fillData) => {
    const files = fs.readdirSync(tplPath, 'utf-8')
    if (!files || !files.length) {
        console.log(chalk.red('读取模板失败'))
        return
    }
    fs.mkdirSync(outPath, { recursive: true })
    files.forEach(filename => {
        const filePath = path.join(tplPath, filename)
        const content = transform(filePath, fillData)
        const tplFileName = filename.split('.')[0]
        const ext = '.' + filename.split('.')[1]
        const outFileName = (tplFileName === 'index' ? 'index' : fillData.__component__) + ext
        const outFilePath = path.join(outPath, outFileName)
        fs.writeFileSync(outFilePath, content, 'utf-8')
    })

}

const removeDir = (dir) => {
    let files = fs.readdirSync(dir)
    for (let i = 0; i < files.length; i++) {
        let newPath = path.join(dir, files[i])
        let stat = fs.statSync(newPath)
        if (stat.isDirectory()) {
            removeDir(newPath)
        } else {
            fs.unlinkSync(newPath)
        }
    }
    fs.rmdirSync(dir)
}