module.exports = {
    secret: process.env.JWT_SECRET || 'sua_chave_secreta_para_desenvolvimento',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  };