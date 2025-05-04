const express = require('express');
const router = express.Router();
const { movieController } = require('../../controllers');
const { authController } = require('../../controllers');
const { validateMovieCreation } = require('../../middlewares/validator');

router.use(authController.protect);

router.get('/', movieController.getAllMovies);
router.get('/tmdb/:tmdbId', movieController.getMovieByTmdbId);
router.get('/by-provider/:provider', movieController.getMoviesByProvider);
router.get('/:id', movieController.getMovie);
router.post('/', validateMovieCreation, movieController.createMovie);
router.patch('/:id', movieController.updateMovie);
router.delete('/:id', movieController.deleteMovie);

module.exports = router;