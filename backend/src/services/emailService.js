const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const BASE_URL = 'http://localhost:3000';
    const EMAIL_USER = 'rafaeldemenezes39@gmail.com';
    const EMAIL_PASSWORD = 'folw lpft cafj vdmw';
    const verificationUrl = `${BASE_URL}/api/v1/auth/verify-email/${verificationToken}`;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme seu cadastro no FilmTrack</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #1a237e;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin: 0;
          }
          .tagline {
            color: #e0e0e0;
            margin-top: 5px;
          }
          .content {
            padding: 30px;
            background-color: #ffffff;
          }
          h1 {
            color: #1a237e;
            margin-top: 0;
          }
          .message {
            margin-bottom: 25px;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            background-color: #f44336;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #d32f2f;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #757575;
          }
          .disclaimer {
            font-size: 13px;
            margin-top: 15px;
          }
          .highlight {
            color: #f44336;
            font-weight: bold;
          }
          .film-strip {
            height: 10px;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAYAAACjd+4vAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAGJJREFUOBFjYBgFIBsIiGT9B2HnJwYgrYfNT7JmJkaQ6QpK/4E0SB0jI4iNKUDmnkjxf0wh1DkkS5IkCTI5iA0TJYVNkhpsehmxeRdkODZ1pIiRpIdkBeToGVXIMDIDAOcHDDcjF8H+AAAAAElFTkSuQmCC');
            background-repeat: repeat-x;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="film-strip"></div>
          <div class="header">
            <h1 class="logo">FilmTrack</h1>
            <p class="tagline">Catalogue, avalie e descubra filmes incríveis</p>
          </div>
          <div class="content">
            <h1>Olá, ${name}!</h1>
            <p class="message">Estamos muito felizes em tê-lo(a) como parte da comunidade FilmTrack! Para começar a catalogar seus filmes, precisamos verificar seu email.</p>
            <p class="message">Por favor, clique no botão abaixo para ativar sua conta:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Minha Conta</a>
            </div>
            
            <p class="message">Se o botão acima não funcionar, você também pode copiar e colar o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; font-size: 14px; color: #666; margin-bottom: 25px;">${verificationUrl}</p>
            
            <p class="message">Após a verificação, você terá acesso completo a todas as funcionalidades do <span class="highlight">FilmTrack</span>, incluindo:</p>
            <ul>
              <li>Catalogar seus filmes </li>
              <li>Adicionar a sua lista para assistir depois</li>
              <li>Avaliar sua experiência</li>
              <li>Estatísticas personalizadas</li>
            </ul>
            
            <p class="message">Estamos ansiosos para ajudá-lo(a) a explorar e organizar seu mundo cinematográfico!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} FilmTrack - Todos os direitos reservados</p>
            <p class="disclaimer">Este email foi enviado para ${email} porque você se cadastrou no FilmTrack. Se não foi você, por favor ignore este email.</p>
            <p>O link de verificação expira em 24 horas.</p>
          </div>
          <div class="film-strip"></div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"FilmTrack" <${EMAIL_USER}>`,
      to: email,
      subject: '🎬 Confirme seu cadastro no FilmTrack',
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email de verificação enviado para ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
    throw new Error(`Erro ao enviar email de verificação: ${error.message}`);
  }
};

module.exports = { sendVerificationEmail };