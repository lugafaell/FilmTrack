const { Movie } = require('../models');

exports.createMovie = async (req, res) => {
  try {
    req.body.user = req.user.id;
    
    const existingMovie = await Movie.findOne({ 
      tmdbId: req.body.tmdbId, 
      user: req.user.id 
    });
    
    if (existingMovie) {
      return res.status(400).json({
        status: 'error',
        message: 'Você já adicionou este filme à sua coleção'
      });
    }
    
    const newMovie = await Movie.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        movie: newMovie
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      data: {
        movies
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Filme não encontrado'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        movie
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getMovieByTmdbId = async (req, res) => {
  try {
    const movie = await Movie.findOne({ 
      tmdbId: req.params.tmdbId, 
      user: req.user.id 
    });
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Filme não encontrado'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        movie
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getMoviesByProvider = async (req, res) => {
  try {
    const { provider } = req.params;
    
    const movies = await Movie.find({
      user: req.user.id,
      watchProviders: { $in: [provider] }
    });
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      data: {
        movies
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    if (req.body.user) delete req.body.user;
    if (req.body.tmdbId) delete req.body.tmdbId;
    
    const movie = await Movie.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, 
      req.body, 
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Filme não encontrado'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        movie
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Filme não encontrado'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};