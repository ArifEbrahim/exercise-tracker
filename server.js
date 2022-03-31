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
  const _id = req.params._id;
  const { description, duration, date = Date.now() } = req.body;
  const exercise = {
    userId: _id,
    description,
    duration,
    date: new Date(date),
  };
  const result = await createAndSaveExercise(exercise);
  const user = await User.findById({ _id });
  const { username } = user;
  res.json({
    _id,
    username,
    description,
    duration,
    date: result.date.toDateString(),
  });
});

app.get("/api/clear", async (req, res) => {
  await User.deleteMany({});
  await Exercise.deleteMany({});
  res.send("Database cleared");
});

app.listen(3000);
