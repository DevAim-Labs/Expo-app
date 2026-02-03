import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type BottomNavView = "dashboard" | "profile";

type BottomNavProps = {
  currentView: string;
  onViewChange: (view: BottomNavView) => void;
};

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const isDashboard = currentView === "dashboard";
  const isProfile = currentView === "profile";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => onViewChange("dashboard")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isDashboard ? "grid" : "grid-outline"}
          size={24}
          color={isDashboard ? "#2563EB" : "#94A3B8"}
        />
        <Text style={[styles.label, isDashboard && styles.labelActive]}>Albums</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => onViewChange("profile")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isProfile ? "person" : "person-outline"}
          size={24}
          color={isProfile ? "#2563EB" : "#94A3B8"}
        />
        <Text style={[styles.label, isProfile && styles.labelActive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 8,
  },
  item: {
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
  },
  labelActive: {
    color: "#2563EB",
  },
});
