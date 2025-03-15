"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Home, User, LogIn, LogOut } from "lucide-react"

export default function NavBar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-xl font-bold">
              <span className="mr-2">♞</span> Custom Chess
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900 flex items-center">
              <Home className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">Home</span>
            </Link>

            {user ? (
              <>
                <Link href="/profile" className="text-gray-700 hover:text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-1" />
                  <span className="hidden md:inline">Profile</span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-gray-700 hover:text-gray-900 flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-gray-900 flex items-center">
                <LogIn className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

