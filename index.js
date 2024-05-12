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
  const user = await User.findById(req.params._id)
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

app.get('/api/users/:_id/logs', async function(req,res) {
  const user = await User.findById(req.params._id)
  const condition = {
    username: user.username
  }
  let from = req.query.from ? new Date(req.query.from) : null
  if (from) condition.date = { $gt: from }

  let to = req.query.to ? new Date(req.query.to) : null
  if (to) condition.date = { ...condition.date, $lt: to }

  const exercisesQuery = Exercise.find(condition)

  let limit = req.query.limit ? +req.query.limit : null
  if (limit) exercisesQuery.limit(limit)

  const exercises = await exercisesQuery.exec()

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log: exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString(),
    }))
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
