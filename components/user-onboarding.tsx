"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserProfile {
  name: string
  phoneNumber: string
}

interface UserOnboardingProps {
  onComplete: (profile: UserProfile) => void
  isEditing: boolean
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, isEditing }) => {
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate inputs
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    // Basic phone validation
    if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/[\s()-]/g, ""))) {
      setError("Please enter a valid phone number")
      return
    }

    // Complete onboarding
    onComplete({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
    })
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Get started with Phone Call Agent</CardTitle>
          <CardDescription>
            <div className="space-y-4">
              <p className="text-base font-medium">
                To get started, we need some basic information from you so the AI can complete the task on your behalf.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> This phone number will only be shared with businesses if there are issues during calls. The AI uses a different number for making calls.
                </p>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onboarding-phone">Your Phone Number</Label>
              <Input
                id="onboarding-phone"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground">This will not be the phone number used for the call. The AI will use a different number for making calls.</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!isEditing}>
              Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default UserOnboarding

