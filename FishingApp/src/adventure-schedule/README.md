# Adventure Schedule Wizard

A multi-step wizard component for planning fishing adventures with weather forecasts and detailed planning.

## Components

### AdventureScheduleWizard

The main wizard component that orchestrates the entire flow.

```tsx
import AdventureScheduleWizard from "../adventure-schedule/AdventureScheduleWizard";

<AdventureScheduleWizard onClose={() => setShowWizard(false)} />;
```

### Individual Steps

#### Step1MapSelection

Interactive map component for selecting fishing coordinates.

Features:

- Interactive map with tap-to-select
- Current location button
- Coordinate display
- Map type switching

#### Step2CalendarSelection

Calendar component for selecting fishing dates.

Features:

- Next 30 days available
- Quick "Today" and "Tomorrow" buttons
- Visual date cards with status indicators
- Date validation (no past dates)

#### Step3FishingDetails

Form for collecting fishing technique and gear information.

Features:

- Fishing technique selection
- Lure and bait selection
- Custom lure input
- Notes field
- Real-time summary

#### Step4Forecast

Comprehensive weather forecast display.

Features:

- Fishing score calculation (0-100)
- Current conditions (wind, waves, temperature, pressure)
- Best fishing times
- Sun and moon information
- Fishing recommendations
- Adventure plan summary

## Data Flow

```typescript
interface AdventureScheduleData {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  selectedDate?: string; // YYYY-MM-DD format
  fishingDetails?: {
    technique?: string;
    lures?: string[];
    notes?: string;
  };
}
```

## Usage Example

```tsx
import React, { useState } from "react";
import AdventureScheduleModal from "../adventure-schedule/AdventureScheduleModal";

function MyComponent() {
  const [showAdventure, setShowAdventure] = useState(false);

  return (
    <>
      <Button title="Plan Adventure" onPress={() => setShowAdventure(true)} />

      <AdventureScheduleModal
        visible={showAdventure}
        onClose={() => setShowAdventure(false)}
      />
    </>
  );
}
```

## API Integration

The wizard integrates with the forecast API endpoint:

- `GET /api/forecast/date?lat={lat}&lon={lon}&date={date}`

The API returns comprehensive weather data including:

- Current conditions
- Hourly forecasts
- Marine data (waves, sea temperature)
- Sun and moon information
- Fishing score calculation

## Styling

All components use the app's theme colors:

- `colors.primaryBg` - Dark background (#212B36)
- `colors.accent` - Accent color (#12dbc0)
- `colors.white` - Text color (#fff)

## Features

### Map Selection (Step 1)

- Google Maps integration
- Tap to select coordinates
- Current location detection
- Coordinate validation
- Visual feedback

### Calendar Selection (Step 2)

- 30-day lookahead
- Quick selection buttons
- Date validation
- Visual status indicators
- Responsive grid layout

### Fishing Details (Step 3)

- Technique selection
- Lure management
- Custom input
- Real-time preview
- Optional completion

### Forecast (Step 4)

- Weather API integration
- Fishing score algorithm
- Best times calculation
- Recommendations engine
- Comprehensive data display

## Navigation

The wizard includes:

- Progress indicator
- Back/forward navigation
- Step validation
- Data persistence
- Error handling

## Error Handling

- Network errors with retry options
- Location permission handling
- Date validation
- API error recovery
- User-friendly error messages

## Future Enhancements

- Save favorite locations
- Historical weather data
- Advanced fishing recommendations
- Social sharing
- Offline mode
- Multiple language support
