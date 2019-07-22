const app = require('../src/app')
const request = require('supertest')
const User = require('../src/models/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const userId = mongoose.Types.ObjectId()
const testUser = {
    _id : userId,
    name : 'ishant',
    email  : 'ishantgupta777@gmail.com',
    password : '88888888',
    tokens : [{
        token : jwt.sign({_id :userId},process.env.JWT_SECRET)
    }]
}

beforeEach(async()=>{
    await User.deleteMany()
    await new User(testUser).save()
})

test('to test valid login',async()=>{
        const response = await  request(app).post('/user/login').send({
            email : testUser.email ,
            password : testUser.password
        }).expect(200)

        const user = await User.findById(userId)
        expect(response.body.token).toBe(user.tokens[1].token)
})

test('to test invalid login',async()=>{
  await  request(app).post('/user/login').send({
        email : testUser.email + 'f' ,
        password : testUser.password
    }).expect(500)
})

test('to delete account of user',async()=>{
    const response  =  await request(app)
            .delete('/user/me')
            .set('Authorization',`Bearer ${testUser.tokens[0].token}`)
            .expect(200)

        const user = await User.findById(userId)
        expect(user).toBeNull()
})

test('to not delete account of user with invalid auth',async()=>{
    await request(app)
    .delete('/user/me')
    .set('Authorization',`Bearer ${testUser.tokens[0].token} dfd`)
    .expect(500)
})

test('avatar upload check',async ()=>{
    await request(app).post('/user/me/avatar').set('Authorization',`Bearer ${testUser.tokens[0].token}`)
            .attach('avatar','tests/fixtures/swapnil-naralkar-i3V1-5fG0HE-unsplash-min (1).jpg').expect(200)
       
            const user = await User.findById(userId)
            expect(user.image).toEqual(expect.any(Buffer))
})