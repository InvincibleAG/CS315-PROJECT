import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import Events from './components/Events.jsx'
import EventForm from './components/EventForm.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import AdminEvents from './components/AdminEvents.jsx'
import NavBar from './components/NavBar.jsx'
import Calendar from './components/Calendar.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto">
        <NavBar />
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          <Route path="/events/new" element={
            <ProtectedRoute>
              <EventForm />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
