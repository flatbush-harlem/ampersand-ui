"use client"
// TODO: Modify the prompt to include the user's name and contact phone number
// TODO: Add a better system prompt for outbound calls

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
  const [task, setTask] = useState("")
  const [toPhoneNumber, setToPhoneNumber] = useState("")
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "connected" | "ended" | "failed">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([])
  const [isCallActive, setIsCallActive] = useState(false)
  const [summary, setSummary] = useState("")
 const [ws, setWs] = useState<WebSocket | null>(null)
const [callSid, setCallSid] = useState<string | null>(null);
//TODO: Modify the system rpompt to be an .env variable
const systemPrompt = "You are an outbound agent, when you get connected with the caller and hear a voice your job is to execute a task that will be given to you. Your task is:";
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isFirstRun, setIsFirstRun] = useState(true)
  const [userPhoneNumber, setUserPhoneNumber] = useState(userProfile?.phoneNumber)

  // Add a new state variable to manage edit mode
  const [isEditing, setIsEditing] = useState(false);

  const [company, setCompany] = useState(""); // New state variable for company name

  // Check if user has completed onboarding
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const profile = JSON.parse(savedProfile) as UserProfile
      setUserProfile(profile)
      setIsFirstRun(false)
      // Pre-fill the phone number field with the user's number
      setUserPhoneNumber(profile.phoneNumber)
    }
  }, [])

  // Save user profile to localStorage
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile)
    setUserPhoneNumber(profile.phoneNumber)
    localStorage.setItem("userProfile", JSON.stringify(profile))
    setIsFirstRun(false)
    setIsEditing(false); // Set isEditing to false after completing onboarding
  }

  const validatePrompt = (text: string) => {
    // In a real app, you would validate XML or other format requirements here
    return text.trim().length > 0
  }

  const validatePhoneNumber = (number: string) => {
    // Basic phone validation - could be enhanced with proper regex
    return /^\+?[0-9]{10,15}$/.test(number.replace(/[\s()-]/g, ""))
  }

  const handleStartCall = async () => {
    setErrorMessage("")
    setTranscript([])
    setSummary("")

    // Validate inputs
    if (!validatePrompt(task)) {
      setErrorMessage("Task is invalid — please check for formatting issues.")
      return
    }

    if (!validatePhoneNumber(toPhoneNumber)) {
      setErrorMessage("Please enter a valid phone number.")
      return
    }

    if (!company.trim()) { // Validate company name
      setErrorMessage("Please enter a valid company name.")
      return
    }

    // Simulate call flow
    setCallStatus("ringing")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/outbound-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: toPhoneNumber,
          prompt: `${systemPrompt} ${task}`,
          first_message: `Hey is this ${company}?` // Use the company name
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log("Call initiated:", result.callSid)
        setCallStatus("connected")
        setIsCallActive(true)
        setCallSid(result.callSid)
        // Connect to the WebSocket stream
        const websocket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_BASE_URL}/transcription-stream/${result.callSid}`)
      
      websocket.onopen = () => {
        console.log("WebSocket connected")
        setWs(websocket)
      }

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (message.event === "transcript") {
          setTranscript((prev) => [
            ...prev,
            { speaker: message.speaker, text: message.text }
          ])
        }
      }

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      websocket.onclose = () => {
        console.log("WebSocket disconnected")
        setWs(null)
      }

      } else {
        setErrorMessage(result.error || "Failed to initiate call.")
        setCallStatus("failed")
      }
    } catch (error) {
      console.error("Error starting call:", error)
      setErrorMessage("Failed to connect to the server.")
      setCallStatus("failed")
    }

    
  }

  const handleEndCall = async (success = true) => {
    setCallStatus("ended")
    setIsCallActive(false)

    if (ws) {
      ws.close()
      setWs(null)
    }

    if (callSid) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/end-call`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callSid })
        });
  
        const result = await response.json();
        if (!result.success) {
          console.error("Failed to end call:", result.error);
        } else {
          console.log(`Call ${callSid} ended`);
        }
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }
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
    setTask("")
    // Don't reset the phone number as we want to keep the user's number
  }

  // If this is the first run, show onboarding
  if (isFirstRun || isEditing) {
    return (
      <div>
        <UserOnboarding 
          onComplete={handleOnboardingComplete} 
          isEditing={isFirstRun || isEditing} // Set to true for first run or editing
        />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Phone Call Agent</h1>

      {userProfile && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{userProfile.name}</p>
                  <p className="text-sm text-muted-foreground">{userPhoneNumber}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="mt-4">
                Edit 
              </Button>
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
              <Label htmlFor="company">Business Name</Label>
              <Input
                id="company"
                placeholder="Enter the company you want to call (e.g., Matt's Pizza)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Enter Task (Prompt)</Label>
              <Textarea
                id="prompt"
                placeholder="What should the agent do? (e.g., Place a pickup order for 2 large pizzas with pepperoni)"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Enter Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={toPhoneNumber}
                onChange={(e) => setToPhoneNumber(e.target.value)}
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

