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
    enum: ['new_release', 'watch_reminder', 'streaming_available', 'director_release'],
    required: [true, 'Uma notificação precisa ter um tipo']
  },
  movieId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie'
  },
  tmdbId: {
    type: Number
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;