import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
    </Routes>
  )
}

export default App
