import { useState } from "react"
import { login } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const { error } = await login(email, password)
    if (error) alert(error.message)
    else window.location.href = "/admin"
  }

  return (
    <div className="max-w-md mx-auto mt-24 space-y-4">
      <h1 className="text-2xl font-bold text-center">School Login</h1>

      <Input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <Button className="w-full" onClick={handleLogin}>
        Login
      </Button>
    </div>
  )
}
