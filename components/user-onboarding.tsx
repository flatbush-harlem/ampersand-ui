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
}

export default function UserOnboarding({ onComplete }: UserOnboardingProps) {
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
          <CardTitle>Welcome to Phone Call Agent</CardTitle>
          <CardDescription>
            Please provide your information to get started. The assistant may need this info to complete the task.
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onboarding-phone">Your Phone Number</Label>
              <Input
                id="onboarding-phone"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">This will be used as your default number for calls</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Get Started
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

