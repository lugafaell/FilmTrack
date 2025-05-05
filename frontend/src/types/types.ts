export type Movie = {
  id: string
  tmdbId: number
  title: string
  year: string
  genres: string
  rating: number
  director: string
  duration: string
  poster: string
  plot: string
  status: MovieStatus
  actors: string[]
  watchProviders?: string[]
}

export interface User {
  _id: string
  name: string
  email: string
  createdAt: string
  __v: number
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  checkTokenValidity: () => boolean
  forceValidateToken: () => void
}

export type FilmReelProps = {
  position: "top" | "bottom"
}

export interface HeaderProps {
  onUserProfileClick: () => void
  onNotificationClick: () => void
}

export type TMDBMovie = {
  id: number
  title: string
  release_date: string
  poster_path: string
  overview: string
  runtime?: number
  genres?: { id: number, name: string }[]
}

export type MovieStatus = "watched" | "watchLater"

export type MovieModalProps = {
  isOpen: boolean
  onClose: () => void
}

export interface Notification {
  _id: string
  title: string
  message: string
  createdAt: string
  image?: string
  type: string
  isRead: boolean
  metadata?: {
    director?: string
    platform?: string
  }
}

export interface NotificationModalProps {
  isControlled?: boolean
  isOpenExternal?: boolean
  onCloseExternal?: () => void
  onToggleExternal?: () => void
  newNotificationsCount?: number
  onNotificationsUpdate?: (count: number) => void
  renderButton?: boolean
  forceRefresh?: (force?: boolean) => Promise<void>
  externalNotifications?: Notification[]
}

export interface UserData {
  name: string
  email: string
  _id?: string
}

export interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserSidebarProps {
  isControlled?: boolean
  isOpenExternal?: boolean
  onCloseExternal?: () => void
}