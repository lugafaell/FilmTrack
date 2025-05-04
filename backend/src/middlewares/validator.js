const { body, validationResult } = require('express-validator');

const validateUserCreation = [
  body('name')
    .notEmpty().withMessage('Nome é obrigatório')
    .trim(),
  
  body('email')
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    next();
  }
];

const validateLogin = [
    body('email')
      .notEmpty().withMessage('Email é obrigatório')
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Senha é obrigatória'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error', 
          errors: errors.array() 
        });
      }
      next();
    }
  ];
  
  const validateUserUpdate = [
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Nome não pode ser vazio'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error', 
          errors: errors.array() 
        });
      }
      next();
    }
  ];
  
  const validatePasswordUpdate = [
    body('currentPassword')
      .notEmpty().withMessage('Senha atual é obrigatória'),
    
    body('newPassword')
      .notEmpty().withMessage('Nova senha é obrigatória')
      .isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .withMessage('Nova senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error', 
          errors: errors.array() 
        });
      }
      next();
    }
  ];
  
  const validateMovieCreation = [
    body('title')
      .notEmpty().withMessage('Título é obrigatório')
      .trim(),
    
    body('releaseYear')
      .notEmpty().withMessage('Ano de lançamento é obrigatório')
      .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
      .withMessage(`Ano de lançamento deve ser um número entre 1888 e ${new Date().getFullYear() + 5}`),
    
    body('synopsis')
      .notEmpty().withMessage('Sinopse é obrigatória')
      .trim(),
    
    body('duration')
      .notEmpty().withMessage('Duração é obrigatória')
      .isInt({ min: 1 }).withMessage('Duração deve ser um número inteiro positivo'),
    
    body('genre')
      .notEmpty().withMessage('Gênero é obrigatório')
      .isArray().withMessage('Gênero deve ser um array'),
    
    body('director')
      .notEmpty().withMessage('Diretor é obrigatório')
      .trim(),
    
    body('mainCast')
      .notEmpty().withMessage('Elenco principal é obrigatório')
      .isArray().withMessage('Elenco principal deve ser um array'),
    
    body('userRating')
      .optional()
      .isFloat({ min: 0, max: 5 }).withMessage('Avaliação deve ser um número entre 0 e 5'),
    
    body('status')
      .optional()
      .isIn(['watched', 'watchLater', 'none']).withMessage('Status deve ser "watched", "watchLater" ou "none"'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error', 
          errors: errors.array() 
        });
      }
      next();
    }
  ];

  const validateResendVerification = [
    body('email')
      .notEmpty().withMessage('Email é obrigatório')
      .isEmail().withMessage('Forneça um email válido'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }
      next();
    }
  ];
  
  module.exports = {
    validateUserCreation,
    validateLogin,
    validateUserUpdate,
    validatePasswordUpdate,
    validateMovieCreation,
    validateResendVerification
  };