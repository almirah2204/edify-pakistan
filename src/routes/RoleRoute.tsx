import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export default function RoleRoute({
  children,
  role
}: {
  children: JSX.Element
  role: string
}) {
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkRole = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      setAllowed(profile?.role === role)
      setLoading(false)
    }

    checkRole()
  }, [role])

  if (loading) return null
  if (!allowed) return <Navigate to="/login" />

  return children
}
