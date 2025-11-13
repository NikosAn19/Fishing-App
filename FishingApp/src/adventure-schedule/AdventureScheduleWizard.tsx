import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";
import { colors } from "../theme/colors";
import { ArrowRight } from "lucide-react-native";

// Import step components
import Step1MapSelection from "./steps/Step1MapSelection";
import Step2CalendarSelection from "./steps/Step2CalendarSelection";
import Step3FishingDetails from "./steps/Step3FishingDetailsSimple";
import Step4Forecast from "./steps/Step4Forecast";

// Import header components
import ProgressBullets from "./components/ProgressBullets";

export interface AdventureScheduleData {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  selectedDate?: string;
  fishingDetails?: {
    technique?: string;
    lures?: string[];
    notes?: string;
  };
}

interface AdventureScheduleWizardProps {
  onClose: () => void;
}

const steps = [
  {
    id: 1,
    title: "Select Location",
    subtitle: "Choose your fishing spot on the map",
  },
  { id: 2, title: "Pick Date", subtitle: "When do you want to go fishing?" },
  {
    id: 3,
    title: "Fishing Details",
    subtitle: "Add technique and gear info (optional)",
  },
  {
    id: 4,
    title: "Forecast",
    subtitle: "View weather forecast for your adventure",
  },
];

export default function AdventureScheduleWizard({
  onClose,
}: AdventureScheduleWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<AdventureScheduleData>({});

  const updateWizardData = (stepData: Partial<AdventureScheduleData>) => {
    setWizardData((prev) => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!wizardData.coordinates;
      case 2:
        return !!wizardData.selectedDate;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Display step
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1MapSelection
            initialCoordinates={wizardData.coordinates}
            onCoordinatesSelected={(coords) =>
              updateWizardData({ coordinates: coords })
            }
          />
        );
      case 2:
        return (
          <Step2CalendarSelection
            initialDate={wizardData.selectedDate}
            onDateSelected={(date: string) =>
              updateWizardData({ selectedDate: date })
            }
          />
        );
      case 3:
        return (
          <Step3FishingDetails
            initialDetails={wizardData.fishingDetails}
            onDetailsUpdated={(details) =>
              updateWizardData({ fishingDetails: details })
            }
          />
        );
      case 4:
        return (
          <Step4Forecast
            coordinates={wizardData.coordinates!}
            selectedDate={wizardData.selectedDate!}
            fishingDetails={wizardData.fishingDetails}
            onBackToEdit={() => setCurrentStep(1)}
          />
        );
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onClose();
    } else {
      prevStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bullets with Back Button */}
      <ProgressBullets
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
      />

      {/* Step Content */}
      <View style={styles.stepContainer}>{renderStep()}</View>

      {/* Navigation Footer */}
      {currentStep < 4 && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={nextStep}
            disabled={!canProceed()}
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.nextButtonText,
                !canProceed() && styles.nextButtonTextDisabled,
              ]}
            >
              {currentStep === steps.length - 1 ? "View Forecast" : "Continue"}
            </Text>
            <ArrowRight
              size={20}
              color={!canProceed() ? "#666" : colors.primaryBg}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  stepContainer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    margin: 8,
    marginTop: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 16,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryBg,
  },
  nextButtonTextDisabled: {
    color: "#666",
  },
});
