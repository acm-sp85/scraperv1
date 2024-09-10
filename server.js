import express from 'express'
import mongoose from 'mongoose'

const app = express();

const uri =
  'mongodb+srv://Dorama:AnacletoQueTeMeto@film-tracker.2zs6ovi.mongodb.net/?retryWrites=true&w=majority&appName=Film-Tracker';

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log(error);
  }
}

connect();

app.listen(8000, () => {
  console.log('Server started on port 8000');
});
