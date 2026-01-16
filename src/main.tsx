import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// ★追加：AuthContextを読み込む（パスは src/AuthContext.tsx なので ./AuthContext でOK）
import { AuthProvider } from './AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ★追加：アプリ全体をAuthProviderで囲む */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)