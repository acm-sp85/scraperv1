import mongoose from 'mongoose';
import { Schema } from 'mongoose.Schema';

const filmSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  SKU: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Film', filmSchema);
