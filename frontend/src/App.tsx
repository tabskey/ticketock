import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { TicketListPage } from './pages/TicketListPage'
import { TicketDetailPage } from './pages/TicketDetailPage'
import { NewTicketPage } from './pages/NewTicketPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/tickets"
        element={
          <RequireAuth>
            <Layout>
              <TicketListPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <RequireAuth>
            <Layout>
              <NewTicketPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <RequireAuth>
            <Layout>
              <TicketDetailPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  )
}

export default App
