const express = require('express')
const Task = require('../models/tasks')
const router = new express.Router()
const auth = require('../middleware/auth')

router.post('/task',auth, async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
       }catch(e){
        res.status(400).send(e)
       }
})


    //----------use async await in other routes too,, i am too lazy to do that---------------



router.get('/task',auth, async (req,res)=>{

    try{
        const task = await Task.find({owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task) 
            //-------------better approach----------

        // await req.user.populate('tasks').execPopulate()
        // res.send(req.user.tasks)

    }catch(e){
        res.status(500).send(e)
    }
   
})

router.get('/task/:id',auth, async (req,res)=>{

    try{
        const _id = req.params.id
        const task = await Task.findOne({_id , owner : req.user._id})
        if(!task){
                    return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }

    // const _id = req.params.id
    // Task.findById(_id).then(task=>{
    //     
    //     
    // }).catch(e=>{
    //     res.status(500).send(e)
    // })
})

router.patch('/task/:id', auth, async (req,res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValid = updates.every(update=>allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send({error:'Invalid Updates!'})
    }

    try{
        const task = await Task.findOne({_id:req.params.id , owner : req.user._id})
        
        if(!task){
            return res.status(404).send('wrong query')
        }
        updates.forEach(update=>task[update]=req.body[update])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }

})

router.delete('/task/:id', auth , async (req,res) =>{

    try{
        const task = await Task.findOneAndDelete({_id:req.params.id , owner : req.user._id})
        if(!task){
            return res.status(404).send('wrong query')
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }

})

module.exports = router