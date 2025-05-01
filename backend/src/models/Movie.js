const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Um filme precisa ter um título'],
    trim: true
  },
  releaseYear: {
    type: Number,
    required: [true, 'Um filme precisa ter um ano de lançamento']
  },
  synopsis: {
    type: String,
    required: [true, 'Um filme precisa ter uma sinopse'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Um filme precisa ter uma duração']
  },
  posterUrl: {
    type: String,
    trim: true
  },
  genre: {
    type: [String],
    required: [true, 'Um filme precisa ter pelo menos um gênero']
  },
  director: {
    type: String,
    required: [true, 'Um filme precisa ter um diretor'],
    trim: true
  },
  mainCast: {
    type: [String],
    required: [true, 'Um filme precisa ter o elenco principal']
  },
  userRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  status: {
    type: String,
    enum: ['watched', 'watchLater', 'none'],
    default: 'none'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Um filme deve pertencer a um usuário']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

movieSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;