import * as React from "react"
import { createRoot } from "react-dom/client"
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow"
import "./styles/app.css"

const rootElement = document.getElementById("onboarding-root")

if (rootElement) {
  const currentStep = parseInt(rootElement.dataset.currentStep || "1")
  const firstName = rootElement.dataset.firstName || ""

  const root = createRoot(rootElement)
  root.render(<OnboardingFlow currentStep={currentStep} firstName={firstName} />)
}
