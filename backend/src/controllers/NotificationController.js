const { Notification } = require('../models');

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      user: req.user._id 
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });
    
    res.status(200).json({
      status: 'success',
      results: notifications.length,
      unreadCount,
      data: {
        notifications
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar notificações',
      error: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id,
        user: req.user._id 
      },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        status: 'fail',
        message: 'Notificação não encontrada'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar notificação',
      error: error.message
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        user: req.user._id,
        isRead: false
      },
      { isRead: true }
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar notificações',
      error: error.message
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({
        status: 'fail',
        message: 'Notificação não encontrada'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao excluir notificação',
      error: error.message
    });
  }
};