const mongoose = require('mongoose')
let Mtils = require('../methods/Mtils')
let registerSchema = require('../schema/users')
let { everyoneSchema, msgSchema } = require('../schema/message')

let register = mongoose.model('users', registerSchema)
let everyone = mongoose.model('everyone', everyoneSchema)

//发送用户列表
const sendUser = async (io) => {
    let users = await register.find()
    let letter = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M']
    let arr = { 
        '#': [],
        'A': [],
        'B': [],
        'C': [],
        'D': [],
        'E': [],
        'F': [],
        'G': [],
        'H': [],
        'I': [],
        'J': [],
        'K': [],
        'L': [],
        'M': [],
        'N': [],
        'O': [],
        'P': [],
        'Q': [],
        'R': [],
        'S': [],
        'T': [],
        'U': [],
        'V': [],
        'W': [],
        'X': [],
        'Y': [],
        'Z': [],
    }
    users.forEach(item => {
        let py = Mtils.utils.makePy(item.username.substr(0, 1), true);
        if(letter.includes(py.toUpperCase())) {
            arr[py.toUpperCase()].push(item)
        } else {
            arr['#'].push(item)
        }
    })
    for(let key in arr) {
        if(arr[key].length === 0) {
            delete arr[key]
        }
    }
    let friends = []
    for(let key in arr) {
        friends.push({
            title: key,
            list: arr[key]
        })
    }
    io.emit('userList', friends)
}

const start = (io) => {
    io.on('connection', (socket) => {
        console.log(socket.id, '用户连接成功');
        //发送用户列表
        sendUser(io)

        //连接用户
        socket.on('userConnect', async (id) => {
            await register.updateMany({ _id: id }, { $set: { socketId: socket.id } })
        })

        //接收消息
        socket.on('to-msg', async (item) => {
            let condition = {
                $or: [
                    { name: item.oneseif + '-' + item.adverse },
                    { name: item.adverse + '-' + item.oneseif }
                ]
            }
            let everyoneArr = await everyone.find(condition)
            if(everyoneArr.length === 0) {
               await everyone.insertMany({ name: item.oneseif + '-' + item.adverse })
            }
            let everyoneArr2 = await everyone.find(condition)
            
            let message = mongoose.model(everyoneArr2[0].name, msgSchema)
            if(item.msg !== '获取初始数据') {
                await message.insertMany({ oneseif: item.oneseif, adverse: item.adverse, msg: item.msg })
            }
            let msgInfo = await message.find()

            let iItem = await register.find({ phone: item.oneseif })
            let yItem = await register.find({ phone: item.adverse })
            let i = iItem[0].socketId || undefined
            let y = yItem[0].socketId || undefined
            if(i) {
                io.to(i).emit('on-msg', msgInfo)
            }
            if(y) {
                io.to(y).emit('on-msg', msgInfo)
            }
        })

        //断开连接
        socket.on('disconnect', () => {
            console.log(socket.id, '用户已断开连接')
        })
    })
}

module.exports = start
