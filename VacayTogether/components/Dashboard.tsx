import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type DashboardAlbum = {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  thumbnailUrl?: string;
};

type DashboardProps = {
  albums: DashboardAlbum[];
  onCreateClick: () => void;
  onAlbumClick: (album: DashboardAlbum) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  Beach: "#87CEEB",
  Mountain: "#B0BEC5",
  City: "#90A4AE",
  "Road Trip": "#A5D6A7",
  Nature: "#81C784",
};

export function Dashboard({ albums, onCreateClick, onAlbumClick }: DashboardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Albums</Text>
          <Text style={styles.subtitle}>Capture your memories</Text>
        </View>
        <TouchableOpacity
          style={styles.plusButton}
          onPress={onCreateClick}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {albums.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No albums yet.</Text>
          <Text style={styles.emptySubtitle}>Start your first adventure!</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {albums.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={styles.albumCard}
              onPress={() => onAlbumClick(album)}
              activeOpacity={0.9}
            >
              <View style={styles.albumImageWrap}>
                <View
                  style={[
                    styles.albumImagePlaceholder,
                    { backgroundColor: CATEGORY_COLORS[album.category] ?? "#E0F2FE" },
                  ]}
                >
                  <Ionicons name="location-outline" size={40} color="rgba(255,255,255,0.8)" />
                </View>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{album.category}</Text>
                </View>
              </View>

              <View style={styles.albumBody}>
                <View style={styles.albumRow}>
                  <Text style={styles.albumTitle} numberOfLines={1}>
                    {album.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>
                <View style={styles.albumDates}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.albumDatesText}>
                    {album.startDate} - {album.endDate}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 4,
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#94A3B8",
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  albumCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  albumImageWrap: {
    height: 192,
    position: "relative",
  },
  albumImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
  },
  categoryTag: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  albumBody: {
    padding: 20,
  },
  albumRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  albumDates: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  albumDatesText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
});
