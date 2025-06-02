import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { Feather, Entypo } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getResponsesByTicket } from "../../../api/endpoint";

const { width: screenWidth } = Dimensions.get("window");

export default function RenderResponseModal({
  responseModalVisible,
  setResponseModalVisible,
  selectedTicket,
  TICKET_STATUSES,
  responseMessage,
  setResponseMessage,
  sendingResponse,
  handleRespondTicket,
}) {
  const [responses, setResponses] = useState([]);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (responseModalVisible) {
      // Slide in from right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      fetchResponses();
    } else {
      // Slide out to right
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [responseModalVisible]);

  async function sendResponse() {
    await handleRespondTicket();
    await fetchResponses();
  }

  const handleClose = () => {
    setResponseMessage("");
    setResponseModalVisible(false);
  };

  async function fetchResponses() {
    if (!selectedTicket?.id) {
      return;
    }
    try {
      const res = await getResponsesByTicket(selectedTicket?.id);
      console.log("responses", res.data);
      setResponses(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchResponses();
  }, [selectedTicket?.id]);

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={responseModalVisible}
      transparent={false}
      animationType="none"
      statusBarTranslucent={Platform.OS === "android"}
    >
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Animated.View
        style={[
          styles.fullScreenContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.backButton, { marginTop: insets.top + 20 }]}
            >
              <Feather name="arrow-left" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { marginTop: insets.top + 20 }]}>
              Reply Ticket
            </Text>
            <View style={styles.headerRight} />
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Ticket Information Card */}
            <View style={styles.ticketCard}>
              <View style={styles.ticketCardHeader}>
                <Feather name="file-text" size={20} color="#3498db" />
                <Text style={styles.ticketCardTitle}>Ticket Information</Text>
              </View>

              <View style={styles.ticketInfo}>
                <Text style={styles.ticketTitle}>{selectedTicket?.title}</Text>
                <Text style={styles.ticketDescription}>
                  {selectedTicket?.description}
                </Text>

                <View style={styles.ticketMeta}>
                  <View style={styles.metaItem}>
                    <Feather name="user" size={16} color="#7f8c8d" />
                    <Text style={styles.metaText}>
                      {selectedTicket?.user?.fullname ||
                        selectedTicket?.userEmail ||
                        "Usuario"}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={16} color="#7f8c8d" />
                    <Text style={styles.metaText}>
                      {new Date(
                        selectedTicket?.createdAt || Date.now()
                      ).toLocaleDateString("es-ES")}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            TICKET_STATUSES[selectedTicket?.status]?.color,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusLabel,
                        {
                          color: TICKET_STATUSES[selectedTicket?.status]?.color,
                        },
                      ]}
                    >
                      {TICKET_STATUSES[selectedTicket?.status]?.label}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Conversation History */}
            {responses && responses.length > 0 && (
              <View style={styles.conversationCard}>
                <View style={styles.conversationHeader}>
                  <Feather name="message-square" size={20} color="#8e44ad" />
                  <Text style={styles.conversationTitle}>Chat History</Text>
                  <View style={styles.messageCount}>
                    <Text style={styles.messageCountText}>
                      {responses.length}
                    </Text>
                  </View>
                </View>

                <ScrollView
                  style={styles.messagesContainer}
                  nestedScrollEnabled={true}
                >
                  {responses.map(
                    ({ id, message, senderAdmin, senderUser, createdAt }) => {
                      const isAdmin = !!senderAdmin;
                      const senderName =
                        senderAdmin?.fullname ||
                        senderUser?.fullname ||
                        "Unknown sender";

                      return (
                        <View
                          key={id}
                          style={[
                            styles.messageItem,
                            isAdmin ? styles.adminMessage : styles.userMessage,
                          ]}
                        >
                          <View style={styles.messageHeader}>
                            <View style={styles.senderInfo}>
                              <View
                                style={[
                                  styles.senderAvatar,
                                  isAdmin
                                    ? styles.adminAvatar
                                    : styles.userAvatar,
                                ]}
                              >
                                <Feather
                                  name={isAdmin ? "shield" : "user"}
                                  size={14}
                                  color={isAdmin ? "#fff" : "#fff"}
                                />
                              </View>
                              <View>
                                <Text style={styles.senderName}>
                                  {senderName}
                                </Text>
                                <Text style={styles.senderRole}>
                                  {isAdmin ? "Admin" : "User"}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.messageTime}>
                              {formatMessageTime(createdAt)}
                            </Text>
                          </View>
                          <Text style={styles.messageText}>{message}</Text>
                        </View>
                      );
                    }
                  )}
                </ScrollView>
              </View>
            )}

            {/* Response Section */}
            <View style={styles.responseCard}>
              <View style={styles.responseCardHeader}>
                <Feather name="edit-3" size={20} color="#27ae60" />
                <Text style={styles.responseCardTitle}>New Response</Text>
              </View>

              <View style={styles.responseInputContainer}>
                <TextInput
                  style={styles.responseInput}
                  placeholder="Write your detailed answer here..."
                  placeholderTextColor="#999"
                  value={responseMessage}
                  onChangeText={setResponseMessage}
                  multiline
                  textAlignVertical="top"
                  returnKeyType="default"
                  blurOnSubmit={false}
                  scrollEnabled={true}
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.characterCount}>
                    {responseMessage.length} characters
                  </Text>
                </View>
              </View>
            </View>

            {/* Tips Section */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Entypo name="light-bulb" size={18} color="#f39c12" />
                <Text style={styles.tipsTitle}>Tips for a good response</Text>
              </View>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>
                  • Be clear and specific in your answer
                </Text>
                <Text style={styles.tipItem}>
                  • Provides detailed steps if necessary
                </Text>
                <Text style={styles.tipItem}>
                  • Maintain a professional and friendly tone
                </Text>
                <Text style={styles.tipItem}>
                  • Includes additional resources if applicable
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                sendingResponse && styles.sendButtonDisabled,
              ]}
              onPress={sendResponse}
              disabled={sendingResponse || !responseMessage.trim()}
            >
              {sendingResponse ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#fff" />
                  <Text style={styles.sendButtonText}>Send Response</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  ticketInfo: {
    gap: 12,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    lineHeight: 24,
  },
  ticketDescription: {
    fontSize: 16,
    color: "#7f8c8d",
    lineHeight: 22,
  },
  ticketMeta: {
    gap: 8,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  conversationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
    flex: 1,
  },
  messageCount: {
    backgroundColor: "#8e44ad",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  messageCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  messagesContainer: {
    maxHeight: 300,
  },
  messageItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  adminMessage: {
    backgroundColor: "#f0f9f4",
    borderLeftColor: "#27ae60",
  },
  userMessage: {
    backgroundColor: "#f8f9fa",
    borderLeftColor: "#3498db",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  senderName: {
    fontSize: 14,
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
    marginLeft: 8,
  },
  messageText: {
    fontSize: 15,
    color: "#2c3e50",
    lineHeight: 22,
  },
  responseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  responseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  responseCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  responseInputContainer: {
    gap: 8,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2c3e50",
    backgroundColor: "#f8f9fa",
    minHeight: 150,
    maxHeight: 300,
    textAlignVertical: "top",
  },
  inputFooter: {
    alignItems: "flex-end",
  },
  characterCount: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  sendButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#27ae60",
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
