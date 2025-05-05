const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Uma notificação deve pertencer a um usuário']
  },
  title: {
    type: String,
    required: [true, 'Uma notificação precisa ter um título'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Uma notificação precisa ter uma mensagem'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['streaming_available', 'watch_reminder', 'director_release']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  movieId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie'
  },
  tmdbId: {
    type: Number
  },
  movieIds: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Movie'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;