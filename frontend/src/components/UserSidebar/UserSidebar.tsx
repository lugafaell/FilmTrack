import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UserData, PasswordData, UserSidebarProps } from '../../types/types';
import "./UserSidebar.css"

export const UserSidebar: React.FC<UserSidebarProps> = ({
    isControlled = false,
    isOpenExternal = false,
    onCloseExternal
}) => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(isControlled ? isOpenExternal : false)
    const [activeSection, setActiveSection] = useState<string | null>(null)
    const [userData, setUserData] = useState<UserData>({
        name: "",
        email: "",
    })

    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [isLoading, setIsLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [toastMessage, setToastMessage] = useState<{
        visible: boolean
        message: string
        type: "success" | "error"
    }>({
        visible: false,
        message: "",
        type: "success",
    })

    useEffect(() => {
        try {
            const userDataString = localStorage.getItem('user')
            if (userDataString) {
                const storedUserData = JSON.parse(userDataString)
                if (storedUserData) {
                    setUserData({
                        name: storedUserData.name || "",
                        email: storedUserData.email || "",
                        _id: storedUserData._id
                    })
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error)
        }
    }, [])

    useEffect(() => {
        if (isControlled) {
            setIsOpen(isOpenExternal)
        }
    }, [isControlled, isOpenExternal])

    const toggleSidebar = () => {
        const newState = !isOpen
        setIsOpen(newState)

        if (isControlled && onCloseExternal && !newState) {
            onCloseExternal()
        }

        if (newState) {
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setPasswordError("")
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUserData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (passwordError) {
            setPasswordError("")
        }
    }

    const showToast = (message: string, type: "success" | "error") => {
        setToastMessage({
            visible: true,
            message,
            type,
        })

        setTimeout(() => {
            setToastMessage((prev) => ({ ...prev, visible: false }))
        }, 3000)
    }

    const getAuthToken = (): string | null => {
        try {
            return localStorage.getItem('token')
        } catch (error) {
            console.error('Error retrieving auth token:', error)
            return null
        }
    }

    const handleSaveChanges = async () => {
        setIsLoading(true)
        try {
            const token = getAuthToken()
            if (!token) {
                showToast("Autenticação inválida. Faça login novamente.", "error")
                navigate('/')
                return
            }

            const userId = userData._id
            if (!userId) {
                showToast("ID de usuário não encontrado", "error")
                return
            }

            const profileResponse = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email
                })
            })

            if (!profileResponse.ok) {
                const error = await profileResponse.json()
                throw new Error(error.message || 'Erro ao atualizar perfil')
            }

            try {
                const userDataString = localStorage.getItem('user')
                if (userDataString) {
                    const storedUserData = JSON.parse(userDataString)
                    localStorage.setItem('user', JSON.stringify({
                        ...storedUserData,
                        name: userData.name,
                        email: userData.email
                    }))

                    setUserData(prevData => ({
                        ...prevData,
                        name: userData.name,
                        email: userData.email
                    }))
                }
            } catch (error) {
                console.error('Error updating localStorage:', error)
            }

            if (passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword) {
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    setPasswordError("As senhas não coincidem")
                    return
                }

                if (passwordData.newPassword.length < 6) {
                    setPasswordError("A senha deve ter pelo menos 6 caracteres")
                    return
                }

                const passwordResponse = await fetch(`http://localhost:3000/api/v1/users/${userId}/password`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        currentPassword: passwordData.currentPassword,
                        newPassword: passwordData.newPassword
                    })
                })

                if (!passwordResponse.ok) {
                    const error = await passwordResponse.json()
                    throw new Error(error.message || 'Senha atual incorreta')
                }

                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                })
            }

            showToast("Alterações salvas com sucesso!", "success")
        } catch (error) {
            console.error('Error updating user:', error)
            showToast(error instanceof Error ? error.message : "Erro ao salvar alterações", "error")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsLoading(true)
        try {
            const token = getAuthToken()
            if (!token) {
                showToast("Autenticação inválida. Faça login novamente.", "error")
                navigate('/')
                return
            }

            const userId = userData._id
            if (!userId) {
                showToast("ID de usuário não encontrado", "error")
                return
            }

            const response = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Erro ao deletar conta')
            }

            showToast("Conta deletada com sucesso!", "success")

            setIsOpen(false)
            if (isControlled && onCloseExternal) {
                onCloseExternal()
            }

            localStorage.removeItem('user')
            localStorage.removeItem('token')

            setTimeout(() => {
                navigate('/')
            }, 1500)
        } catch (error) {
            console.error('Error deleting account:', error)
            showToast(error instanceof Error ? error.message : "Erro ao deletar conta", "error")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setActiveSection("profile")
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setActiveSection(null)
        }
    }, [isOpen])

    return (
        <>
            {!isControlled && (
                <button className={`profile-button-user ${isOpen ? "active" : ""}`} onClick={toggleSidebar}>
                    <div className={`icon-user ${isOpen ? "rotate" : ""}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <span>Perfil</span>
                    <div className={`chevron-user ${isOpen ? "rotate" : ""}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m9 18 6-6-6-6"></path>
                        </svg>
                    </div>
                </button>
            )}

            {isOpen && (
                <>
                    <div className="overlay-user" onClick={toggleSidebar}></div>

                    <div className={`sidebar-user ${activeSection ? "active" : ""}`}>
                        <div className="sidebar-header-user">
                            <h2 className="sidebar-title-user">Perfil do Usuário</h2>
                            <button className="close-button-user" onClick={toggleSidebar} aria-label="Fechar">
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
                                >
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="sidebar-content-user">
                            <div className="avatar-container-user">
                                <div className="avatar-user">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="64"
                                        height="64"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            </div>

                            <div className="form-container-user">
                                <div className="form-group-user">
                                    <label htmlFor="name">Nome</label>
                                    <div className="input-container-user">
                                        <div className="input-icon-user">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </div>
                                        <input type="text" id="name" name="name" value={userData.name} onChange={handleInputChange} className="input-user" />
                                    </div>
                                </div>

                                <div className="form-group-user">
                                    <label htmlFor="email">Email</label>
                                    <div className="input-container-user">
                                        <div className="input-icon-user">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                            </svg>
                                        </div>
                                        <input type="email" id="email" name="email" value={userData.email} onChange={handleInputChange} className="input-user" />
                                    </div>
                                </div>

                                <div className="password-section-user">
                                    <h3>Alterar Senha</h3>

                                    {passwordError && <div className="error-message-user">{passwordError}</div>}

                                    <div className="form-group-user">
                                        <label htmlFor="currentPassword">Senha Atual</label>
                                        <div className="input-container-user">
                                            <div className="input-icon-user">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                            </div>
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="input-user"
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password-user"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                                        <line x1="2" x2="22" y1="2" y2="22"></line>
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group-user">
                                        <label htmlFor="newPasswordr">Nova Senha</label>
                                        <div className="input-container-user">
                                            <div className="input-icon-user">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                            </div>
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="input-user"
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password-user"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                                        <line x1="2" x2="22" y1="2" y2="22"></line>
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group-user">
                                        <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                                        <div className="input-container-user">
                                            <div className="input-icon-user">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="input-user"
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password-user"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                                        <line x1="2" x2="22" y1="2" y2="22"></line>
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="button-container-user">
                                    <button
                                        className="save-button-user"
                                        onClick={handleSaveChanges}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="loading-icon-user spin"
                                            >
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="save-icon-user"
                                            >
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                                <polyline points="7 3 7 8 15 8"></polyline>
                                            </svg>
                                        )}
                                        Salvar Alterações
                                    </button>

                                    <button
                                        className="delete-button-user"
                                        onClick={() => {
                                            if (
                                                window.confirm("Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.")
                                            ) {
                                                handleDeleteAccount()
                                            }
                                        }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="loading-icon-user spin"
                                            >
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="delete-icon-user"
                                            >
                                                <path d="M3 6h18"></path>
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                <line x1="10" x2="10" y1="11" y2="17"></line>
                                                <line x1="14" x2="14" y1="11" y2="17"></line>
                                            </svg>
                                        )}
                                        Deletar Conta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {toastMessage.visible && (
                <div className={`toast-user ${toastMessage.type}`}>
                    <p>{toastMessage.message}</p>
                </div>
            )}
        </>
    )
}