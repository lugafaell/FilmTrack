import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../../context/authContext";
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Loader2, Clapperboard, UserPlus, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./LoginForm.css"

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({})
  const [mounted, setMounted] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid) {
      setFieldErrors(prev => ({ ...prev, email: "Email inválido. Por favor, insira um email no formato correto." }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
    
    return isValid;
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    const isValid = passwordRegex.test(password);
    
    if (!isValid) {
      setFieldErrors(prev => ({ ...prev, 
        password: "A senha deve ter no mínimo 6 caracteres, incluindo uma letra maiúscula, uma minúscula e um número." 
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
    
    return isValid;
  };

  const validateName = (name: string): boolean => {
    const nameWords = name.trim().split(/\s+/);
    
    const validWords = nameWords.every(word => {
      return word.length >= 2 && /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(word);
    });
    
    const isValid = nameWords.length >= 2 && validWords;
    
    if (!isValid) {
      if (nameWords.length < 2) {
        setFieldErrors(prev => ({ ...prev, name: "Por favor, insira seu nome completo (nome e sobrenome)." }));
      } else if (!validWords) {
        setFieldErrors(prev => ({ ...prev, name: "Nome inválido. Use apenas letras e cada nome deve ter pelo menos 2 caracteres." }));
      }
    } else {
      setFieldErrors(prev => ({ ...prev, name: undefined }));
    }
    
    return isValid;
  };

  const validateForm = (): boolean => {
    if (isRegisterMode) {
      const isNameValid = validateName(name);
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      
      return isNameValid && isEmailValid && isPasswordValid;
    } else {
      return email.trim() !== "" && password.trim() !== "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    setError("");
  
    if (isRegisterMode) {
      if (!name || !email || !password) {
        setError("Por favor, preencha todos os campos");
        return;
      }
      
      if (!validateForm()) {
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          if (data.message.includes("email")) {
            setFieldErrors(prev => ({ ...prev, email: "Este email já está em uso." }));
          } else if (data.message.includes("senha") || data.message.includes("password")) {
            setFieldErrors(prev => ({ ...prev, password: data.message }));
          } else if (data.message.includes("nome") || data.message.includes("name")) {
            setFieldErrors(prev => ({ ...prev, name: data.message }));
          } else {
            throw new Error(data.message || 'Erro ao Realizar o Registro');
          }
          setIsLoading(false);
          return;
        }
        
        setIsLoading(false);

        setTimeout(() => {
          setIsRegisterMode(false);
          setIsLoading(false);
        }, 1000);
      } catch (err: any) {
        setError(err.message || "Erro ao registrar usuário");
        setIsLoading(false);
      }
    } else {
      if (!email || !password) {
        setError("Por favor, preencha todos os campos");
        return;
      }
    
      setIsLoading(true);
    
      try {
        const response = await fetch('http://localhost:3000/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao fazer login');
        }
    
        login(data.data.user, data.token);
        
        setIsLoading(false);
        
      } catch (err: any) {
        setError(err.message || "Credenciais inválidas. Por favor, tente novamente.");
        setIsLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setFieldErrors({});
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (isRegisterMode && value.length > 3) {
      validateName(value);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (isRegisterMode && value.includes('@')) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (isRegisterMode && value.length >= 6) {
      validatePassword(value);
    }
  };

  if (!mounted) {
    return null
  }

  return (
    <div className="login-container">
      <motion.div
        className="login-form-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="login-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="logo-container"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="logo">
              <motion.div
                className="logo-icon-container"
                animate={{
                  boxShadow: [
                    "0px 0px 0px rgba(0,0,0,0.2)",
                    "0px 0px 20px rgba(79, 70, 229, 0.5)",
                    "0px 0px 0px rgba(0,0,0,0.2)",
                  ],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: "easeInOut",
                }}
              >
                <Clapperboard size={28} />
              </motion.div>
              <div className="logo-text">
                <span className="logo-title">FilmTrack</span>
                <div className="logo-subtitle">Sua jornada cinematográfica</div>
              </div>
            </div>
          </motion.div>
          <motion.h1
            className="login-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            key={isRegisterMode ? "register-title" : "login-title"}
          >
            {isRegisterMode ? "Criar nova conta" : "Acesse sua conta"}
          </motion.h1>
          <motion.p
            className="login-subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            key={isRegisterMode ? "register-subtitle" : "login-subtitle"}
          >
            {isRegisterMode 
              ? "Comece sua jornada cinematográfica hoje mesmo!" 
              : "Bem-vindo de volta! Entre para acessar sua coleção de filmes."}
          </motion.p>
        </motion.div>

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={16} className="error-icon" />
            {error}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {isRegisterMode && (
              <motion.div
                className="form-group"
                key="name-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                <label htmlFor="name" className="label">
                  Nome Completo
                </label>
                <motion.div
                  className={`input-container ${fieldErrors.name ? 'input-error' : ''}`}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={() => name && validateName(name)}
                    className="input"
                    required
                  />
                </motion.div>
                {fieldErrors.name && (
                  <motion.p
                    className="field-error-message"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle size={14} className="field-error-icon" />
                    {fieldErrors.name}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label htmlFor="email" className="label">
              Email
            </label>
            <motion.div
              className={`input-container ${fieldErrors.email ? 'input-error' : ''}`}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => email && validateEmail(email)}
                className="input"
                required
              />
            </motion.div>
            {fieldErrors.email && (
              <motion.p
                className="field-error-message"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle size={14} className="field-error-icon" />
                {fieldErrors.email}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="label-container">
              <label htmlFor="password" className="label">
                Senha
              </label>
              {!isRegisterMode && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a href="/esqueci-senha" className="forgot-password">
                    Esqueceu a senha?
                  </a>
                </motion.div>
              )}
            </div>
            <motion.div
              className={`input-container ${fieldErrors.password ? 'input-error' : ''}`}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => isRegisterMode && password && validatePassword(password)}
                className="input"
                required
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
              </motion.button>
            </motion.div>
            {fieldErrors.password && (
              <motion.p
                className="field-error-message"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle size={14} className="field-error-icon" />
                {fieldErrors.password}
              </motion.p>
            )}
            {isRegisterMode && !fieldErrors.password && password && (
              <motion.p 
                className="password-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Senha deve ter pelo menos 6 caracteres, uma letra maiúscula, uma minúscula e um número.
              </motion.p>
            )}
          </motion.div>

          {!isRegisterMode && (
            <motion.div
              className="remember-container"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <input type="checkbox" id="remember" className="checkbox" />
              <label htmlFor="remember" className="remember-label">
                Lembrar de mim
              </label>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <motion.button
              type="submit"
              className="submit-button-login"
              disabled={isLoading || (isRegisterMode && (!!fieldErrors.name || !!fieldErrors.email || !!fieldErrors.password))}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>{isRegisterMode ? "Registrando..." : "Entrando..."}</span>
                </>
              ) : (
                <>
                  <span>{isRegisterMode ? "Registrar" : "Entrar"}</span>
                  {isRegisterMode ? <UserPlus size={18} /> : <ArrowRight size={18} />}
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.p
          className="signup-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          {isRegisterMode ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
          <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: "inline-block" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }} className="signup-link">
              {isRegisterMode ? "Fazer login" : "Criar conta"}
            </a>
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default LoginForm