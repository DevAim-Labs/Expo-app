import { useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChatUI, type ChatMessage } from "../../components/ChatUI";

const CURRENT_USER_ID = "me";

export default function ConversationScreen() {
  const { albumTitle } = useLocalSearchParams<{
    albumId: string;
    albumTitle: string;
  }>();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hey, when are we leaving?",
      senderId: "user1",
      senderName: "Alex",
      timestamp: new Date(Date.now() - 3600000),
      status: "read",
    },
    {
      id: "2",
      text: "Saturday morning! Can't wait 🌴",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      timestamp: new Date(Date.now() - 3500000),
      status: "read",
    },
    {
      id: "3",
      text: "Should I book the car rental?",
      senderId: "user2",
      senderName: "Jordan",
      timestamp: new Date(Date.now() - 3400000),
      status: "read",
    },
    {
      id: "4",
      text: "Yes please! We'll need something with room for luggage",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      timestamp: new Date(Date.now() - 3300000),
      status: "delivered",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = useCallback((text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text,
      senderId: CURRENT_USER_ID,
      senderName: "You",
      timestamp: new Date(),
      status: "sending",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate message being sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: "sent" } : m
        )
      );
    }, 500);

    // Simulate delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: "delivered" } : m
        )
      );
    }, 1000);

    // Simulate someone typing a response
    setTimeout(() => {
      setIsTyping(true);
    }, 1500);

    // Simulate response
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Sounds good! 👍",
        "Perfect, let me know!",
        "Can't wait for this trip!",
        "I'll check and get back to you",
      ];
      const response: ChatMessage = {
        id: `msg-${Date.now()}`,
        text: responses[Math.floor(Math.random() * responses.length)],
        senderId: "user1",
        senderName: "Alex",
        timestamp: new Date(),
        status: "read",
      };
      setMessages((prev) => [...prev, response]);
    }, 3000);
  }, []);

  const handleAttachment = () => {
    console.log("Open attachment picker");
  };

  return (
    <ChatUI
      title={albumTitle ?? "Album Chat"}
      subtitle="3 members online"
      messages={messages}
      currentUserId={CURRENT_USER_ID}
      onSend={handleSend}
      onBack={() => router.back()}
      onAttachment={handleAttachment}
      isTyping={isTyping}
      typingUser="Alex"
    />
  );
}
