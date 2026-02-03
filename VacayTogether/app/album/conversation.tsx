import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Chat, type ChatMessage } from "../../components/Chat";

const CURRENT_USER_ID = "me";

export default function ConversationScreen() {
  const { albumId, albumTitle } = useLocalSearchParams<{
    albumId: string;
    albumTitle: string;
  }>();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hey, when are we leaving?",
      userName: "Alex",
      userId: "user1",
      createdAt: Date.now() - 3600000,
    },
    {
      id: "2",
      text: "Saturday morning! Can't wait 🌴",
      userName: "You",
      userId: CURRENT_USER_ID,
      createdAt: Date.now() - 3500000,
    },
    {
      id: "3",
      text: "Should I book the car rental?",
      userName: "Jordan",
      userId: "user2",
      createdAt: Date.now() - 3400000,
    },
    {
      id: "4",
      text: "Yes please! We'll need something with room for luggage",
      userName: "You",
      userId: CURRENT_USER_ID,
      createdAt: Date.now() - 3300000,
    },
  ]);

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text,
      userName: "You",
      userId: CURRENT_USER_ID,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleAttachment = () => {
    // TODO: Open image/file picker
    console.log("Open attachment picker");
  };

  const handleLoadMore = () => {
    // TODO: Load older messages from backend
    console.log("Load more messages");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <Chat
        albumTitle={albumTitle ?? "Album Chat"}
        messages={messages}
        currentUserId={CURRENT_USER_ID}
        onBack={() => router.back()}
        onSendMessage={handleSendMessage}
        messageField={{
          placeholder: "Type a message...",
          enterSendsMessage: false,
        }}
        showTimestamps={true}
        onAttachment={handleAttachment}
        onLoadMore={handleLoadMore}
      />
    </SafeAreaView>
  );
}
