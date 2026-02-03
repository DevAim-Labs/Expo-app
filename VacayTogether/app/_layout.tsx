import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="album/conversation" options={{ headerShown: false }} />
    </Stack>
  );
}
