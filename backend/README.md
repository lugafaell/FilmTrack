# FilmTrack - Documentação da API

## Índice
- [Introdução](#introdução)
- [Arquitetura](#arquitetura)
- [Configuração e Instalação](#configuração-e-instalação)
- [Modelos de Dados](#modelos-de-dados)
- [Rotas da API](#rotas-da-api)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Serviços de Email](#serviços-de-email)
- [Serviços Agendados](#serviços-agendados)
- [Middlewares](#middlewares)

## Introdução

FilmTrack é uma aplicação para gerenciamento e acompanhamento de filmes. Permite aos usuários criar uma coleção pessoal de filmes, marcar como assistidos, adicionar à lista para assistir posteriormente, e receber notificações sobre disponibilidade em plataformas de streaming e lançamentos de diretores favoritos.

Este documento apresenta a documentação técnica do backend da aplicação, desenvolvido com Node.js, Express e MongoDB, seguindo os princípios de arquitetura RESTful.

## Arquitetura

O backend segue uma arquitetura RESTful com padrão MVC (Model-View-Controller) com as seguintes camadas:

- **Models**: Define a estrutura dos dados e interage com o banco de dados MongoDB
- **Controllers**: Implementa a lógica de negócios e manipula as requisições/respostas HTTP
- **Routes**: Define os endpoints da API e conecta as requisições aos controladores apropriados
- **Middlewares**: Fornece funcionalidades compartilhadas como validação, autenticação e tratamento de erros
- **Services**: Serviços auxiliares como envio de emails e jobs agendados

A API segue os princípios REST:
- Comunicação stateless
- Uso adequado dos métodos HTTP (GET, POST, PUT, PATCH, DELETE)
- Utilização de URIs para identificar recursos
- Formatação padronizada de respostas JSON

## Configuração e Instalação

### Pré-requisitos
- Node.js (v12 ou superior)
- MongoDB
- Conta para envio de emails (para notificações e verificação de contas)
- Chave de API do TMDB (para informações de filmes)

### Configuração do Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/filmtrack
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=90d
EMAIL_SERVICE=seu_servico_email
EMAIL_USER=seu_email
EMAIL_PASSWORD=sua_senha_email
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
TMDB_API_KEY=sua_chave_api_tmdb
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/filmtrack.git

# Instale as dependências
cd filmtrack
npm install

# Inicie o servidor
npm start
```

## Modelos de Dados

### Movie

Representa um filme na coleção do usuário.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| title | String | Título do filme (obrigatório) |
| tmdbId | Number | ID do filme no TMDB (obrigatório, único por usuário) |
| releaseYear | Number | Ano de lançamento do filme (obrigatório) |
| synopsis | String | Sinopse do filme (obrigatório) |
| duration | Number | Duração em minutos (obrigatório) |
| posterUrl | String | URL da imagem do poster |
| genre | [String] | Lista de gêneros do filme (obrigatório) |
| director | String | Diretor do filme (obrigatório) |
| mainCast | [String] | Elenco principal do filme (obrigatório) |
| userRating | Number | Avaliação do usuário (0-5, padrão: 0) |
| watchProviders | [String] | Lista de provedores de streaming |
| status | String | Status do filme (watched, watchLater, none) |
| user | ObjectId | Referência ao usuário proprietário (obrigatório) |
| createdAt | Date | Data de criação do registro |
| updatedAt | Date | Data da última atualização |

### Notification

Representa uma notificação para o usuário.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| user | ObjectId | Referência ao usuário destinatário (obrigatório) |
| title | String | Título da notificação (obrigatório) |
| message | String | Mensagem da notificação (obrigatório) |
| type | String | Tipo da notificação (streaming_available, watch_reminder, director_release) |
| isRead | Boolean | Indica se a notificação foi lida (padrão: false) |
| movieId | ObjectId | Referência ao filme relacionado (opcional) |
| tmdbId | Number | ID do filme no TMDB (opcional) |
| movieIds | [ObjectId] | Lista de filmes relacionados (opcional) |
| createdAt | Date | Data de criação da notificação |

### User

Representa um usuário do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| name | String | Nome do usuário (obrigatório) |
| email | String | Email do usuário (obrigatório, único) |
| password | String | Senha criptografada (obrigatório, min: 6 caracteres) |
| createdAt | Date | Data de criação da conta |
| verified | Boolean | Indica se o email foi verificado (padrão: false) |
| verificationToken | String | Token para verificação de email |
| verificationTokenExpires | Date | Data de expiração do token de verificação |

### PasswordReset

Representa um pedido de redefinição de senha.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| email | String | Email do usuário (obrigatório) |
| resetCode | String | Código de redefinição (obrigatório) |
| expiresAt | Date | Data de expiração do código (obrigatório) |
| used | Boolean | Indica se o código já foi utilizado (padrão: false) |
| createdAt | Date | Data de criação do pedido |
| updatedAt | Date | Data da última atualização |

## Rotas da API

### Autenticação

| Método | Rota | Descrição | Parâmetros |
|--------|------|-----------|------------|
| POST | /api/auth/login | Autentica um usuário | `email`, `password` |
| GET | /api/auth/verify-email/:token | Verifica o email do usuário | `token` (URL param) |
| POST | /api/auth/resend-verification | Reenvia email de verificação | `email` |
| POST | /api/auth/forgot-password | Solicita redefinição de senha | `email` |
| POST | /api/auth/reset-password | Redefine a senha do usuário | `email`, `resetCode` |

### Filmes

Todas as rotas de filmes exigem autenticação.

| Método | Rota | Descrição | Parâmetros |
|--------|------|-----------|------------|
| GET | /api/movies | Lista todos os filmes do usuário | - |
| GET | /api/movies/tmdb/:tmdbId | Busca filme pelo ID do TMDB | `tmdbId` (URL param) |
| GET | /api/movies/by-provider/:provider | Lista filmes por provedor | `provider` (URL param) |
| GET | /api/movies/:id | Busca filme pelo ID interno | `id` (URL param) |
| POST | /api/movies | Adiciona um novo filme | `title`, `tmdbId`, `releaseYear`, `synopsis`, `duration`, `posterUrl`, `genre`, `director`, `mainCast`, `watchProviders`, `status` |
| PATCH | /api/movies/:id | Atualiza um filme | `id` (URL param) + campos a atualizar |
| DELETE | /api/movies/:id | Remove um filme | `id` (URL param) |

### Notificações

Todas as rotas de notificações exigem autenticação.

| Método | Rota | Descrição | Parâmetros |
|--------|------|-----------|------------|
| GET | /api/notifications | Lista notificações do usuário | - |
| PATCH | /api/notifications/:id/read | Marca notificação como lida | `id` (URL param) |
| PATCH | /api/notifications/mark-all-read | Marca todas como lidas | - |
| DELETE | /api/notifications/:id | Remove uma notificação | `id` (URL param) |

### Usuários

| Método | Rota | Descrição | Parâmetros |
|--------|------|-----------|------------|
| POST | /api/users | Cria um novo usuário | `name`, `email`, `password` |
| GET | /api/users | Lista todos os usuários (requer auth) | - |
| GET | /api/users/:id | Busca usuário pelo ID (requer auth) | `id` (URL param) |
| PATCH | /api/users/:id | Atualiza dados do usuário (requer auth) | `id` (URL param) + `name`, `email` |
| PATCH | /api/users/:id/password | Atualiza senha (requer auth) | `id` (URL param) + `currentPassword`, `newPassword` |
| DELETE | /api/users/:id | Remove um usuário (requer auth) | `id` (URL param) |

## Autenticação e Segurança

### Autenticação

O sistema utiliza autenticação baseada em JWT (JSON Web Token):

1. O usuário se autentica com email e senha
2. O servidor gera um token JWT assinado
3. O cliente envia o token em todas as requisições subsequentes no cabeçalho `Authorization`
4. O middleware `protect` verifica a validade do token antes de permitir acesso às rotas protegidas

### Segurança de Senhas

- As senhas são armazenadas com hash usando bcryptjs
- Senhas temporárias são geradas automaticamente para redefinição
- Tokens de verificação de email e códigos de reset de senha têm expiração automática

### Validação de Email

O sistema implementa verificação de email por meio de tokens:

1. Durante o registro, um token de verificação é gerado
2. Um email é enviado com link para verificação
3. O usuário precisa verificar o email antes de fazer login
4. Tokens não utilizados expiram após 24 horas

## Serviços de Email

O serviço de email gerencia o envio de diferentes tipos de comunicações aos usuários. Utiliza o pacote `nodemailer` e está configurado com templates HTML responsivos e esteticamente agradáveis.

### Funcionalidades Principais

1. **Emails de Verificação de Conta**
   - **Função**: `sendVerificationEmail(email, name, verificationToken)`
   - **Descrição**: Envia um email com link de verificação após o cadastro do usuário
   - **Template**: Design personalizado com identidade visual do FilmTrack, incluindo cabeçalho, botão de ação e instruções claras

2. **Códigos de Redefinição de Senha**
   - **Função**: `sendPasswordResetCode(email, name, resetCode)`
   - **Descrição**: Envia um código numérico para validar a solicitação de redefinição de senha
   - **Template**: Apresenta o código em destaque, com instruções de segurança e prazo de validade

3. **Envio de Nova Senha**
   - **Função**: `sendNewPasswordEmail(email, name, newPassword)`
   - **Descrição**: Após redefinição bem-sucedida, envia uma senha temporária gerada automaticamente
   - **Template**: Exibe a nova senha em formato destacado e incentiva o login imediato com troca posterior

### Design e Componentização

Todos os emails seguem um padrão visual consistente:
- **Cabeçalho**: Logo do FilmTrack e tagline
- **Corpo**: Conteúdo personalizado com saudação nominal
- **Rodapé**: Informações legais, ano atual gerado dinamicamente e disclaimers de segurança
- **Elementos visuais**: Detalhes estilísticos como "film-strip" nas bordas superior e inferior

### Configuração

O serviço utiliza as seguintes variáveis de ambiente:
- `EMAIL_USER`: Endereço de email remetente
- `EMAIL_PASSWORD`: Senha da conta de email
- `BASE_URL`: URL base para composição de links funcionais

## Serviços Agendados

O sistema implementa tarefas agendadas (cron jobs) para executar operações automáticas em horários específicos, utilizando o pacote `node-cron`.

### Jobs Implementados

1. **Verificação de Disponibilidade em Streaming** (Diariamente às 03:00)
   - **Finalidade**: Verificar se filmes na lista "para assistir depois" tornaram-se disponíveis em serviços de streaming
   - **Funcionamento**:
     - Consulta a API do TMDB para cada filme na watchlist
     - Atualiza os provedores de streaming no banco de dados
     - Gera notificações para o usuário quando um filme se torna disponível
     - Evita notificações duplicadas verificando histórico recente (7 dias)

2. **Lembretes de Filmes na Watchlist** (Diariamente às 03:00)
   - **Finalidade**: Lembrar usuários sobre filmes que estão há muito tempo na lista "para assistir depois"
   - **Funcionamento**:
     - Identifica filmes que estão há mais de um mês na watchlist
     - Agrupa filmes em uma única notificação (até 3 filmes)
     - Evita enviar lembretes repetidos verificando notificações existentes

3. **Novos Lançamentos de Diretores Favoritos** (Segundas-feiras às 10:00)
   - **Finalidade**: Informar sobre novos filmes de diretores que o usuário demonstra preferência
   - **Funcionamento**:
     - Identifica diretores favoritos com base em avaliações do usuário (filmes com nota ≥ 4)
     - Consulta a API do TMDB para obter filmes recentes ou próximos lançamentos
     - Considera lançamentos entre os últimos 3 meses e próximos 6 meses
     - Gera notificações personalizadas com detalhes do lançamento

### Integração com API Externa

Os jobs utilizam a API do TMDB (The Movie Database) para:
- Buscar informações de disponibilidade em plataformas de streaming
- Obter informações sobre diretores baseado em nome
- Pesquisar filmografias e datas de lançamento

### Tratamento de Erros

Todos os jobs implementam:
- Logging detalhado para monitoramento da execução
- Tratamento de exceções para evitar falhas que interrompam a execução
- Mecanismos para evitar duplicação de notificações

## Middlewares

### Validação

O sistema utiliza middlewares de validação para garantir que os dados recebidos estejam no formato correto:

- `validateLogin`: Valida os dados de login
- `validateResendVerification`: Valida pedidos de reenvio de email de verificação
- `validateForgotPassword`: Valida pedidos de redefinição de senha
- `validateResetPassword`: Valida os dados para redefinição de senha
- `validateUserCreation`: Valida os dados para criação de usuário
- `validateUserUpdate`: Valida os dados para atualização de usuário
- `validatePasswordUpdate`: Valida os dados para atualização de senha
- `validateMovieCreation`: Valida os dados para criação de filme

### Proteção de Rotas

O middleware `protect` garante que apenas usuários autenticados possam acessar determinadas rotas:

1. Verifica a presença do token JWT no cabeçalho `Authorization`
2. Decodifica e valida o token
3. Busca o usuário associado ao token
4. Adiciona as informações do usuário à requisição para uso nos controladores

## Considerações Finais

Esta documentação fornece uma visão geral do backend da aplicação FilmTrack, uma API RESTful desenvolvida com Express e MongoDB. A arquitetura modular, os serviços automatizados e a atenção à experiência do usuário (através de notificações e emails personalizados) garantem uma plataforma robusta para gerenciamento de coleções de filmes.

Para mais informações detalhadas sobre implementações específicas, consulte os comentários no código-fonte ou entre em contato com o desenvolvedor.

---

*Documentação atualizada em 05/05/2025*