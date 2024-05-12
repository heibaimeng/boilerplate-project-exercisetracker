const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const mongoose = require('mongoose')

app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// 定义 Schema
const userSchema = new mongoose.Schema({
  username: String,
});
// 根据 Schema 创建模型
let User = mongoose.model('User', userSchema);

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
});
let Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const username = req.body.username
  const user = new User({
    username
  })
  user.save((err, data) => res.json(data))
});

app.get('/api/users', (req, res) => {
  User.find((err, data) => res.json(data))
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id
  const user = await User.findById(userId)
  const params = {
    username: user.username,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ?  new Date(req.body.date) :  new Date()
  }
  const exercise = await new Exercise(params).save()
  res.json({
    _id: user._id,
    username: user.username,
    duration: exercise.duration,
    description: exercise.description,
    date: exercise.date.toDateString()
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
