const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const myApp = require('./myApp');
app.get('/check-mongoose', (req, res) => {
    res.json(myApp.checkDatabase());
})
app.post('/api/users', async (req, res) => {
    await myApp.createUser(req.body.username);
    const user = myApp.getUserByName(req.body.username);
    res.json(user);
})

app.post('/api/users/:_id/exercises', async (req, res) => {
     await myApp.createExercise({
         uid: req.params._id,
         description: req.body.description,
         duration: req.body.duration,
         date: req.body.date});
     res.redirect('/');
})
app.get('/api/users/:_id/logs', async (req, res) => {
    res.json(await myApp.getLog({uid: req.params._id, from: req.query.from, to: req.query.to, limit: req.query.limit}));
})

app.get('/api/users/find/:uid', async (req, res) => {
    res.json({username: await myApp.getUserById(req.params.uid).username});
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
