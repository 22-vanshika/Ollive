import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ChatPage } from '@/pages'
import { DashboardPage } from '@/pages'

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen flex flex-col bg-surface-base text-text-primary overflow-hidden font-sans">
        {/* Editorial Global Header Bar */}
        <header className="h-14 border-b border-border bg-surface-raised px-8 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-6">
            <span className="font-serif text-lg font-semibold tracking-wide text-brand-primary">
              Ollive
            </span>
            <span className="h-4 w-px bg-border hidden sm:inline" />
            <span className="text-xs text-text-muted hidden sm:inline tracking-wider uppercase">
              LLM Inference Platform
            </span>
          </div>

          <nav className="flex gap-1 h-full items-center">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-base ${
                  isActive
                    ? 'bg-user-bubble-bg text-user-bubble-text shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay/50'
                }`
              }
            >
              Chat
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-base ${
                  isActive
                    ? 'bg-user-bubble-bg text-user-bubble-text shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay/50'
                }`
              }
            >
              Dashboard
            </NavLink>
          </nav>
        </header>

        {/* Dynamic Route Container */}
        <div className="flex-1 min-h-0 relative bg-surface-base">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
