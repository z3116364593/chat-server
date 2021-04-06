const mongoose = require('mongoose')
const express = require('express')
let router = express.Router()

let registerSchema = require('../schema/users')
let register = mongoose.model('users', registerSchema)


/**
 * @name 用户列表
 */
router.get('/userList', async (req, res) => {
    let { page, size, keyword, phone } = req.query
    let condition = {
        $and: [
            { username: { $regex: keyword || '', $options: '$i' } },
            { phone: { $regex: phone || '' } }
        ]
    }
    let paging = {
        skip: Number((page - 1) * size) || 0,
        limit: Number(size) || 10
    }
    let response = await register.find(condition, null, paging).sort({ '_id': -1 })
    let count = await register.countDocuments(condition)
    res.send({
        data: {
            list: response,
            total: count
        }
    })
})


/**
 * @name 用户注册
 */
router.post('/register', async (req, res) => {
    let params = {
        data: {
            type: '',
            message: ''
        }
    }
    let { username, password, phone, headPortrait, sex, birthday } = req.body
    if(username.trim() === '' || password.trim() === '' || phone.trim() === '' || headPortrait.trim() === '') {
        if(headPortrait.trim() === '') {
            params.data.type = 'info'
            params.data.message = '请上传头像！'
        } else if(username.trim() === '') {
            params.data.type = 'info'
            params.data.message = '请输入用户名！'
        } else if(password.trim() === '') {
            params.data.type = 'info'
            params.data.message = '请输入密码！'
        } else if(phone.trim() === '') {
            params.data.type = 'info'
            params.data.message = '请输入手机号！'
        }
    } else {
        let findRes = await register.find({ phone })
        if(findRes.length === 0) {
            await register.insertMany({
                username,
                password,
                phone,
                headPortrait,
                token: '',
                sex,
                birthday
            })
            params.data.type = 'success'
            params.data.message = '注册成功！'
        } else {
            params.data.type = 'info'
            params.data.message = '该手机号码已注册！'
        }
    }
    res.send(params)
})

/**
 * @name 用户删除
 */
router.post('/delUser', async (req, res) => {
    let { id } = req.body
    if(id && id.trim() !== '') {
        try {
            await register.deleteMany({ _id: id })
            res.send({
                data: { type: 'success', message: '删除成功！' }
            })
        } catch {
            res.send({
                data: { type: 'error', message: '删除失败！' }
            })
        }
    }
})

/**
 * @name 登录
 */
router.post('/login', async (req, res) => {
    let params = {
        data: {
            type: '',
            message: ''
        }
    }
    let { phone, password } = req.body
    if(phone.trim() === '' || password.trim() === '') {
        if(phone.trim() === '') {
            params.data.type = 'info'
            params.data.message = '请输入手机号！'
        } else if(password.trim() === '') {
            params.data.type = 'info'
            params.data.message = '请输入密码！'
        }
    } else {
        let findRes = await register.find({
            $and: [{ phone: { $regex: phone } }]
        })
        if(findRes.length === 1) {
            let user = findRes[0]
            if(user.password === password) {
                params.data.type = 'success'
                params.data.message = '登录成功！'
                params.data.token = findRes[0]._id
            } else {
                params.data.type = 'error'
                params.data.message = '密码错误！'
            }
        } else {
            params.data.type = 'error'
            params.data.message = '不存在该账号！'
        }
    }
    res.send(params)
})

/**
 * @name 修改用户头像
 */
router.post('/upPortrait', async (req, res) => {
    let { phone, url } = req.body
    await register.updateMany({ phone: phone }, { $set: { headPortrait: url }})
    res.send({
        data: {
            type: 'success',
            message: '修改成功'
        }
    })
})

/**
 * @name 获取用户信息
 */
router.get('/getUserinfo', async (req, res) => {
    let { phone } = req.query
    let user = await register.find({ phone })
    res.send({
        data: {
            user: user[0]
        }
    })
})

module.exports = router
