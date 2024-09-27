import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { fetchMessagesFromAPI } from "../../api/endpoint";
import Ionicons from "@expo/vector-icons/Ionicons";
import { EXPO_PRODUCTION_API_MESSAGE_URL, EXPO_PUBLIC_API_URL } from "@env";
import { Spinner } from "../Screens/ReportScreen";

const MessageScreen = ({ route, navigation }) => {
  const { selectedUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef();

  useEffect(() => {
    navigation.setOptions({ title: selectedUser.fullname });
    const initializeSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      const decoded = jwtDecode(token);
      setCurrentUser(decoded);

      const newSocket = io(EXPO_PUBLIC_API_URL, {
        query: { token },
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      newSocket.on("reconnect", () => {
        console.log("Socket reconnected");
      });

      newSocket.on("receiveMessage", (newMessage) => {
        handleReceiveMessage(newMessage);
      });

      newSocket.on("typing", (typingStatus) => {
        handleTypingStatus(typingStatus);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    };

    initializeSocket();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetchMessagesFromAPI(
        selectedUser.id,
        currentUser.id
      );
      console.log(response.data);
      const messageHistory = await response.data;
      const updatedMessages = messageHistory
        .filter((msg) => msg.deletedBy !== currentUser.id)
        .map((msg) => ({
          ...msg,
          isSent: msg.fromId === currentUser.id,
          formattedTime: formatMessageTime(msg.createdAt),
        }));
      setMessages(updatedMessages);
      await AsyncStorage.setItem("messages", JSON.stringify(updatedMessages));
    } catch (error) {
      console.error("Error fetching message history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMessages();
    }
  }, [selectedUser, currentUser]);

  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        fetchMessages();
      }
    }, [currentUser])
  );

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleTimeString();
  };

  const handleSendMessage = async () => {
    if (message !== "") {
      if (socket && selectedUser) {
        const chatMessage = {
          to: selectedUser.id,
          message,
          from: currentUser.id,
          createdAt: new Date().toISOString(),
        };

        console.log(chatMessage);

        const formattedChatMessage = {
          ...chatMessage,
          formattedTime: formatMessageTime(chatMessage.createdAt),
        };

        flatListRef.current.scrollToEnd({ animated: true });

        socket.emit("sendMessage", chatMessage);
        setMessage("");
        setReplyTo(null);
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...formattedChatMessage, isSent: true },
        ]);
      }
    }
  };

  const handleTyping = (text) => {
    setMessage(text);
    if (socket && selectedUser) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit("typing", { to: selectedUser.id, typing: true });

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { to: selectedUser.id, typing: false });
      }, 1000);
    }
  };

  const handleReceiveMessage = async (newMessage) => {
    console.log("mensaje recibido", newMessage)
    const formattedNewMessage = {
      ...newMessage,
      formattedTime: formatMessageTime(newMessage.createdAt),
    };
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...formattedNewMessage, isSent: false },
    ]);
  };

  const handleTypingStatus = (typingStatus) => {
    setIsTyping(typingStatus.typing);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageItem,
        item.isSent ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text>{item.message}</Text>
      <Text style={styles.timestamp}>
        {item.formattedTime || item.createdAt}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            style={styles.messageList}
            contentContainerStyle={{ paddingBottom: 20 }}
            ref={flatListRef}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingContainer}>
                  <Text style={styles.typingIndicator}>Typing...</Text>
                </View>
              ) : null
            }
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={handleTyping}
              placeholder="Type a message..."
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!message.trim()}
              style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.5 }]}
            >
              <Ionicons name="send" size={24} color="#ff9400" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },
  messageList: {
    flex: 1,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 5,
    textAlign: "right",
  },
  sentMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  sendButton: {
    marginLeft: 10,
  },
  receivedMessage: {
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  typingIndicator: {
    fontStyle: "italic",
    margin: 10,
  },
});

export default MessageScreen;
