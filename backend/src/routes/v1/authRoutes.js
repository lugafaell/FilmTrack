const express = require('express');
const router = express.Router();
const { authController } = require('../../controllers');
const { validateLogin, validateResendVerification } = require('../../middlewares/validator');

router.post('/login', validateLogin, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', validateResendVerification, authController.resendVerificationEmail);

module.exports = router;