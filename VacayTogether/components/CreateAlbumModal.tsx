import { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIES = ["Beach", "Mountain", "City", "Road Trip", "Nature"] as const;
export type AlbumCategory = (typeof CATEGORIES)[number];

export type CreateAlbumData = {
  name: string;
  category: AlbumCategory;
  startDate: string;
  endDate: string;
};

type CreateAlbumModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (album: CreateAlbumData) => void;
};

export function CreateAlbumModal({ visible, onClose, onCreate }: CreateAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AlbumCategory>("Beach");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (visible) {
      setTitle("");
      setCategory("Beach");
      setStartDate("");
      setEndDate("");
    }
  }, [visible]);

  const handleSubmit = () => {
    const name = title.trim();
    if (!name) return;
    const start = startDate.trim() || "—";
    const end = endDate.trim() || "—";
    onCreate({ name, category, startDate: start, endDate: end });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBottomWrap}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Vacation Album</Text>
              <TouchableOpacity
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#1A1A2E" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Add Cover Photo */}
              <TouchableOpacity style={styles.coverPhotoBox} activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={40} color="#9E9E9E" />
                <Text style={styles.coverPhotoLabel}>Add Cover Photo</Text>
              </TouchableOpacity>

              <Text style={styles.modalLabel}>Vacation Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Summer in Santorini"
                placeholderTextColor="#9E9E9E"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.modalLabel}>Date Range</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateInputWrap}>
                  <Ionicons name="calendar-outline" size={18} color="#9E9E9E" style={styles.dateIcon} />
                  <TextInput
                    style={styles.dateInput}
                    placeholder="dd/mm/yyyy"
                    placeholderTextColor="#9E9E9E"
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>
                <View style={styles.dateInputWrap}>
                  <Ionicons name="calendar-outline" size={18} color="#9E9E9E" style={styles.dateIcon} />
                  <TextInput
                    style={styles.dateInput}
                    placeholder="dd/mm/yyyy"
                    placeholderTextColor="#9E9E9E"
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>Category</Text>
              <View style={styles.categoryPills}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        category === cat && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.createAlbumBtn, !title.trim() && styles.createAlbumBtnDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <Text style={styles.createAlbumBtnText}>Create Album</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBottomWrap: {
    justifyContent: "flex-end",
    maxHeight: "90%",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  modalScroll: {
    maxHeight: 480,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  coverPhotoBox: {
    height: 140,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  coverPhotoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9E9E9E",
    marginTop: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#B3E0F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A2E",
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dateInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1A1A2E",
  },
  categoryPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  categoryPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: "#EEEEEE",
  },
  categoryPillActive: {
    backgroundColor: "#2D9CDB",
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
  },
  createAlbumBtn: {
    backgroundColor: "#2D9CDB",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  createAlbumBtnDisabled: {
    opacity: 0.5,
  },
  createAlbumBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
