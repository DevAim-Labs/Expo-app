import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { theme } from "../app/styles/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75;

// Types
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read";
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

interface ChatUIProps {
  title: string;
  subtitle?: string;
  messages: ChatMessage[];
  currentUserId: string;
  onSend: (text: string) => void;
  onBack: () => void;
  onAttachment?: () => void;
  onHeaderPress?: () => void;
  isTyping?: boolean;
  typingUser?: string;
}

// Animated message bubble component
function MessageBubbleComponent({
  message,
  isMe,
  showName,
  isFirstInGroup,
  isLastInGroup,
}: {
  message: ChatMessage;
  isMe: boolean;
  showName: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify()}
      style={[
        styles.messageContainer,
        isMe ? styles.messageContainerMe : styles.messageContainerThem,
      ]}
    >
      {showName && !isMe && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          isFirstInGroup && (isMe ? styles.bubbleMeFirst : styles.bubbleThemFirst),
          isLastInGroup && (isMe ? styles.bubbleMeLast : styles.bubbleThemLast),
        ]}
      >
        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
          {message.text}
        </Text>
      </View>
      {isLastInGroup && (
        <View style={[styles.metaRow, isMe && styles.metaRowMe]}>
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
          {isMe && message.status && (
            <Ionicons
              name={
                message.status === "read"
                  ? "checkmark-done"
                  : message.status === "delivered"
                  ? "checkmark-done"
                  : "checkmark"
              }
              size={14}
              color={message.status === "read" ? "#3B82F6" : "#94A3B8"}
              style={styles.statusIcon}
            />
          )}
        </View>
      )}
    </Animated.View>
  );
}

const MessageBubble = React.memo(MessageBubbleComponent);

// Typing indicator
const TypingIndicator = ({ userName }: { userName?: string }) => (
  <Animated.View entering={FadeIn.duration(200)} style={styles.typingContainer}>
    <View style={styles.typingBubble}>
      <View style={styles.typingDots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              { animationDelay: `${i * 150}ms` },
            ]}
          />
        ))}
      </View>
    </View>
    {userName && <Text style={styles.typingText}>{userName} is typing...</Text>}
  </Animated.View>
);

// Main ChatUI component
export function ChatUI({
  title,
  subtitle,
  messages,
  currentUserId,
  onSend,
  onBack,
  onAttachment,
  onHeaderPress,
  isTyping,
  typingUser,
}: ChatUIProps) {
  const [inputText, setInputText] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const sendScale = useSharedValue(1);

  // Track keyboard visibility
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    sendScale.value = withSpring(0.8, {}, () => {
      sendScale.value = withSpring(1);
    });

    onSend(text);
    setInputText("");
    setInputHeight(40);
  }, [inputText, onSend, sendScale]);

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const canSend = inputText.trim().length > 0;

  // Group messages by sender for visual grouping
  const getMessageProps = (index: number) => {
    const message = messages[index];
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    const isMe = message.senderId === currentUserId;
    const showName =
      !isMe &&
      (!prevMessage || prevMessage.senderId !== message.senderId);
    const isFirstInGroup =
      !prevMessage || prevMessage.senderId !== message.senderId;
    const isLastInGroup =
      !nextMessage || nextMessage.senderId !== message.senderId;

    return { isMe, showName, isFirstInGroup, isLastInGroup };
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const props = getMessageProps(index);
    return <MessageBubble message={item} {...props} />;
  };

  // Scroll to end when keyboard opens
  useEffect(() => {
    if (keyboardHeight > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [keyboardHeight]);

  return (
    <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
      {/* Header */}
      <Pressable
        onPress={onHeaderPress}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <View style={styles.subtitleRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>
      </Pressable>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        style={styles.flatList}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          isTyping ? <TypingIndicator userName={typingUser} /> : null
        }
        keyboardShouldPersistTaps="handled"
      />

      {/* Input Area */}
      <View
        style={[
          styles.inputArea,
          { paddingBottom: keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 8) },
        ]}
      >
        {onAttachment && (
          <TouchableOpacity
            onPress={onAttachment}
            style={styles.attachButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add-circle" size={28} color={theme.colors.mutedForeground} />
          </TouchableOpacity>
        )}

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { height: Math.max(40, inputHeight) }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor={theme.colors.mutedForeground}
            multiline
            maxLength={2000}
            onContentSizeChange={(e) =>
              setInputHeight(Math.min(100, e.nativeEvent.contentSize.height))
            }
          />
        </View>

        <Animated.View style={sendButtonStyle}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            style={[styles.sendButton, canSend && styles.sendButtonActive]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={canSend ? "#fff" : theme.colors.mutedForeground}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.foreground,
    letterSpacing: -0.4,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  headerAction: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // Messages list
  flatList: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Messages
  messageContainer: {
    marginBottom: 2,
    maxWidth: MAX_BUBBLE_WIDTH,
  },
  messageContainerMe: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  messageContainerThem: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: theme.colors.secondary,
    borderBottomLeftRadius: 4,
  },
  bubbleMeFirst: {
    borderTopRightRadius: 18,
  },
  bubbleThemFirst: {
    borderTopLeftRadius: 18,
  },
  bubbleMeLast: {
    borderBottomRightRadius: 4,
  },
  bubbleThemLast: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.foreground,
  },
  messageTextMe: {
    color: "#fff",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginLeft: 4,
  },
  metaRowMe: {
    marginLeft: 0,
    marginRight: 4,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.mutedForeground,
  },
  statusIcon: {
    marginLeft: 4,
  },

  // Typing
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.mutedForeground,
    opacity: 0.6,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 13,
    color: theme.colors.mutedForeground,
    fontStyle: "italic",
  },

  // Input
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingTop: 8,
    backgroundColor: theme.colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  input: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    fontSize: 16,
    color: theme.colors.foreground,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },
});

export default ChatUI;
