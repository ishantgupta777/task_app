const express = require('express')
require('./db/mongoose')
const userRouter = require('./db/routers/user')
const taskRouter = require('./db/routers/task')
const app = express()
const port = process.env.PORT || 3000

app.listen(port,()=>console.log(`listening on port ${port}`))


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



