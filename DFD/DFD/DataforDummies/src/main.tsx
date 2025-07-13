import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Auth from '@pages/Auth'
import Login from '@pages/Login'
import SignUp from '@pages/SignUp'
import Landing from './pages/Landing'
import LayoutWithSidebar from './pages/LayoutSidebar'
import Home from '@pages/Home'
import Settings from './pages/Settings'
import Users from './pages/Users/Users'
import { AuthProvider } from './context/AuthContext'
import AccountActivation from './pages/ActivateAccount'
import ProtectedRoute from './components/ProtectedRoute'
import PowerPivotPage from './pages/Dummy-Power/DummyPower'
import PowerBIReportPage from './pages/Dummy-Report/DummyReport'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import WebScraperPage from './pages/WebScrapper'
const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>

            <Route element={<Auth />} path='auth'>
              <Route element={<Login />} path='login' />
              <Route element={<SignUp />} path='signup' />
            </Route>
            <Route element={<Landing />} index />
            <Route element={<ProtectedRoute> <LayoutWithSidebar /> </ProtectedRoute>}>
              <Route path='home' element={<Home />} />
              <Route path='dashboard' element={<Home />} />
              <Route path='settings' element={<Settings />} />
              <Route path='users' element={<Users />} />
              <Route path='proyects/:proyectId/' element={<PowerPivotPage />} />
              <Route path='dummy-report' element={<PowerBIReportPage />} />

            </Route>
            <Route path="activate/:uid/:token" element={<AccountActivation />} />
            <Route path="webscrapper" element={<WebScraperPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>


  </StrictMode>,
)
