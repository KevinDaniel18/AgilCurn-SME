import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { getResponsesByTicketUser } from "../../../api/endpoint";

const { width: screenWidth } = Dimensions.get("window");

const TICKET_STATUSES = {
  OPEN: {
    label: "Open",
    color: "#e74c3c",
    bgColor: "#fdf2f2",
    icon: "circle",
  },
  IN_PROGRESS: {
    label: "In progress",
    color: "#f39c12",
    bgColor: "#fef9e7",
    icon: "clock",
  },
  RESOLVED: {
    label: "Resolved",
    color: "#27ae60",
    bgColor: "#f0f9f4",
    icon: "check-circle",
  },
  CLOSED: {
    label: "Closed",
    color: "#95a5a6",
    bgColor: "#f8f9fa",
    icon: "x-circle",
  },
};

export default function ConversationModal({
  visible,
  setVisible,
  ticket,
  onSendResponse,
  sendingResponse = false,
}) {
  const [responseMessage, setResponseMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(screenWidth);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      fetchUserTicketsResponse();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setResponseMessage("");
      });
    }
  }, [visible]);

  const handleClose = () => {
    setResponseMessage("");
    setVisible(false);
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) {
      Alert.alert("Error", "Please write a message");
      return;
    }

    try {
      await onSendResponse({
        message: responseMessage.trim(),
        ticketId: ticket.id,
      });
      setResponseMessage("");
      await fetchUserTicketsResponse();
    } catch (error) {
      console.error("Error sending response:", error);
      Alert.alert("Error", "Your response could not be sent.");
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return (
        "Yesterday " +
        date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  async function fetchUserTicketsResponse() {
    try {
      const res = await getResponsesByTicketUser(ticket.id);
      setTickets(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  const renderMessage = (message, index) => {
    const isAdmin = !!message.senderAdmin;
    const senderName =
      message.senderAdmin?.fullname || message.senderUser?.fullname || "User";

    return (
      <View
        key={message.id || index}
        style={[
          styles.messageContainer,
          isAdmin ? styles.adminMessage : styles.userMessage,
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <View
              style={[
                styles.avatar,
                isAdmin ? styles.adminAvatar : styles.userAvatar,
              ]}
            >
              <Feather
                name={isAdmin ? "shield" : "user"}
                size={16}
                color="#fff"
              />
            </View>
            <View style={styles.senderDetails}>
              <Text style={styles.senderName}>{senderName}</Text>
              <Text style={styles.senderRole}>
                {isAdmin ? "Admin" : "User"}
              </Text>
            </View>
          </View>
          <Text style={styles.messageTime}>
            {formatMessageTime(message.createdAt)}
          </Text>
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{message.message}</Text>
        </View>
      </View>
    );
  };

  if (!visible || !ticket) {
    return null;
  }

  return (
    <Modal visible={visible} transparent={false} animationType="none">
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Animated.View
        style={[styles.container, { transform: [{ translateX: slideAnim }] }]}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#2c3e50" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Conversation</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {ticket.title}
                </Text>
              </View>
              <View style={styles.headerRight}>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: TICKET_STATUSES[ticket.status]?.bgColor,
                    },
                  ]}
                >
                  <Feather
                    name={TICKET_STATUSES[ticket.status]?.icon}
                    size={12}
                    color={TICKET_STATUSES[ticket.status]?.color}
                  />
                </View>
              </View>
            </View>

            {/* Ticket Summary */}
            <View style={styles.ticketSummary}>
              <View style={styles.summaryHeader}>
                <Feather name="file-text" size={18} color="#3498db" />
                <Text style={styles.summaryTitle}>Ticket Original</Text>
              </View>
              <Text style={styles.summaryDescription}>
                {ticket.description}
              </Text>
              <View style={styles.summaryMeta}>
                <View style={styles.metaItem}>
                  <Feather name="calendar" size={14} color="#7f8c8d" />
                  <Text style={styles.metaText}>
                    Creado el{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("es-ES")}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="message-circle" size={14} color="#7f8c8d" />
                  <Text style={styles.metaText}>
                    {tickets.length === 1
                      ? `${tickets.length} answer`
                      : `${tickets.length} answers`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Conversation */}
            <View style={styles.conversationContainer}>
              <View style={styles.conversationHeader}>
                <Feather name="message-square" size={18} color="#8e44ad" />
                <Text style={styles.conversationTitle}>Chat History</Text>
              </View>

              <ScrollView
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {tickets && tickets.length > 0 ? (
                  tickets.map((message, index) => renderMessage(message, index))
                ) : (
                  <View style={styles.emptyMessages}>
                    <Feather name="message-circle" size={48} color="#bdc3c7" />
                    <Text style={styles.emptyMessagesText}>
                      There are no replies in this conversation yet.
                    </Text>
                    <Text style={styles.emptyMessagesSubtext}>
                      Be the first to respond
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Response Input */}
            <View style={styles.responseSection}>
              <View style={styles.responseHeader}>
                <Feather name="edit-3" size={18} color="#27ae60" />
                <Text style={styles.responseTitle}>Add Answer</Text>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Write your answer here..."
                  placeholderTextColor="#bdc3c7"
                  value={responseMessage}
                  onChangeText={setResponseMessage}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.characterCount}>
                  {responseMessage.length}/500
                </Text>
              </View>

              <View style={styles.responseActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setResponseMessage("")}
                >
                  <Feather name="x" size={16} color="#7f8c8d" />
                  <Text style={styles.cancelButtonText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (sendingResponse || !responseMessage.trim()) &&
                      styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendResponse}
                  disabled={sendingResponse || !responseMessage.trim()}
                >
                  {sendingResponse ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Feather name="send" size={16} color="#fff" />
                      <Text style={styles.sendButtonText}>Send</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 12,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ticketSummary: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  summaryDescription: {
    fontSize: 15,
    color: "#7f8c8d",
    lineHeight: 22,
    marginBottom: 12,
  },
  summaryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  conversationContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  adminMessage: {
    backgroundColor: "#f0f9f4",
    borderLeftColor: "#27ae60",
  },
  userMessage: {
    backgroundColor: "#ebf3fd",
    borderLeftColor: "#3498db",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  adminAvatar: {
    backgroundColor: "#27ae60",
  },
  userAvatar: {
    backgroundColor: "#3498db",
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
  },
  senderRole: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  messageTime: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 12,
  },
  messageContent: {
    marginLeft: 48,
  },
  messageText: {
    fontSize: 15,
    color: "#2c3e50",
    lineHeight: 22,
  },
  emptyMessages: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyMessagesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
    marginTop: 16,
    textAlign: "center",
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: "#bdc3c7",
    marginTop: 4,
    textAlign: "center",
  },
  responseSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2c3e50",
    backgroundColor: "#f8f9fa",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "right",
  },
  responseActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  sendButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#27ae60",
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
