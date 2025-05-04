const express = require('express');
const router = express.Router();
const { notificationController } = require('../../controllers');
const { authController } = require('../../controllers');

router.use(authController.protect);

router.get('/', notificationController.getAllNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;