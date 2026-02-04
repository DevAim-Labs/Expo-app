import { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CreateAlbumModal, type CreateAlbumData } from "../components/CreateAlbumModal";
import { Dashboard, type DashboardAlbum } from "../components/Dashboard";
import { BottomNav, type BottomNavView } from "../components/BottomNav";
import { createAlbum, getUserAlbums, getCoverImageUrl } from "../lib/albums";

type Album = DashboardAlbum;

export default function Index() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load albums on mount
  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    setIsLoading(true);
    try {
      const result = await getUserAlbums();
      if (result.success && result.albums) {
        const formattedAlbums: Album[] = result.albums.map((album) => ({
          id: album.id,
          name: album.vacation_name,
          category: album.category,
          startDate: formatDate(album.start_date),
          endDate: formatDate(album.end_date),
          coverImage: album.photo_path ? getCoverImageUrl(album.photo_path) : undefined,
        }));
        setAlbums(formattedAlbums);
      }
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleCreateAlbum = async (data: CreateAlbumData) => {
    setIsCreating(true);
    try {
      const result = await createAlbum({
        vacation_name: data.name,
        category: data.category,
        start_date: data.startDate !== "—" ? data.startDate : undefined,
        end_date: data.endDate !== "—" ? data.endDate : undefined,
        coverImageUri: data.coverImageUri,
      });

      if (result.success && result.album) {
        // Add new album to list
        const newAlbum: Album = {
          id: result.album.id,
          name: result.album.vacation_name,
          category: result.album.category,
          startDate: formatDate(result.album.start_date),
          endDate: formatDate(result.album.end_date),
          coverImage: result.album.photo_path ? getCoverImageUrl(result.album.photo_path) : undefined,
        };
        setAlbums((prev) => [newAlbum, ...prev]);
        setModalVisible(false);
        Alert.alert("Success", "Album created successfully!");
      } else {
        Alert.alert("Error", result.error || "Failed to create album");
      }
    } catch (error: any) {
      console.error("Error creating album:", error);
      Alert.alert("Error", error.message || "Failed to create album");
    } finally {
      setIsCreating(false);
    }
  };

  const handleNavChange = (view: BottomNavView) => {
    if (view === "profile") router.push("/profile");
    else if (view === "dashboard") router.replace("/home");
  };

  const handleAlbumClick = (album: DashboardAlbum) => {
    router.push({
      pathname: "/album/chat",
      params: {
        id: album.id,
        name: album.name,
        category: album.category,
        startDate: album.startDate,
        endDate: album.endDate,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D9CDB" />
        </View>
        <BottomNav currentView="dashboard" onViewChange={handleNavChange} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Dashboard
        albums={albums}
        onCreateClick={() => setModalVisible(true)}
        onAlbumClick={handleAlbumClick}
      />

      <BottomNav currentView="dashboard" onViewChange={handleNavChange} />

      <CreateAlbumModal
        visible={modalVisible}
        onClose={() => !isCreating && setModalVisible(false)}
        onCreate={handleCreateAlbum}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F3",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
