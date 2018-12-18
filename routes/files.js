const express = require('express')
const router = express.Router()
const fs = require('fs')
const config = require('../config/app')

// return the list of files from the directory given
router.get('/files', (req, res) => {

    const path = req.query.path
    const search = req.query.toSearch
    let filtered = []

    try {
        fs.readdir(path, (err, files) => {
            if (err) {
                res.status(500).json({
                    details: err,
                    message: 'Error loading files'
                })
                return
            }

            new Promise((resolve, reject) => {
                
                if (search.trim() === '') {
                    resolve(null)
                    return
                    
                }
                let count = 0
                files.forEach(file => {
                    fs.readFile(`${path}/${file}`, 'utf8', (err, contents) => {
                        count ++
                        if (contents.includes(search)) {
                            filtered.push(file)
                        }
                        if (count >= files.length) {
                            resolve(filtered)
                        }
                    })
                })
            }).then(val => {
                res.status(200).json({
                    files: val === null ? files : val
                })
            }).catch(err => console.error(err) )
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error loading files',
            details: error
        })
    }
})

// return a object json with the content of the file selected
router.get('/file', (req, res) => {
    const file = req.query.file
    const userSayFileName = file.substring(0, file.length - 5) + '_usersays_es.json'
    let userSaysFile = null
    if (!file) {
        res.status(422).json({
            message: 'File name not specified'
        })
        return
    }

    try {
        let details = ''
        fs.readFile(file, 'utf8', (err, contents) => {

            if (err) {
                res.status(500).json({
                    message: 'Error reading the file',
                    details: err
                })
                return
            }

            fs.readFile(userSayFileName, 'utf8', (err, contentsUsrSay) => {
                if (err) {
                    details = err
                } else {
                    userSaysFile = contentsUsrSay
                }

                res.status(200).json({
                    file: contents,
                    userSaysFile,
                    details
                })
            })
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error reading the file',
            details: error
        })
    }
})

// Save the file with the content given
router.post('/file', (req, res) => {

    const fileName = req.body.file
    const newData = req.body.newData

    try {
        if (!fs.existsSync(fileName)) {
            res.status(404).json({
                message: 'File not found'
            })
            return
        }
        if (!newData) {
            res.status(422).json({
                message: 'There is no content to save'
            })
        }
        fs.writeFileSync(fileName, JSON.stringify(newData, null, 2))

        res.status(200).json({
            message: 'File saved successfully'
        })
    } catch (err) {
        res.status(500).json({
            message: 'Error saving the file',
            details: err
        })
    }
})

// Open the file with any editor
router.post('/file/exec', (req, res) => {

    const exec = require('child_process').exec
    const fileName = req.body.file
    let editor = req.body.textEditor

    if (!editor) {
        editor = config.textEditor[process.platform] 
    }

    if (!fileName) {
        res.status(422).json({
            message: 'The file path is required',
        })
    }

    try {
        exec(`${editor} ${fileName}`, (err) => { 
            if (err) throw err

            res.status(201)
        })
    } catch (err) {
        res.status(500).json({
            message: 'Unable to open text editor',
            details: err
        })
    }
})

module.exports = router