import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ChatPage } from '@/pages'
import { DashboardPage } from '@/pages'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-base">
        <header className="border-b border-border bg-surface-raised px-6 py-3 flex items-center gap-6">
          <span className="font-semibold text-text-primary">Ollive</span>
          <nav className="flex gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm transition-colors duration-fast ${isActive ? 'text-brand-primary font-medium' : 'text-text-secondary hover:text-text-primary'}`
              }
            >
              Chat
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm transition-colors duration-fast ${isActive ? 'text-brand-primary font-medium' : 'text-text-secondary hover:text-text-primary'}`
              }
            >
              Dashboard
            </NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
