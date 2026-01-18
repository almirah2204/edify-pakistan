import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"

export default function AdminDashboard() {
  const [students, setStudents] = useState(0)
  const [teachers, setTeachers] = useState(0)

  useEffect(() => {
    const load = async () => {
      const { count: s } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })

      const { count: t } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true })

      setStudents(s ?? 0)
      setTeachers(t ?? 0)
    }

    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={logout}>Logout</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl shadow">
          <h2 className="font-semibold">Students</h2>
          <p className="text-3xl">{students}</p>
        </div>

        <div className="bg-card p-4 rounded-xl shadow">
          <h2 className="font-semibold">Teachers</h2>
          <p className="text-3xl">{teachers}</p>
        </div>
      </div>
    </div>
  )
}
