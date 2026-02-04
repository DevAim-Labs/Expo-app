import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { BottomNav, type BottomNavView } from "../components/BottomNav";
import { supabase } from "@/lib/supabase";
import { getUserProfile, uploadProfilePicture, getProfilePictureUrl, deleteProfilePicture } from "@/lib/auth";

type ProfileData = {
  name: string;
  phone: string;
  email: string;
  profilePictureUrl?: string | null;
};

const MENU_ITEMS = [
  { id: "notifications", icon: "notifications-outline" as const, label: "Notifications", color: "#2D9CDB" },
  { id: "privacy", icon: "shield-checkmark-outline" as const, label: "Privacy & Security", color: "#6366F1" },
  { id: "help", icon: "help-circle-outline" as const, label: "Help Center", color: "#64748B" },
];

const DEFAULT_PROFILE: ProfileData = {
  name: "Alex Thmpson",
  phone: "+1 (555) 000-1234",
  email: "alex.t@example.com",
};


export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userProfile = await getUserProfile(session.user.id);
          
          if (userProfile) {
            setProfile({
              name: userProfile.name,
              phone: userProfile.phone,
              email: userProfile.email,
              profilePictureUrl: getProfilePictureUrl(userProfile.profile_picture_path),
            });
          } else {
            // Fallback to auth metadata if profile not found
            setProfile({
              name: session.user.user_metadata?.name || "User",
              phone: session.user.user_metadata?.phone || "",
              email: session.user.email || "",
              profilePictureUrl: null,
            });
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleMenuPress = (id: string) => {
    // Placeholder: navigate or open screen when you add them
    if (id === "help") Alert.alert("Help Center", "Coming soon.");
    else if (id === "notifications") Alert.alert("Notifications", "Coming soon.");
    else if (id === "privacy") Alert.alert("Privacy & Security", "Coming soon.");
  };

  const handleNavChange = (view: BottomNavView) => {
    if (view === "dashboard") router.replace("/home");
  };

  const handleUploadProfilePicture = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Please allow access to your photo library.");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Square for profile picture
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingPicture(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          Alert.alert("Error", "Not authenticated");
          return;
        }

        const uploadResult = await uploadProfilePicture(session.user.id, result.assets[0].uri);
        
        if (uploadResult.success && uploadResult.path) {
          // Update local state with new profile picture
          setProfile(prev => ({
            ...prev,
            profilePictureUrl: getProfilePictureUrl(uploadResult.path),
          }));
          Alert.alert("Success", "Profile picture updated!");
        } else {
          Alert.alert("Error", uploadResult.error || "Failed to upload profile picture");
        }
      }
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      Alert.alert("Error", "Failed to upload profile picture");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleDeleteProfilePicture = () => {
    Alert.alert(
      "Delete Profile Picture",
      "Are you sure you want to delete your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            setIsUploadingPicture(true);
            const result = await deleteProfilePicture(session.user.id);
            setIsUploadingPicture(false);

            if (result.success) {
              setProfile(prev => ({ ...prev, profilePictureUrl: null }));
              Alert.alert("Success", "Profile picture deleted");
            } else {
              Alert.alert("Error", result.error || "Failed to delete profile picture");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log out", 
          style: "destructive", 
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Sign out from Supabase - this clears the session
              const { error } = await supabase.auth.signOut();
              
              if (error) throw error;
              
              // Session is now cleared, redirect to login
              // Using replace() prevents back navigation
              router.replace("/");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
              setIsLoggingOut(false);
            }
          } 
        },
      ]
    );
  };

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D9CDB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Profile</Text>

        {/* Avatar + camera button */}
        <View style={styles.profileTop}>
          <View style={styles.avatarWrapper}>
            {profile.profilePictureUrl ? (
              <Image source={{ uri: profile.profilePictureUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {isUploadingPicture ? (
              <View style={styles.avatarEditBtn}>
                <ActivityIndicator size="small" color="#2D9CDB" />
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.avatarEditBtn}
                onPress={handleUploadProfilePicture}
                onLongPress={profile.profilePictureUrl ? handleDeleteProfilePicture : undefined}
              >
                <Ionicons name="camera" size={18} color="#2D9CDB" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.profileName}>{profile.name || "Explorer"}</Text>
          <Text style={styles.profileSubtitle}>Vacation Member</Text>
          {profile.profilePictureUrl && (
            <Text style={styles.profileHint}>Long press camera to remove picture</Text>
          )}
        </View>

        {/* Details box */}
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, styles.detailIconBlue]}>
              <Ionicons name="person-outline" size={20} color="#2D9CDB" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>FULL NAME</Text>
              <TextInput
                style={styles.detailInput}
                value={profile.name}
                onChangeText={(name) => setProfile((p) => ({ ...p, name }))}
                placeholder="Your name"
                placeholderTextColor="#9E9E9E"
              />
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, styles.detailIconGreen]}>
              <Ionicons name="call-outline" size={20} color="#27AE60" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.detailInput}
                value={profile.phone}
                onChangeText={(phone) => setProfile((p) => ({ ...p, phone }))}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="#9E9E9E"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <View style={[styles.detailIcon, styles.detailIconOrange]}>
              <Ionicons name="mail-outline" size={20} color="#E67E22" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>EMAIL</Text>
              <TextInput
                style={styles.detailInput}
                value={profile.email}
                onChangeText={(email) => setProfile((p) => ({ ...p, email }))}
                placeholder="you@example.com"
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log out */}
        <TouchableOpacity
          style={[styles.logoutBtn, isLoggingOut && styles.logoutBtnDisabled]}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={isLoggingOut}
        >
          <Ionicons name="log-out-outline" size={20} color={isLoggingOut ? "#999" : "#E74C3C"} />
          <Text style={[styles.logoutBtnText, isLoggingOut && styles.logoutBtnTextDisabled]}>
            {isLoggingOut ? "Logging out..." : "Logout Account"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav currentView="profile" onViewChange={handleNavChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F6F3" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F6F3",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 24,
  },
  profileTop: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2D9CDB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#2D9CDB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 15,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  profileHint: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 4,
    fontStyle: "italic",
  },
  detailsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  detailIconBlue: { backgroundColor: "rgba(45, 156, 219, 0.12)" },
  detailIconGreen: { backgroundColor: "rgba(39, 174, 96, 0.12)" },
  detailIconOrange: { backgroundColor: "rgba(230, 126, 34, 0.12)" },
  detailContent: { flex: 1 },
  detailLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9E9E9E",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  detailInput: {
    fontSize: 16,
    color: "#1A1A2E",
    padding: 0,
    fontWeight: "600",
  },
  menuSection: {
    marginBottom: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.3)",
  },
  logoutBtnDisabled: {
    backgroundColor: "rgba(200, 200, 200, 0.1)",
    borderColor: "rgba(200, 200, 200, 0.3)",
    opacity: 0.6,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E74C3C",
  },
  logoutBtnTextDisabled: {
    color: "#999",
  },
});
