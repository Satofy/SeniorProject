"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StageStepOne } from "@/components/admin/stage-step-one"
import { StageStepTwo } from "@/components/admin/stage-step-two"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function NewStagePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    stageName: "",
    participants: "",
    groups: "",
    qualifiers: "",
    formatType: "round-robin",
  })

  const handleNext = () => {
    if (currentStep === 1 && formData.stageName && formData.participants) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else {
      router.back()
    }
  }

  const handleComplete = () => {
    console.log("Tournament created:", formData)
    router.push("/admin/tournaments")
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Stage</h1>
        <p className="text-muted-foreground">Step {currentStep} of 2</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-8 mb-12">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
            currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
          }`}
        >
          1
        </div>
        <div className={`h-1 w-16 transition-colors ${currentStep === 2 ? "bg-primary" : "bg-border"}`} />
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
            currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
          }`}
        >
          2
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && <StageStepOne formData={formData} setFormData={setFormData} />}
      {currentStep === 2 && <StageStepTwo formData={formData} setFormData={setFormData} />}

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-12">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex-1 border-border text-foreground hover:bg-card bg-transparent"
        >
          Cancel
        </Button>
        {currentStep === 1 ? (
          <Button
            onClick={handleNext}
            disabled={!formData.stageName || !formData.participants}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Next Step
          </Button>
        ) : (
          <Button onClick={handleComplete} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Complete
          </Button>
        )}
      </div>
    </div>
  )
}
