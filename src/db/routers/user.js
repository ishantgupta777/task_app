const express = require('express')
const User = require('../models/user')
const router = new express.Router()

router.post('/user', async (req,res)=>{
    const user = new User(req.body)
    try{
     await user.save()
     const token = await user.getAuthToken()
     res.status(201).send({user,token})
    }catch(e){
     res.status(400).send(e)
    }
 })

 router.get('/user',(req,res)=>{
    User.find({}).then(user=>res.send(user)).catch(e=>res.status(500).send(e))
})

router.post('/user/login', async (req,res)=>{
   try{
        const user = await User.findUserByCredential(req.body.email,req.body.password)
        const token = await user.getAuthToken()
        res.send({user , token})
   }catch(e){
       res.status(500).send(e)
   }
})

router.get('/user/:id',(req,res)=>{
    const _id = req.params.id
    User.findById(_id).then(user=>{
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }).catch(e=>res.status(500).send(e))
})

router.delete('/user/:id', async (req,res) =>{

    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).send('wrong query')
        }
        res.send(user)
    }catch(e){
        res.status(500).send(e)
    }

})

router.patch('/user/:id', async (req,res) =>{

    const updatesAllowed = ['name','age','password']
    const updatesRequested = Object.keys(req.body)
    const isAllowed = updatesRequested.every(update=>updatesAllowed.includes(update))

    if(!isAllowed){
        return res.status(400).send('wrond update query ')
    }

    try{
        const user = await User.findByIdAndUpdate(req.params.id)
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