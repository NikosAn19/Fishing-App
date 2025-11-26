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
        name="chat/[channelId]"
        options={{
          title: "Chat",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="direct-messages"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="stories/[userId]"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
