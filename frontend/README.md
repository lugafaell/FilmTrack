# Documentação Frontend do FilmTrack

## Visão Geral do Projeto

FilmTrack é uma aplicação React TypeScript construída com Vite, projetada para rastrear e gerenciar coleções de filmes. A aplicação integra-se com a API TMDB (The Movie Database) para buscar dados de filmes, incluindo pôsteres e outras informações relevantes.

## Stack Tecnológica

- **Framework**: React 18+
- **Linguagem**: TypeScript
- **Ferramenta de Build**: Vite
- **API Externa**: TMDB (The Movie Database)
- **Estilização**: Módulos CSS

## Estrutura do Projeto

```
frontend/
├── public/
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── FilmReel/
│   │   ├── Header/
│   │   ├── LoginForm/
│   │   ├── MainContent/
│   │   ├── MovieAddModal/
│   │   ├── MovieCard/
│   │   ├── MovieGrid/
│   │   ├── MovieModal/
│   │   ├── MovieSpotlight/
│   │   ├── NotificationModal/
│   │   ├── ProtectedRoute/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.css
│   │   │   └── Sidebar.tsx
│   │   └── UserSidebar/
│   │       ├── UserSidebar.css
│   │       └── UserSidebar.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── MovieContext.tsx
│   ├── pages/
│   │   ├── HomePage/
│   │   └── LoginPage/
│   ├── types/
│   │   └── types.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
└── README.md
```

## Componentes Principais

### Componentes de Autenticação

1. **LoginForm/**
   - Gerencia a autenticação do usuário
   - Coleta credenciais de login
   - Gerencia o estado de login, registro e recuperação de senha

2. **ProtectedRoute/**
   - Restringe o acesso apenas a usuários autenticados
   - Redireciona usuários não autenticados para a página de login
   - Protege rotas privadas

### Componentes de Gerenciamento de Filmes

1. **MovieCard/**
   - Exibe informações individuais do filme
   - Mostra o pôster do filme da TMDB

2. **MovieGrid/**
   - Organiza vários componentes MovieCard em um layout de grade
   - Gerencia paginação e filtragem

3. **MovieModal/**
   - Exibe informações detalhadas sobre um filme selecionado
   - Mostra metadados adicionais
   - Interações do usuário como avaliações e status

4. **MovieAddModal/**
   - Interface para adicionar novos filmes à coleção
   - Inclui formulário para detalhes do filme
   - Inclui de usuário como avaliações e status do filme(assistido/assistir depois)

### Componentes de Navegação

1. **Header/**
   - Cabeçalho da aplicação com controles de navegação
   - Funcionalidade de pesquisa
   - Acesso ao perfil do usuário

2. **Sidebar/** & **UserSidebar/**
   - Menus de navegação para a aplicação
   - Navegação específica do usuário no UserSidebar

### Componentes de Layout

1. **MainContent/**
   - Contêiner de conteúdo principal
   - Gerencia o layout da área de conteúdo principal

2. **FilmReel/**
   - Componente decorativo para apelo visual
   - Usado como elemento de fundo

### Componentes Utilitários

1. **NotificationModal/**
   - Exibe notificações
   - Fornece lembretes personalizados

## API de Contexto

A aplicação utiliza a API de Contexto do React para gerenciamento de estado:

1. **AuthContext.tsx**
   - Gerencia o estado de autenticação do usuário
   - Fornece informações do usuário para componentes
   - Gerencia login, logout e gestão de sessão

2. **MovieContext.tsx**
   - Gerencia o estado dos dados dos filmes
   - Fornece informações sobre filmes para componentes
   - Gerencia operações CRUD para filmes

## Páginas

1. **HomePage/**
   - Página principal após autenticação
   - Exibe a coleção de filmes

2. **LoginPage/**
   - Página de autenticação do usuário
   - Inclui o componente LoginForm
   - Gerencia redirecionamentos baseados no status de autenticação

## Definições de Tipos

- **types.ts**
  - Contém interfaces e tipos TypeScript para a aplicação
  - Define a estrutura de dados dos filmes
  - Define a estrutura de dados do usuário

## Integração com API TMDB

A aplicação integra-se com a API The Movie Database (TMDB) para:

1. Buscar informações de filmes (detalhes, elenco, avaliações)
2. Acessar pôsteres e imagens de fundo dos filmes
3. Pesquisar filmes por título, ator ou outros critérios

## Como Começar

### Pré-requisitos

- Node.js (v14+ recomendado)
- npm ou yarn

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
   ou
   ```bash
   yarn
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` no diretório raiz
   - Adicione sua chave de API TMDB:
     ```
     VITE_TMDB_API_KEY=sua_chave_api_aqui
     ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   ou
   ```bash
   yarn dev
   ```

5. Abra http://localhost:5173 no seu navegador

## Build para Produção

```bash
npm run build
```
ou
```bash
yarn build
```

## Diretrizes de Desenvolvimento de Componentes

### Adicionando Novos Componentes

1. Crie uma nova pasta no diretório `components`
2. Crie o arquivo do componente com extensão `.tsx`
3. Crie o arquivo CSS associado, se necessário
4. Exporte o componente como padrão

### Convenção de Estilização

- Use módulos CSS para estilos específicos de componentes
- Mantenha estilos globais em `index.css` ou `App.css`
- Siga a convenção de nomenclatura BEM para classes CSS

## Fluxo de Autenticação

1. O usuário navega para a aplicação
2. AuthContext verifica a existência de uma sessão
3. Se não houver sessão válida, redireciona para LoginPage
4. O usuário envia credenciais via LoginForm
5. Após autenticação bem-sucedida, o usuário é redirecionado para HomePage
6. Rotas protegidas verificam o status de autenticação antes de renderizar

## Gerenciamento de Dados de Filmes

1. MovieContext gerencia o estado da coleção de filmes
2. Chamadas à API TMDB são feitas para buscar detalhes dos filmes
3. Usuários podem adicionar, remover e atualizar filmes em sua coleção
4. MovieModal fornece uma visualização detalhada dos filmes selecionados
5. MovieAddModal permite adicionar novos filmes à coleção

## Recursos Externos

- [Documentação da API TMDB](https://developers.themoviedb.org/3/getting-started/introduction)
- [Documentação do React](https://pt-br.reactjs.org/docs/getting-started.html)
- [Documentação do TypeScript](https://www.typescriptlang.org/pt/docs/)
- [Documentação do Vite](https://vitejs.dev/guide/)