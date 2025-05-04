import LoginForm from "../../components/LoginForm/LoginForm"
import FilmReel from "../../components/FilmReel/FilmReel"
import MovieSpotlight from "../../components/MovieSpotlight/MovieSpotlight"
import "./LoginPage.css"

function LoginPage() {
  return (
    <main className="app-container">
      <LoginForm />
      <div className="cinema-panel">
        <MovieSpotlight />
        <FilmReel position="bottom" />
        <FilmReel position="top" />

        <div className="overlay"></div>

        <div className="content">
          <div className="logo-container animate-float">
            <div className="logo-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="logo-icon"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v4" />
                <path d="M12 21v-4" />
                <path d="M3 12h4" />
                <path d="M21 12h-4" />
                <path d="m8.5 8.5 2 2" />
                <path d="m13.5 13.5 2 2" />
                <path d="m8.5 15.5 2-2" />
                <path d="m13.5 10.5 2-2" />
              </svg>
            </div>
          </div>
          <h2 className="title animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Bem-vindo ao FilmTrack
          </h2>
          <p className="subtitle animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            Sua jornada cinematográfica começa aqui
          </p>

          <div className="features-container">
            <div className="features-grid">
              <div className="feature-card animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                <div className="feature-header">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feature-icon"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 3v18" />
                    <path d="M3 7h18" />
                    <path d="M3 11h18" />
                    <path d="M3 15h18" />
                    <path d="M3 19h18" />
                    <path d="M17 3v18" />
                  </svg>
                  <h3 className="feature-title">Catálogo</h3>
                </div>
                <p className="feature-description">Organize sua coleção de filmes</p>
              </div>
              <div className="feature-card animate-fade-in-up" style={{ animationDelay: "800ms" }}>
                <div className="feature-header">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feature-icon"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h3 className="feature-title">Avaliações</h3>
                </div>
                <p className="feature-description">Faça avaliações do seus filmes favoritos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage