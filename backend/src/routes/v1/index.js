const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const movieRoutes = require('./movieRoutes')
const authRoutes = require('./authRoutes');
const notificationRoutes = require('./notificationRoutes');

router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
router.use('/notification', notificationRoutes)

module.exports = router;