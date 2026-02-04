import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    // Protected routes that require authentication
    const protectedRoutes = ['home', 'profile', 'album'];
    
    // Get current route - segments[0] is the first part of the path
    const currentRoute = segments[0];
    
    // Check if current route is protected
    const isProtectedRoute = currentRoute && protectedRoutes.includes(currentRoute);
    
    // Check if on login screen (no specific protected route)
    const isOnLoginScreen = !isProtectedRoute;

    if (!session && isProtectedRoute) {
      // User is not logged in but trying to access protected route
      // Redirect to login screen and prevent back navigation
      router.replace("/");
    } else if (session && isOnLoginScreen) {
      // User is logged in but on login screen
      // Redirect to home
      router.replace("/home");
    }
  }, [session, segments, loading]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="home" options={{ headerShown: true }} />
      <Stack.Screen name="profile" options={{ headerShown: true }} />
      <Stack.Screen name="album/chat" options={{ headerShown: true }} />
      <Stack.Screen name="album/conversation" options={{ headerShown: false }} />
    </Stack>
  );
}
