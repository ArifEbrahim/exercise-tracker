const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: String,
});

const ExerciseSchema = new mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date,
});

const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model('Exercise', ExerciseSchema);

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const user = new User({ username });
  await user.save((err, data) => {
    if (err || !data) {
      res.send("Error: user not saved");
    } else {
      res.json({
        username: data.username,
        _id: data.id,
      });
    }
  });
});

app.get("/api/users", async (req, res) => {
  const result = await User.find({});
  res.json(result);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const _id = req.params._id;
  User.findById({_id}, (err, userData) => {
    if (err || !userData) {
      res.send('Error: user not found')
    } else {
      const { description, duration, date } = req.body;
      const exercise = new Exercise({
        userId: _id,
        description,
        duration,
        date: new Date(date)
      })
      exercise.save((err, data) => {
        if(err || !data) {
          res.send('Error: exercise not saved')
        } else {
          const { description, duration, date, userId } = data;
          const { username } = userData;
          res.json({
            username,
            description,
            duration,
            date: date.toDateString(),
            _id: userId
          })
        }
      })
    }
  })
});

app.get("/api/clear", async (req, res) => {
  await User.deleteMany({});
  await Exercise.deleteMany({});
  res.send("Database cleared");
});

app.listen(3000);
