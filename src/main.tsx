import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import GenrePage from './pages/GenrePage.tsx'
import LanguageLayout from './i18n/LanguageLayout.tsx'
import { RootRedirect, LegacyGenreRedirect } from './i18n/RootRedirect.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/genre/:slug" element={<LegacyGenreRedirect />} />
        <Route path="/:lang" element={<LanguageLayout />}>
          <Route index element={<App />} />
          <Route path="genre/:slug" element={<GenrePage />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
