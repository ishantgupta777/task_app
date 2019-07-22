const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendCancelEmail} = require('../email/account')


//---------create user------------
router.post('/user', async (req,res)=>{
    const user = new User(req.body)
    try{
     await user.save()
     sendWelcomeEmail(user.email,user.name)
     const token = await user.getAuthToken()
     res.status(201).send({user ,token})
    }catch(e){
     res.status(400).send(e)
    }
 })


 //------------read profile----------   
 router.get('/user/me',auth,(req,res)=>{
    res.send(req.user)
})

router.post('/user/login', async (req,res)=>{
   try{
        const user = await User.findUserByCredential(req.body.email,req.body.password)
        const token = await user.getAuthToken()
        res.send({user, token})
   }catch(e){
       res.status(500).send(e)
   }
})


//-----------------we dont need this one anymore---------------------

// router.get('/user/:id',(req,res)=>{
//     const _id = req.params.id
//     User.findById(_id).then(user=>{
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }).catch(e=>res.status(500).send(e))
// })


//-------------logout from this device-----------------

router.post('/user/logout',auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>token.token!==req.token)
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()  
    }
})


//----------------------logout from all devices------------------------
router.post('/user/logout/all',auth, async (req,res)=>{
    
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})


//------------------delete user profile----------------------------

router.delete('/user/me',auth, async (req,res) =>{

    try{
        // const user = await User.findByIdAndDelete(req.params.id)
        // if(!user){
        //     return res.status(404).send('wrong query')
        // }
        sendCancelEmail(req.user.email,req.user.name)
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }

})


//----------------------update user profile-----------------------

router.patch('/user/me',auth, async (req,res) =>{

    const updatesAllowed = ['name','age','password','email']
    const updatesRequested = Object.keys(req.body)
    const isAllowed = updatesRequested.every(update=>updatesAllowed.includes(update))

    if(!isAllowed){
        return res.status(400).send('wrond update query ')
    }

    try{
        const user = await User.findByIdAndUpdate(req.user._id)
        updatesRequested.forEach(update=>user[update]=req.body[update])
        user.save()
        if(!user){
            return res.status(404).send('wrong query')
        }
        res.send(user)
    }catch(e){
        res.status(500).send(e)
    }

})

const upload = multer({
    // dest : 'avatar',
    limits : {
        fileSize : 4000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.endsWith('.jpg')){ //can use regular expressin (regex) here, if we are using multiple files here
            cb(new Error('please upload only image'))
        }
        cb(undefined,true)
    }
})
// const middlewareError = (req,res,next)=>{
//     throw new Error('something something')
// } 
router.post('/user/me/avatar',auth, upload.single('avatar')
, async (req,res)=>{
    
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.image = buffer
    await req.user.save()
    res.send()
   
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/user/me/avatar/remove',auth,async (req,res)=>{
    req.user.image = undefined
    await req.user.save()
    res.send()
},(error,req,res)=>{
    res.status(500).send({error:error.message})
})

router.get('/user/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!(user||user.image)){
            throw new Error('no user or image')
        }
        res.set('Content-Type','image/jpg')
        res.send(user.image)
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router