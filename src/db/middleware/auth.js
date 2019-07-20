const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next)=>{

    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const isVerify = jwt.verify(token,'thisistotestjwt')
        const user = await User.findOne({ _id : isVerify._id ,'tokens.token' : token})
        req.user = user
        next()
    }catch(e){
        res.status(500).send(e)
    }

}

module.exports = auth