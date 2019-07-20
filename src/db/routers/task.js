const express = require('express')
const Task = require('../models/tasks')
const router = new express.Router()

router.post('/task', async (req,res)=>{
    const task = new Task(req.body)
    try{
        await task.save()
        res.status(201).send(task)
       }catch(e){
        res.status(400).send(e)
       }
})


    //----------use async await in other routes too,, i am too lazy to do that---------------



router.get('/task',(req,res)=>{
    Task.find({}).then(task=>{
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }).catch(e=>{
        res.status(500).send(e)
    })
})

router.get('/task/:id',(req,res)=>{
    const _id = req.params.id
    Task.findById(_id).then(task=>{
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }).catch(e=>{
        res.status(500).send(e)
    })
})

router.patch('/task/:id', async (req,res) =>{

    try{
        const task = await Task.findByIdAndUpdate(req.params.id)
        task['description'] = req.body.description
        task.save()
        if(!task){
            return res.status(404).send('wrong query')
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }

})

router.delete('/task/:id', async (req,res) =>{

    try{
        const task = await Task.findByIdAndDelete(req.params.id)
        if(!task){
            return res.status(404).send('wrong query')
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }

})

module.exports = router