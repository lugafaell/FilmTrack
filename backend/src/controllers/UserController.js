const { User } = require('../models');
const { sendVerificationEmail } = require('../services/emailService');

exports.createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Este email já está sendo utilizado'
      });
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      verified: false
    });

    const verificationToken = user.generateVerificationToken();

    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.verificationTokenExpires;

    res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso. Verifique seu email para ativar sua conta.',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
    try {
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Você só pode atualizar seu próprio perfil'
        });
      }
  
      const { name, email } = req.body;
      const updateData = {};
  
      if (name) updateData.name = name;
      if (email) {
        const existingUser = await User.findOne({ 
          email, 
          _id: { $ne: req.user._id } 
        });
        
        if (existingUser) {
          return res.status(400).json({
            status: 'error',
            message: 'Este email já está sendo utilizado'
          });
        }
        
        updateData.email = email;
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-__v');
  
      if (!updatedUser) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado'
        });
      }
  
      res.status(200).json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };
  
  exports.updatePassword = async (req, res) => {
    try {
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Você só pode atualizar sua própria senha'
        });
      }
  
      const user = await User.findById(req.params.id).select('+password');
  
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado'
        });
      }
  
      const { currentPassword, newPassword } = req.body;
  
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Por favor, forneça a senha atual e a nova senha'
        });
      }
  
      if (!(await user.matchPassword(currentPassword))) {
        return res.status(401).json({
          status: 'error',
          message: 'Senha atual incorreta'
        });
      }
  
      user.password = newPassword;
      await user.save();
  
      res.status(200).json({
        status: 'success',
        message: 'Senha atualizada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };
  
  exports.deleteUser = async (req, res) => {
    try {
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Você só pode excluir seu próprio perfil'
        });
      }
      
      const result = await User.deleteUserAndData(req.params.id);
      
      if (!result.success) {
        return res.status(404).json({
          status: 'error',
          message: result.message
        });
      }
  
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };