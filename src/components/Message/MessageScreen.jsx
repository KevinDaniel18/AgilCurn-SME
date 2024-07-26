import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const MessageScreen = ({ route, navigation }) => {
  const { selectedUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);

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

      const newSocket = io("http://192.168.1.17:3000", {
        query: { token },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
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

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(
          `http://192.168.1.17:3000/chat/messages?userId=${selectedUser.id}&contactId=${currentUser.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const messageHistory = await response.json();
        const updatedMessages = messageHistory
          .filter((msg) => msg.deletedBy !== currentUser.id)
          .map((msg) => ({
            ...msg,
            isSent: msg.fromId === currentUser.id,
          }));
        setMessages(updatedMessages);
        await AsyncStorage.setItem("messages", JSON.stringify(updatedMessages));
      } catch (error) {
        console.error("Error fetching message history:", error);
      }
    };

    if (currentUser) {
      fetchMessages();
    }
  }, [selectedUser, currentUser]);

  const handleSendMessage = () => {
    if (socket && selectedUser) {
      const chatMessage = {
        to: selectedUser.id,
        message,
        from: currentUser.id,
        replyTo: replyTo?.id,
      };

      socket.emit("sendMessage", chatMessage);
      setMessage("");
      setReplyTo(null);
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...chatMessage, isSent: true },
      ]);
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

  const handleReceiveMessage = (newMessage) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...newMessage, isSent: false },
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
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        style={styles.messageList}
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
        <Button onPress={handleSendMessage} title="Send" />
      </View>
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
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sentMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
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
