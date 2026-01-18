import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/app/auth/Login"
import AdminDashboard from "@/app/admin/Dashboard"
import RoleRoute from "@/routes/RoleRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <RoleRoute role="admin">
              <AdminDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
