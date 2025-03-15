"use client"

import { AuthProvider } from "@/contexts/auth-context"
import UserProfile from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

function ProfileContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    )
  }

  return <UserProfile />
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
        <ProfileContent />
      </main>
    </AuthProvider>
  )
}

