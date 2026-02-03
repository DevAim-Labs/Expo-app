import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
// Using View with backgroundColor instead of LinearGradient for compatibility
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { signUpUser } from "@/lib/auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async () => {
    // Clear previous errors
    setEmailError("");
    setGeneralError("");

    if (!email || !password) {
      setGeneralError("Please fill in all required fields");
      return;
    }

    if (!isLogin && (!name || !phone)) {
      setGeneralError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.replace("/home");
      } else {
        // Sign up with encrypted user data
        const result = await signUpUser(name, email, phone, password);

        if (!result.success) {
          // Check if it's a duplicate email error
          if (result.error === 'EMAIL_EXISTS' || 
              result.error?.includes('already') || 
              result.error?.includes('registered')) {
            setEmailError("This email is already registered. Please log in instead.");
            return;
          }
          throw new Error(result.error || 'Signup failed');
        }

        // Check if email confirmation is required
        if (!result.session) {
          setGeneralError("Please check your email to confirm your account before logging in.");
          return;
        }

        // If we have a session, user is signed up and logged in
        if (result.session) {
          router.replace("/home");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Handle specific error cases
      if (error.message.includes("already registered")) {
        setEmailError("This email is already registered. Please log in instead.");
      } else if (error.message.includes("Invalid login credentials")) {
        setGeneralError("Invalid email or password");
      } else if (error.message.includes("rate limit") || error.message.includes("too many")) {
        setGeneralError("Too many attempts. Please wait a few minutes and try again.");
      } else if (error.message.includes("Email link is invalid") || error.message.includes("expired")) {
        setGeneralError("This link has expired. Please request a new one.");
      } else {
        setGeneralError(error.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View entering={FadeInUp.duration(600)} style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="airplane" size={40} color="#2563EB" />
            </View>
            <Text style={styles.title}>VacayTogether</Text>
            <Text style={styles.subtitle}>Capture your moments together</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.card}>
            {/* Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(true);
                  setEmailError("");
                  setGeneralError("");
                }}
                style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                  Log In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(false);
                  setEmailError("");
                  setGeneralError("");
                }}
                style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {generalError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{generalError}</Text>
                </View>
              ) : null}

              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#94A3B8"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      placeholderTextColor="#94A3B8"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              )}

              <View>
                <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                  <Ionicons name="mail-outline" size={20} color={emailError ? "#DC2626" : "#94A3B8"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError(""); // Clear error on change
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {emailError ? (
                  <Text style={styles.fieldError}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Animated.View style={styles.spinner} />
                ) : (
                  <>
                    <Ionicons
                      name={isLogin ? "log-in-outline" : "person-add-outline"}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.submitButtonText}>
                      {isLogin ? "Enter App" : "Create Account"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563EB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  toggleButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  toggleTextActive: {
    color: "#2563EB",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: "#DC2626",
    borderWidth: 2,
    backgroundColor: "#FEF2F2",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#0F172A",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    gap: 8,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },
  fieldError: {
    fontSize: 13,
    color: "#DC2626",
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  spinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderTopColor: "#fff",
    borderRadius: 10,
  },
});
