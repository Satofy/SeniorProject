"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function InternalIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/internal/admin/dashboard")
  }, [router])

  return null
}
