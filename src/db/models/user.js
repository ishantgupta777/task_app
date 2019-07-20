const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

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
})

userSchema.methods.getAuthToken = async function(){
    const user = this

    const token = jwt.sign({_id : user._id.toString()},'thisistotestjwt')
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

const User = mongoose.model('User',userSchema)



module.exports = User