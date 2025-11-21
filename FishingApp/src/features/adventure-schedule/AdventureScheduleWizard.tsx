import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { ArrowRight } from "lucide-react-native";

// Import step components
import Step1MapSelection from "./steps/Step1MapSelection";
import Step2CalendarSelection from "./steps/Step2CalendarSelection";
import Step3FishingDetails from "./steps/Step3FishingDetailsSimple";
import Step4Forecast from "./steps/Step4Forecast";

// Import header components
import ProgressBullets from "./components/ProgressBullets";
import { ADVENTURE_SCHEDULE_STEPS, AdventureScheduleStep } from "./constants";
import { AdventureScheduleData, AdventureScheduleWizardProps } from "./types";

export default function AdventureScheduleWizard({
  onClose,
  onAdventureSaved,
}: AdventureScheduleWizardProps) {
  const [currentStep, setCurrentStep] = useState<AdventureScheduleStep>(
    AdventureScheduleStep.LOCATION
  );
  const [wizardData, setWizardData] = useState<AdventureScheduleData>({});

  const updateWizardData = (stepData: Partial<AdventureScheduleData>) => {
    setWizardData((prev) => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    const maxStep =
      ADVENTURE_SCHEDULE_STEPS[ADVENTURE_SCHEDULE_STEPS.length - 1].id;
    if (currentStep < maxStep) {
      setCurrentStep((prev) => (prev + 1) as AdventureScheduleStep);
    }
  };

  const prevStep = () => {
    if (currentStep > AdventureScheduleStep.LOCATION) {
      setCurrentStep((prev) => (prev - 1) as AdventureScheduleStep);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case AdventureScheduleStep.LOCATION:
        return !!wizardData.coordinates;
      case AdventureScheduleStep.DATE:
        return !!wizardData.selectedDate;
      case AdventureScheduleStep.DETAILS:
        return true; // Optional step
      case AdventureScheduleStep.FORECAST:
        return true; // Display step
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case AdventureScheduleStep.LOCATION:
        return (
          <Step1MapSelection
            initialCoordinates={wizardData.coordinates}
            onCoordinatesSelected={(coords) =>
              updateWizardData({ coordinates: coords })
            }
          />
        );
      case AdventureScheduleStep.DATE:
        return (
          <Step2CalendarSelection
            initialDate={wizardData.selectedDate}
            onDateSelected={(date: string) =>
              updateWizardData({ selectedDate: date })
            }
          />
        );
      case AdventureScheduleStep.DETAILS:
        return (
          <Step3FishingDetails
            initialDetails={wizardData.fishingDetails}
            onDetailsUpdated={(details) =>
              updateWizardData({ fishingDetails: details })
            }
          />
        );
      case AdventureScheduleStep.FORECAST:
        return (
          <Step4Forecast
            coordinates={wizardData.coordinates!}
            selectedDate={wizardData.selectedDate!}
            fishingDetails={wizardData.fishingDetails}
            onBackToEdit={() => setCurrentStep(AdventureScheduleStep.LOCATION)}
            onAdventureSaved={() => {
              onAdventureSaved?.();
              onClose();
            }}
          />
        );
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (currentStep === AdventureScheduleStep.LOCATION) {
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
        totalSteps={ADVENTURE_SCHEDULE_STEPS.length}
        onBack={handleBack}
      />

      {/* Step Content */}
      <View style={styles.stepContainer}>{renderStep()}</View>

      {/* Navigation Footer */}
      {currentStep < AdventureScheduleStep.FORECAST && (
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
              {currentStep ===
              ADVENTURE_SCHEDULE_STEPS[ADVENTURE_SCHEDULE_STEPS.length - 2].id
                ? "View Forecast"
                : "Continue"}
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
