'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const files = require('./routes/files')

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.use('/', files)

app.set('PORT', process.env.PORT || 8050)

app.listen(app.get('PORT'), () => {
    console.log('running on', 'http://localhost:' + app.get('PORT'))
})