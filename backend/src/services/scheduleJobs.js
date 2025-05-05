const cron = require('node-cron');
const axios = require('axios');
const { Movie } = require('../models');
const { User } = require('../models');
const { Notification } = require('../models');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: TMDB_API_KEY
  }
});

cron.schedule('0 3 * * *', async () => {
    console.log('Executando verificação de disponibilidade em streaming...');
    
    try {
      const watchLaterMovies = await Movie.find({ status: 'watchLater' }).populate('user');
      
      for (const movie of watchLaterMovies) {
        if (!movie.tmdbId) continue;
        
        try {
          const response = await tmdbApi.get(`/movie/${movie.tmdbId}/watch/providers`);
          const providers = response.data.results.BR || {};
          
          if (providers.flatrate && providers.flatrate.length > 0) {
            const platformNames = providers.flatrate.map(p => p.provider_name);
            
            await Movie.findByIdAndUpdate(movie._id, {
              watchProviders: platformNames
            });
            
            const existingNotification = await Notification.findOne({
              user: movie.user._id,
              type: 'streaming_available',
              isRead: false,
              $or: [
                { movieId: movie._id },
                { message: { $regex: new RegExp(movie.title, 'i') } }
              ],
              createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });
            
            if (!existingNotification) {
              await Notification.create({
                user: movie.user._id,
                title: 'Filme disponível para streaming!',
                message: `${movie.title} agora está disponível em: ${platformNames.join(', ')}`,
                type: 'streaming_available',
                movieId: movie._id,
                tmdbId: movie.tmdbId
              });
              console.log(`Notificação de streaming criada para usuário ${movie.user._id} para o filme: ${movie.title}`);
            } else {
              console.log(`Já existe notificação de streaming para o filme "${movie.title}". Pulando.`);
            }
          }
        } catch (error) {
          console.error(`Erro ao verificar streaming para ${movie.title}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Erro no job de verificação de streaming:', error);
    }
  });

cron.schedule('0 3 * * *', async () => {
  console.log('Enviando lembretes de watchlist...');
  
  try {
    const users = await User.find();
    
    for (const user of users) {
      const watchLaterMovies = await Movie.find({ 
        user: user._id, 
        status: 'watchLater',
        createdAt: { $lt: new Date(Date.now() - 1 * 60 * 1000) }
      }).limit(3).sort('createdAt');
      
      if (watchLaterMovies.length > 0) {
        
        const moviesNeedingReminder = [];
        
        for (const movie of watchLaterMovies) {
          const existingNotification = await Notification.findOne({
            user: user._id,
            type: 'watch_reminder',
            isRead: false,
            $or: [
              { movieIds: movie._id },  
              { message: { $regex: new RegExp(movie.title, 'i') } }
            ]
          });
          
          if (!existingNotification) {
            moviesNeedingReminder.push(movie);
          } else {
            console.log(`Já existe notificação para o filme "${movie.title}". Pulando.`);
          }
        }
        
        if (moviesNeedingReminder.length > 0) {
          const movieTitles = moviesNeedingReminder.map(m => m.title).join(', ');
          
          await Notification.create({
            user: user._id,
            title: 'Lembrete de filmes para assistir',
            message: `Você tem filmes esperando há mais de um mês: ${movieTitles}`,
            type: 'watch_reminder',
            movieIds: moviesNeedingReminder.map(m => m._id)
          });
          
          console.log(`Notificação de lembrete criada para usuário ${user._id} para os filmes: ${movieTitles}`);
        }
      }
    }
  } catch (error) {
    console.error('Erro no job de lembretes de watchlist:', error);
  }
});

cron.schedule('0 10 * * 1', async () => {
  console.log('Verificando novos lançamentos de diretores favoritos...');
  
  try {
    const users = await User.find();
    
    for (const user of users) {
      const favoriteDirectors = await Movie.aggregate([
        { $match: { 
          user: user._id, 
          status: 'watched',
          userRating: { $gte: 4 }
        }},
        { $group: { 
          _id: '$director', 
          count: { $sum: 1 },
          avgRating: { $avg: '$userRating' }
        }},
        { $match: { count: { $gt: 1 } }},
        { $sort: { avgRating: -1 }},
        { $limit: 5 }
      ]);
      
      for (const directorData of favoriteDirectors) {
        const directorName = directorData._id;
        
        try {
          const personSearch = await tmdbApi.get('/search/person', {
            params: { query: directorName }
          });
          
          if (personSearch.data.results.length > 0) {
            const director = personSearch.data.results[0];
            
            const directorCredits = await tmdbApi.get(`/person/${director.id}/movie_credits`);
            
            const directedMovies = directorCredits.data.crew.filter(
              credit => credit.job === 'Director'
            );
            
            const sortedMovies = directedMovies.sort(
              (a, b) => new Date(b.release_date || '1900-01-01') - new Date(a.release_date || '1900-01-01')
            );
            
            const recentMovies = sortedMovies.filter(movie => {
              const releaseDate = new Date(movie.release_date || '1900-01-01');
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              
              const sixMonthsAhead = new Date();
              sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);
              
              return releaseDate >= threeMonthsAgo && releaseDate <= sixMonthsAhead;
            });
            
            if (recentMovies.length > 0) {
              const latestMovie = recentMovies[0];
              
              const existingNotification = await Notification.findOne({
                user: user._id,
                type: 'director_release',
                isRead: false,
                $or: [
                  { tmdbId: latestMovie.id },
                  { message: { $regex: new RegExp(latestMovie.title, 'i') } }
                ]
              });
              
              if (!existingNotification) {
                const releaseDate = latestMovie.release_date 
                  ? new Date(latestMovie.release_date).toLocaleDateString('pt-BR')
                  : 'em breve';
                
                await Notification.create({
                  user: user._id,
                  title: `Novo filme de ${directorName}!`,
                  message: `${latestMovie.title} será lançado em ${releaseDate}`,
                  type: 'director_release',
                  tmdbId: latestMovie.id
                });
                console.log(`Notificação de novo lançamento criada para usuário ${user._id}: ${latestMovie.title} de ${directorName}`);
              } else {
                console.log(`Já existe notificação para o filme "${latestMovie.title}" do diretor ${directorName}. Pulando.`);
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao verificar diretor ${directorName}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Erro no job de novos lançamentos:', error);
  }
});