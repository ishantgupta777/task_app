const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Task = require('../models/tasks')

const userSchema = new mongoose.Schema({
    name : {
        type : String
    },
    age : {
        type : Number
    },
    email : {
        type : String,
        required : true,
        toLowerCase : true,
        unique : true,
        trim : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email is now valid')
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    image : {
        type : Buffer
    },
    password : {
        type : String,
        required : true,
        minlength : 6,
        trim : true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password can\'t contain password')
            }
        }
    }
},{
    timestamps : true
})

userSchema.virtual('tasks',{
    ref : Task,
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this

    const object = user.toObject()
    delete object.password
    delete object.tokens
    delete object.image
    return object
}

userSchema.methods.getAuthToken = async function(){
    const user = this

    const token = jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET)
    user.tokens = await user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.statics.findUserByCredential = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('no user is find with these details')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
      throw new Error('password is incorrect')
    }
    return user
}

//-------------hash the plain text password--------------------------------

userSchema.pre('save', async function(next){

    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,8)
    }

    next()
})

//---------------delete the tasks when user deleted its profile-----------------

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner : user._id})
    next()
})

const User = mongoose.model('User',userSchema)



module.exports = User

