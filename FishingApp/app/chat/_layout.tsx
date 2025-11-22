import { Stack } from "expo-router";
import { colors } from "../../src/theme/colors";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryBg,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: colors.primaryBg,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Channels",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[channelId]"
        options={{
          title: "Chat",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
