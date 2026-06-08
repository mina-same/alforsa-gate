import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme') as Theme | null
      if (stored === 'light' || stored === 'dark') {
        return stored
      }
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    window.localStorage.setItem('theme', theme)

    // Update the browser's status bar color (theme-color) to match the header
    // Light header: #ffffff, Dark header: #202020
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }

    const color = theme === 'dark' ? '#202020' : '#ffffff'
    metaThemeColor.setAttribute('content', color)

    // Also update apple-mobile-web-app-status-bar-style for Safari
    let metaApple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (!metaApple) {
      metaApple = document.createElement('meta')
      metaApple.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
      document.head.appendChild(metaApple)
    }
    metaApple.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default')
  }, [theme])

  const setTheme = (value: Theme) => {
    setThemeState(value)
  }

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}


