import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FormPage  from './pages/FormPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<Navigate to="/form" replace />} />
        <Route path="/form"  element={<FormPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}