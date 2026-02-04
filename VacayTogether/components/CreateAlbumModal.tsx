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
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { Calendar, DateData } from 'react-native-calendars';

const PRESET_CATEGORIES = ["Beach", "Mountain", "City", "Road Trip", "Nature"] as const;
export type AlbumCategory = (typeof PRESET_CATEGORIES)[number] | string;

export type CreateAlbumData = {
  name: string;
  category: AlbumCategory;
  startDate: string;
  endDate: string;
  coverImageUri?: string;
};

type CreateAlbumModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (album: CreateAlbumData) => void;
};

export function CreateAlbumModal({ visible, onClose, onCreate }: CreateAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AlbumCategory>("Beach");
  const [customCategory, setCustomCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Calendar states
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    if (visible) {
      // Reset form
      setTitle("");
      setCategory("Beach");
      setCustomCategory("");
      setStartDate("");
      setEndDate("");
      setCoverImageUri(null);
      setMarkedDates({});
      setShowCalendar(false);
    }
  }, [visible]);

  // Update marked dates when start/end dates change
  useEffect(() => {
    if (!startDate && !endDate) {
      setMarkedDates({});
      return;
    }

    const marked: any = {};
    
    if (startDate) {
      marked[startDate] = { 
        startingDay: true, 
        color: '#2D9CDB', 
        textColor: 'white',
        selected: true,
      };
    }
    
    if (endDate) {
      marked[endDate] = { 
        endingDay: true, 
        color: '#2D9CDB', 
        textColor: 'white',
        selected: true,
      };
    }

    // Mark days in between
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateStr = current.toISOString().split('T')[0];
        marked[dateStr] = { 
          color: '#B3E0F7', 
          textColor: '#1A1A2E',
        };
        current.setDate(current.getDate() + 1);
      }
    }

    setMarkedDates(marked);
  }, [startDate, endDate]);

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Please allow access to your photo library to upload a cover photo.");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleCalendarDateSelect = (date: DateData) => {
    const dateStr = date.dateString;

    if (selectingStartDate) {
      // Selecting start date
      setStartDate(dateStr);
      setEndDate(""); // Reset end date
      setSelectingStartDate(false);
    } else {
      // Selecting end date
      if (new Date(dateStr) < new Date(startDate)) {
        // If end date is before start date, swap them
        setEndDate(startDate);
        setStartDate(dateStr);
      } else {
        setEndDate(dateStr);
      }
      setShowCalendar(false);
      setSelectingStartDate(true);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSubmit = () => {
    const name = title.trim();
    if (!name) {
      Alert.alert("Validation", "Please enter a vacation name");
      return;
    }

    const finalCategory = category === "Custom" ? customCategory.trim() : category;
    if (!finalCategory) {
      Alert.alert("Validation", "Please enter a category");
      return;
    }

    onCreate({ 
      name, 
      category: finalCategory, 
      startDate: startDate || "—", 
      endDate: endDate || "—",
      coverImageUri: coverImageUri || undefined,
    });
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
              {/* Add/Show Cover Photo */}
              <TouchableOpacity 
                style={styles.coverPhotoBox} 
                activeOpacity={0.8}
                onPress={pickImage}
                disabled={isUploading}
              >
                {coverImageUri ? (
                  <>
                    <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
                    <View style={styles.changePhotoOverlay}>
                      <Ionicons name="camera" size={24} color="#FFFFFF" />
                      <Text style={styles.changePhotoText}>Change Photo</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={40} color="#9E9E9E" />
                    <Text style={styles.coverPhotoLabel}>Add Cover Photo</Text>
                  </>
                )}
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#2D9CDB" />
                  </View>
                )}
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
              {!showCalendar ? (
                <View style={styles.dateRow}>
                  <TouchableOpacity 
                    style={styles.dateDisplayBox}
                    onPress={() => {
                      setSelectingStartDate(true);
                      setShowCalendar(true);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#2D9CDB" style={styles.dateIcon} />
                    <Text style={[styles.dateText, !startDate && styles.dateTextPlaceholder]}>
                      {startDate ? formatDisplayDate(startDate) : "Start Date"}
                    </Text>
                  </TouchableOpacity>
                  
                  <Ionicons name="arrow-forward" size={20} color="#9E9E9E" />
                  
                  <TouchableOpacity 
                    style={styles.dateDisplayBox}
                    onPress={() => {
                      if (!startDate) {
                        Alert.alert("Select Start Date", "Please select a start date first");
                        return;
                      }
                      setSelectingStartDate(false);
                      setShowCalendar(true);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#2D9CDB" style={styles.dateIcon} />
                    <Text style={[styles.dateText, !endDate && styles.dateTextPlaceholder]}>
                      {endDate ? formatDisplayDate(endDate) : "End Date"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <Text style={styles.calendarHeaderText}>
                      {selectingStartDate ? "Select Start Date" : "Select End Date"}
                    </Text>
                    <TouchableOpacity onPress={() => setShowCalendar(false)}>
                      <Text style={styles.calendarDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <Calendar
                    onDayPress={handleCalendarDateSelect}
                    markedDates={markedDates}
                    markingType={'period'}
                    minDate={selectingStartDate ? undefined : startDate}
                    theme={{
                      selectedDayBackgroundColor: '#2D9CDB',
                      todayTextColor: '#2D9CDB',
                      arrowColor: '#2D9CDB',
                      monthTextColor: '#1A1A2E',
                      textMonthFontWeight: 'bold',
                      textDayFontSize: 14,
                      textMonthFontSize: 16,
                    }}
                  />
                </View>
              )}

              <Text style={styles.modalLabel}>Category</Text>
              <View style={styles.categoryPills}>
                {PRESET_CATEGORIES.map((cat) => (
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
                <TouchableOpacity
                  style={[styles.categoryPill, category === "Custom" && styles.categoryPillActive]}
                  onPress={() => setCategory("Custom")}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      category === "Custom" && styles.categoryPillTextActive,
                    ]}
                  >
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Category Input */}
              {category === "Custom" && (
                <View style={styles.customCategoryContainer}>
                  <TextInput
                    style={styles.customCategoryInput}
                    placeholder="Enter custom category..."
                    placeholderTextColor="#9E9E9E"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    autoFocus
                  />
                </View>
              )}

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
    maxHeight: 580,
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
    overflow: "hidden",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  changePhotoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  dateDisplayBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#B3E0F7",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A2E",
    fontWeight: "500",
  },
  dateTextPlaceholder: {
    color: "#9E9E9E",
    fontWeight: "400",
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
    overflow: "hidden",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  calendarHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  calendarDoneText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D9CDB",
  },
  categoryPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
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
  customCategoryContainer: {
    marginBottom: 20,
    marginTop: -10,
  },
  customCategoryInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#2D9CDB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A2E",
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
