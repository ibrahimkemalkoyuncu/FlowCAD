// ============================================
// MAIN - Uygulama Giriş Noktası
// Konum: frontend/src/main.tsx
// React DOM render ve global ayarlar
// ============================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

// ============================================
// ROOT RENDER - Uygulamayı DOM'a Bağla
// ============================================

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    
    {/* ============================================ */}
    {/* TOAST NOTIFICATION SİSTEMİ                   */}
    {/* React Hot Toast - Global bildirim yönetimi   */}
    {/* ============================================ */}
    <Toaster 
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // ========================================
        // VARSAYILAN AYARLAR
        // ========================================
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
        
        // ========================================
        // BAŞARI MESAJLARI (Success Toast)
        // ========================================
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        
        // ========================================
        // HATA MESAJLARI (Error Toast)
        // ========================================
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
        
        // ========================================
        // YÜKLENİYOR MESAJLARI (Loading Toast)
        // ========================================
        loading: {
          duration: Infinity,
        },
      }}
    />
  </StrictMode>,
)