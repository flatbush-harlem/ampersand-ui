"use client"

import { useState, useEffect } from "react"
import { Phone, PhoneOff, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LiveTranscript from "@/components/live-transcript"
import UserOnboarding from "@/components/user-onboarding"

// Type for user profile
interface UserProfile {
  name: string
  phoneNumber: string
}

export default function PhoneCallAgent() {
  const [prompt, setPrompt] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "connected" | "ended" | "failed">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([])
  const [isCallActive, setIsCallActive] = useState(false)
  const [summary, setSummary] = useState("")

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isFirstRun, setIsFirstRun] = useState(true)

  // Check if user has completed onboarding
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const profile = JSON.parse(savedProfile) as UserProfile
      setUserProfile(profile)
      setIsFirstRun(false)
      // Pre-fill the phone number field with the user's number
      setPhoneNumber(profile.phoneNumber)
    }
  }, [])

  // Save user profile to localStorage
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile)
    setPhoneNumber(profile.phoneNumber)
    localStorage.setItem("userProfile", JSON.stringify(profile))
    setIsFirstRun(false)
  }

  const validatePrompt = (text: string) => {
    // In a real app, you would validate XML or other format requirements here
    return text.trim().length > 0
  }

  const validatePhoneNumber = (number: string) => {
    // Basic phone validation - could be enhanced with proper regex
    return /^\+?[0-9]{10,15}$/.test(number.replace(/[\s()-]/g, ""))
  }

  const handleStartCall = () => {
    setErrorMessage("")

    // Validate inputs
    if (!validatePrompt(prompt)) {
      setErrorMessage("Prompt is invalid — please check for formatting issues.")
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage("Please enter a valid phone number.")
      return
    }

    // Simulate call flow
    setCallStatus("ringing")

    // Simulate connection delay
    setTimeout(() => {
      setCallStatus("connected")
      setIsCallActive(true)

      // Create system prompt that includes user information
      const systemPrompt = userProfile
        ? `Agent is assisting ${userProfile.name} (phone: ${userProfile.phoneNumber}). Task: ${prompt}`
        : `Agent is assisting a user. Task: ${prompt}`

      console.log("System prompt:", systemPrompt)

      // Simulate conversation
      const demoConversation = [
        {
          speaker: "Agent",
          text: `Hello, this is an automated call${userProfile ? ` for ${userProfile.name}` : ""}. I'll help you with your request.`,
        },
        { speaker: "User", text: "Hi, yes I'm listening." },
        { speaker: "Agent", text: `I'm calling about: "${prompt}"` },
        { speaker: "User", text: "Yes, that works for me." },
        { speaker: "Agent", text: "Great! Is there anything else you need help with?" },
        { speaker: "User", text: "No, that's all. Thank you." },
        { speaker: "Agent", text: `You're welcome${userProfile ? `, ${userProfile.name}` : ""}. Have a great day!` },
      ]

      // Add transcript messages with delay to simulate real-time conversation
      demoConversation.forEach((message, index) => {
        setTimeout(() => {
          setTranscript((prev) => [...prev, message])

          // End call after last message
          if (index === demoConversation.length - 1) {
            setTimeout(() => handleEndCall(true), 1000)
          }
        }, index * 2000)
      })
    }, 2000)
  }

  const handleEndCall = (success = true) => {
    setCallStatus("ended")
    setIsCallActive(false)

    if (success) {
      setSummary(`Call completed successfully. The task "${prompt}" was handled.`)
    } else {
      setCallStatus("failed")
      setSummary("Call failed – issue with the connection.")
    }
  }

  const resetCall = () => {
    setCallStatus("idle")
    setTranscript([])
    setSummary("")
    setPrompt("")
    // Don't reset the phone number as we want to keep the user's number
  }

  // If this is the first run, show onboarding
  if (isFirstRun) {
    return <UserOnboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Phone Call Agent</h1>

      {userProfile && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userProfile.name}</p>
                <p className="text-sm text-muted-foreground">{userProfile.phoneNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isCallActive && callStatus !== "ended" && callStatus !== "failed" ? (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Call</CardTitle>
            <CardDescription>Enter the task details and verify the phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Enter Task (Prompt)</Label>
              <Textarea
                id="prompt"
                placeholder="What should the agent do? (e.g., Confirm appointment)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Enter Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartCall} className="w-full" disabled={callStatus === "ringing"}>
              {callStatus === "ringing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ringing...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Start Call
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{isCallActive ? "Live Call" : "Call Summary"}</span>
              {isCallActive && (
                <div className="flex items-center">
                  <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-normal text-muted-foreground">Call Connected</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCallActive ? (
              <LiveTranscript messages={transcript} />
            ) : (
              <div className="space-y-4">
                <Alert variant={callStatus === "failed" ? "destructive" : "default"}>
                  <AlertDescription>
                    {callStatus === "failed"
                      ? "Call failed – issue with the connection."
                      : "Call completed successfully."}
                  </AlertDescription>
                </Alert>

                {summary && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Summary:</h3>
                    <p className="text-muted-foreground">{summary}</p>
                  </div>
                )}

                <LiveTranscript messages={transcript} />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {isCallActive ? (
              <Button variant="destructive" onClick={() => handleEndCall(false)} className="w-full">
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>
            ) : (
              <Button onClick={resetCall} className="w-full">
                Start New Call
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

