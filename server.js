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
const Exercise = mongoose.model("Exercise", ExerciseSchema);

const createAndSaveUser = async (username) => {
  const user = new User({ username });
  return await user.save();
};

const createAndSaveExercise = async (exerciseDetails) => {
  const exercise = new Exercise(exerciseDetails);
  return await exercise.save();
};

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const result = await createAndSaveUser(username);
  res.json({
    username: result.username,
    _id: result.id,
  });
});

app.get("/api/users", async (req, res) => {
  const result = await User.find({});
  res.json(result);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id}  = req.params
  const { description, duration } = req.body;
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const exercise = {
    userId: _id,
    description,
    duration,
    date,
  };
  const result = await createAndSaveExercise(exercise);
  const user = await User.findById({ _id });
  const { username } = user;
  res.json({
    _id,
    username,
    description,
    duration: parseInt(duration),
    date: result.date.toDateString(),
  });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id}  = req.params
  const { from, to, limit = 100 } = req.query;

  const user = await User.findById({ _id });
  const { username } = user;

  let dateObj = {};
  if(from) {
    dateObj["$gte"] = new Date(from);
  }
  if(to) {
    dateObj["$lte"] = new Date(to);
  }
  let filter = {
    userId: _id
  }
  if(from || to) {
    filter.date = dateObj;
  }

  const rawLog = await Exercise.find(filter).limit(limit).exec()
  const log = rawLog.map(entry => ({
    description: entry.description,
    duration: entry.duration,
    date: entry.date.toDateString()
  }))
  const count = log.length;
  res.json({
    username,
    count,
    _id,
    log,
  });
});

app.get("/api/clear", async (req, res) => {
  await User.deleteMany({});
  await Exercise.deleteMany({});
  res.send("Database cleared");
});

app.listen(3000);
