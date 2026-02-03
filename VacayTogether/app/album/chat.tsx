import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlbumDetail, type AlbumDetailPhoto } from "../../components/AlbumDetail";
import type { DashboardAlbum } from "../../components/Dashboard";

export default function AlbumScreen() {
  const { id, name, category, startDate, endDate } = useLocalSearchParams<{
    id: string;
    name: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }>();
  const router = useRouter();
  const [photos, setPhotos] = useState<AlbumDetailPhoto[]>([
    { id: "1", url: "" },
    { id: "2", url: "" },
  ]);

  const album: DashboardAlbum = {
    id: id ?? "",
    name: name ?? "Album",
    category: category ?? "",
    startDate: startDate ?? "—",
    endDate: endDate ?? "—",
  };

  const handlePhotoUpload = () => {
    setPhotos((prev) => [
      ...prev,
      { id: `photo-${Date.now()}`, url: "" },
    ]);
  };

  const handleChatClick = () => {
    router.push({
      pathname: "/album/conversation",
      params: { albumId: album.id, albumTitle: album.name },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <AlbumDetail
        album={album}
        photos={photos}
        onBack={() => router.back()}
        onChatClick={handleChatClick}
        onPhotoUpload={handlePhotoUpload}
      />
    </SafeAreaView>
  );
}
