import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Message type
export interface ChatMessage {
  id: string;
  text: string;
  userName: string;
  userId: string;
  createdAt: number;
}

// User type for participants
export interface ChatUser {
  userId: string;
  userName: string;
  avatar?: string;
}

// MessageField configuration
export interface MessageFieldOptions {
  placeholder?: string;
  enterSendsMessage?: boolean;
  visible?: boolean;
}

// Main Chat props
interface ChatProps {
  albumTitle: string;
  messages: ChatMessage[];
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  messageField?: MessageFieldOptions;
  keyboardVerticalOffset?: number;
  showTimestamps?: boolean;
  onAttachment?: () => void;
  onLoadMore?: () => void;
}

export function Chat({
  albumTitle,
  messages,
  currentUserId,
  onBack,
  onSendMessage,
  messageField = {},
  keyboardVerticalOffset,
  showTimestamps = true,
  onAttachment,
  onLoadMore,
}: ChatProps) {
  const [input, setInput] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const {
    placeholder = "Message...",
    enterSendsMessage = false,
    visible = true,
  } = messageField;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideListener = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (text && visible) {
      onSendMessage(text);
      setInput("");
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.userId === currentUserId;

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && <Text style={styles.senderName}>{item.userName}</Text>}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.text}
          </Text>
        </View>
        {showTimestamps && (
          <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
            {formatTime(item.createdAt)}
          </Text>
        )}
      </View>
    );
  };

  const reversedMessages = [...messages].reverse();

  const calculatedOffset =
    keyboardVerticalOffset !== undefined
      ? keyboardVerticalOffset
      : Platform.OS === "ios"
      ? insets.top + 60
      : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {albumTitle}
          </Text>
          <Text style={styles.headerSubtitle}>Group Chat</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={calculatedOffset}
      >
        <FlatList
          ref={flatListRef}
          data={reversedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
        />

        {visible && (
          <View
            style={[
              styles.inputContainer,
              {
                paddingBottom: isKeyboardVisible
                  ? 8
                  : Math.max(insets.bottom, 12),
              },
            ]}
          >
            <View style={styles.inputWrapper}>
              {onAttachment && (
                <TouchableOpacity
                  onPress={onAttachment}
                  style={styles.iconButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#64748B" />
                </TouchableOpacity>
              )}

              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={1000}
                returnKeyType={enterSendsMessage ? "send" : "default"}
                blurOnSubmit={false}
                onSubmitEditing={enterSendsMessage ? handleSend : undefined}
              />

              <TouchableOpacity
                onPress={handleSend}
                disabled={!input.trim()}
                style={styles.sendButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={32}
                  color={input.trim() ? "#2563EB" : "#CBD5E1"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageRow: {
    marginBottom: 16,
    maxWidth: "75%",
    alignSelf: "flex-start",
  },
  messageRowMe: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleThem: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  },
  bubbleMe: {
    backgroundColor: "#2563EB",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#0F172A",
  },
  messageTextMe: {
    color: "#FFFFFF",
  },
  timestamp: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    marginLeft: 12,
  },
  timestampMe: {
    marginLeft: 0,
    marginRight: 12,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: "#0F172A",
    maxHeight: 100,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
