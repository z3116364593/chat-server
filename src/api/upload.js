const express = require('express')
const router = express.Router()
const multer = require('multer')
const webshot = require('webshot');

let upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if(file.mimetype.includes('video')) {
                cb(null, './public/video');
            } else if(file.mimetype.includes('image')) {
                cb(null, './public/images');
            }
        },
        filename: (req, file, cb) => {
            let changedName = file.originalname
            cb(null, changedName);
        }
    })
})

router.post('/upload', upload.single('file'), (req, res) => {
    // console.log(req.file);
    res.send({
        data: {
            type: 'success',
            message: '上传成功',
            path: req.file.originalname
        }
    })
})

router.post('/editing', (req, res) => {
    let { url, x, y } = req.body
    const options = {
        // screenSize: {
        //     width: 100, 
        //     height: 100
        // },
        shotSize: {
            width: x || 0,
            height: y || 0
        }
    }
    webshot(url || '', './public/images/editing.png', options, function(err) { 
        if(err) {
            console.log('截图失败', err)
            res.send('截图失败')
        } else {
            console.log('截图成功')
            res.send('截图成功')
        }
    })

})

module.exports = router
