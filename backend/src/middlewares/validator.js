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
  
  module.exports = {
    validateUserCreation,
    validateLogin,
    validateUserUpdate,
    validatePasswordUpdate
  };