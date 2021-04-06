const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
const http = require('http').Server(app) // 将express模块实例作为回调构建http模块实例
const io = require('socket.io')(http)
const socket = require('./src/api/socket')

// 把指定文件变得可以访问
app.use('/chat', express.static(path.join(__dirname, './src/build')))
app.use(express.static(path.join(__dirname, './public')))

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/chat', { useNewUrlParser: true, useUnifiedTopology: true })
let db = mongoose.connection
db.on('error', (error) => console.log('数据库连接失败', error))
db.once('open', () => console.log('数据库连接成功：chat'))

// 解析请求数据
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// 设置跨域访问
app.use(cors());
// 注册
app.use('/user', require('./src/api/register'))
// 图片上传
app.use('/portrait', require('./src/api/upload'))
// socket
socket(io)

// 监听端口
http.listen(8000, (err) => {
    if(!err) console.log('端口监听成功 8000')
})
