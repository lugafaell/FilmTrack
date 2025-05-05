const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    lowercase: true
  },
  resetCode: {
    type: String,
    required: [true, 'Código de reset é obrigatório']
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

passwordResetSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > Date.now();
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;