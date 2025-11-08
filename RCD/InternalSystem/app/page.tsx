"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin login by default
    router.push("/admin/login")
  }, [router])

  return null
}
