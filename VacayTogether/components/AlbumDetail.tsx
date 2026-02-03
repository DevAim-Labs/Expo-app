import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DashboardAlbum } from "./Dashboard";

export type AlbumDetailPhoto = {
  id: string;
  url: string;
};

type AlbumDetailProps = {
  album: DashboardAlbum;
  photos: AlbumDetailPhoto[];
  onBack: () => void;
  onChatClick: () => void;
  onPhotoUpload: () => void;
};

export function AlbumDetail({
  album,
  photos,
  onBack,
  onChatClick,
  onPhotoUpload,
}: AlbumDetailProps) {
  const { width } = useWindowDimensions();
  const padding = 16;
  const gap = 12;
  const photoSize = (width - padding * 2 - gap) / 2;

  return (
    <View style={styles.container}>
      {/* Header with Chat Bar */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {album.name}
            </Text>
            <Text style={styles.headerSubtitle}>{album.category}</Text>
          </View>
        </View>

        {/* Chat Bar - Clickable */}
        <TouchableOpacity
          style={styles.chatBar}
          onPress={onChatClick}
          activeOpacity={0.85}
        >
          <View style={styles.chatBarIcon}>
            <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.chatBarText}>
            <Text style={styles.chatBarTitle}>Album Chat</Text>
            <Text style={styles.chatBarSubtitle}>Share memories with everyone</Text>
          </View>
          <View style={styles.chatBarAvatars}>
            <View style={[styles.avatar, styles.avatar1]} />
            <View style={[styles.avatar, styles.avatar2]} />
            <View style={[styles.avatar, styles.avatar3]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Photo Grid */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.gridWrap, { padding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.grid, { gap }]}>
          {photos.map((photo) => (
            <View
              key={photo.id}
              style={[styles.photoTile, { width: photoSize, height: photoSize }]}
            >
              <View style={styles.photoPlaceholder}>
                <Ionicons name="image" size={32} color="#94A3B8" />
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addPhotoTile, { width: photoSize, height: photoSize }]}
            onPress={onPhotoUpload}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={32} color="#94A3B8" />
            <Text style={styles.addPhotoLabel}>Add Photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  chatBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  chatBarIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  chatBarText: {
    flex: 1,
  },
  chatBarTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  chatBarSubtitle: {
    fontSize: 12,
    color: "rgba(37, 99, 235, 0.7)",
    fontWeight: "500",
    marginTop: 2,
  },
  chatBarAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#CBD5E1",
    marginLeft: -8,
    borderWidth: 2,
    borderColor: "#EFF6FF",
  },
  avatar1: { marginLeft: 0 },
  avatar2: {},
  avatar3: {},
  scroll: { flex: 1 },
  gridWrap: { paddingBottom: 40 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photoTile: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  addPhotoTile: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginTop: 8,
  },
});
