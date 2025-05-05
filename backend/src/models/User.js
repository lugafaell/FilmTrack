const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, forneça um email válido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = token;
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return token;
};

userSchema.statics.deleteUserAndData = async function(userId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const user = await this.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: 'Usuário não encontrado' };
    }
    
    const notificationResult = await mongoose.model('Notification').deleteMany(
      { user: userId },
      { session }
    );
    console.log(`${notificationResult.deletedCount} notificações removidas`);
    
    const movieResult = await mongoose.model('Movie').deleteMany(
      { user: userId },
      { session }
    );
    console.log(`${movieResult.deletedCount} filmes removidos`);
    
    await this.findByIdAndDelete(userId).session(session);
    console.log(`Usuário ${userId} removido com sucesso`);
    
    await session.commitTransaction();
    session.endSession();
    
    return { 
      success: true, 
      message: 'Usuário e dados relacionados removidos com sucesso',
      deletedMovies: movieResult.deletedCount,
      deletedNotifications: notificationResult.deletedCount
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Erro ao remover usuário e dados relacionados:', error);
    return { success: false, message: error.message };
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;