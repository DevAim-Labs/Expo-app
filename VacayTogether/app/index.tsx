import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CreateAlbumModal, type CreateAlbumData } from "../components/CreateAlbumModal";
import { Dashboard, type DashboardAlbum } from "../components/Dashboard";
import { BottomNav, type BottomNavView } from "../components/BottomNav";

type Album = DashboardAlbum;

export default function Index() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([
    {
      id: "1",
      name: "Bali Getaway 2025",
      category: "Beach",
      startDate: "Jan 15",
      endDate: "Jan 22",
    },
    {
      id: "2",
      name: "Aspen Ski Trip",
      category: "Mountain",
      startDate: "Feb 3",
      endDate: "Feb 10",
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateAlbum = (data: CreateAlbumData) => {
    setAlbums((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: data.name,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    ]);
    setModalVisible(false);
  };

  const handleNavChange = (view: BottomNavView) => {
    if (view === "profile") router.push("/profile");
    else router.replace("/");
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
        onClose={() => setModalVisible(false)}
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
});
