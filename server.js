const cors = require('cors')
const express = require('express')
const app = express()
const config = require('config')
const port = config.get("Port") || 1632



app.use(cors())
//Body Parser Middleware
app.use(express.json())

// Importing Routes
const category = require('./routes/category')
const book = require('./routes/book')
const user = require('./routes/user')
const profile = require('./routes/profile')
const error = require('./middleware/error')
const auth = require('./routes/auth')

// Router Middleware
app.use('/category', category)
app.use('/user', user)
app.use('/profile', profile)
app.use('/auth', auth)
app.use('/book', book)
//error handling middleware
app.use(error)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))