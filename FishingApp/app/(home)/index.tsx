// app/(home)/index.tsx

import React from "react";
import { View } from "react-native";
import WeatherDashboard from "../../src/components/weather-dashboard/WeatherDashboard";
import AdventureScheduleModal from "../../src/features/adventure-schedule/AdventureScheduleModal";
import { useState } from "react";

export default function ForecastScreen() {
  const [showAdventureWizard, setShowAdventureWizard] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <WeatherDashboard />

      {/* Adventure Schedule Wizard Modal */}
      <AdventureScheduleModal
        visible={showAdventureWizard}
        onClose={() => setShowAdventureWizard(false)}
      />
    </View>
  );
}
