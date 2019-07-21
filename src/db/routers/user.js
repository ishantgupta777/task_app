const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')


//---------create user------------
router.post('/user', async (req,res)=>{
    const user = new User(req.body)
    try{
     await user.save()
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

module.exports = router