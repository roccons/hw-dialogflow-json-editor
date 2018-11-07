const express = require('express')
const router = express.Router()
const fs = require('fs')

// return the list of files from the directory given
router.get('/files', (req, res) => {

    const path = req.query.path

    try {
        fs.readdir(path, (err, items) => {
            if (err) {
                res.status(500).json({
                    details: err,
                    message: 'Error loading files'
                })
                return
            }

            res.status(200).json({
                files: items.filter(item => !item.includes('usersays'))
            })
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
    if (!file) {
        res.status(422).json({
            message: 'File name not specified'
        })
        return
    }

    try {
        fs.readFile(file, 'utf8', (err, contents) => {

            if (err) {
                res.status(500).json({
                    message: 'Error reading the file',
                    details: err
                })
                return
            }
    
            res.status(200).json({
                file: contents
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
        fs.writeFileSync(fileName, JSON.stringify(newData))

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

module.exports = router