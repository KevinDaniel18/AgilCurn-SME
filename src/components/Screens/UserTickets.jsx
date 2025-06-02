import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { Feather } from "@expo/vector-icons";
import { respondToTicketUser } from "../../api/endpoint";
import ConversationModal from "./tickets/ConversationModal";
import { useFocusEffect } from "@react-navigation/native";

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

export default function UserTickets({
  visible,
  setVisible,
  userTickets,
  loading,
  fetchUserTickets,
}) {
  const [respondTicket, setRespondTicket] = useState({
    message: "",
    ticketId: undefined,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [conversationModalVisible, setConversationModalVisible] =
    useState(false);
  const [sendingResponse, setSendingResponse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);

  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const responseSlideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to right
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (responseModalVisible) {
      Animated.timing(responseSlideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(responseSlideAnim, {
        toValue: screenWidth,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [responseModalVisible]);

  useFocusEffect(
    useCallback(() => {
      if (!conversationModalVisible) {
        fetchUserTickets();
      }
    }, [!conversationModalVisible])
  );

  useEffect(() => {
    filterTickets();
  }, [userTickets, searchQuery]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchUserTickets();
    setRefreshing(false);
  }

  function filterTickets() {
    let filtered = userTickets;

    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }

  async function handleRespond() {
    if (!respondTicket.message.trim()) {
      Alert.alert("Error", "Please write a message");
      return;
    }

    try {
      setSendingResponse(true);
      await respondToTicketUser(respondTicket);

      setRespondTicket({ message: "", ticketId: undefined });
      setResponseModalVisible(false);
      Alert.alert("Succes", "Your response has been sent");

      // Refresh tickets
      await fetchUserTickets();
    } catch (error) {
      console.error("Error responding to ticket:", error);
      Alert.alert("Error", "Your response could not be sent.");
    } finally {
      setSendingResponse(false);
    }
  }

  async function handleConversationResponse(responseData) {
    try {
      setSendingResponse(true);
      await respondToTicketUser(responseData);

      const updatedTicket = userTickets.find(
        (t) => t.id === responseData.ticketId
      );
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      throw error;
    } finally {
      setSendingResponse(false);
    }
  }

  function openResponseModal(ticket) {
    setSelectedTicket(ticket);
    setRespondTicket({ message: "", ticketId: ticket.id });
    setResponseModalVisible(true);
  }

  function openConversationModal(ticket) {
    setSelectedTicket(ticket);
    setConversationModalVisible(true);
  }

  function closeResponseModal() {
    setRespondTicket({ message: "", ticketId: undefined });
    setResponseModalVisible(false);
  }

  function handleClose() {
    if (responseModalVisible) {
      setResponseModalVisible(false);
      return;
    }
    if (conversationModalVisible) {
      setConversationModalVisible(false);
      return;
    }
    setVisible(false);
  }

  function getTicketStats() {
    const stats = {
      total: userTickets.length,
      open: userTickets.filter((t) => t.status === "OPEN").length,
      inProgress: userTickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: userTickets.filter((t) => t.status === "RESOLVED").length,
    };
    return stats;
  }

  const renderTicketCard = ({ item }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: TICKET_STATUSES[item.status]?.bgColor },
          ]}
        >
          <Feather
            name={TICKET_STATUSES[item.status]?.icon}
            size={12}
            color={TICKET_STATUSES[item.status]?.color}
          />
          <Text
            style={[
              styles.statusText,
              { color: TICKET_STATUSES[item.status]?.color },
            ]}
          >
            {TICKET_STATUSES[item.status]?.label}
          </Text>
        </View>
      </View>

      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.ticketFooter}>
        <View style={styles.ticketInfo}>
          <Feather name="calendar" size={14} color="#7f8c8d" />
          <Text style={styles.ticketDate}>
            {new Date(item.createdAt).toLocaleDateString("es-ES")}
          </Text>
        </View>
        <View style={styles.ticketInfo}>
          <Feather name="message-circle" size={14} color="#7f8c8d" />
          <Text style={styles.responseCount}>
            {item.responses?.length === 1
              ? `${item.responses?.length} answer`
              : `${item.responses?.length} answers`}
          </Text>
        </View>
      </View>

      <View style={styles.ticketActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openResponseModal(item)}
        >
          <Feather name="plus" size={16} color="#3498db" />
          <Text style={styles.actionButtonText}>Add Answer</Text>
        </TouchableOpacity>

        {item.responses && item.responses.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => openConversationModal(item)}
          >
            <Feather name="eye" size={16} color="#8e44ad" />
            <Text style={[styles.actionButtonText, { color: "#8e44ad" }]}>
              See Conversation
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const stats = getTicketStats();

  if (loading) {
    return (
      <Modal visible={visible} transparent={false} animationType="none">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading your tickets...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <>
      <Modal visible={visible} transparent={false} animationType="none">
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <Animated.View
          style={[
            styles.fullScreenContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#2c3e50" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>My Tickets</Text>
              <TouchableOpacity
                onPress={handleRefresh}
                style={styles.refreshButton}
              >
                <Feather name="refresh-cw" size={20} color="#3498db" />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: "#e74c3c" }]}>
                  {stats.open}
                </Text>
                <Text style={styles.statLabel}>Open</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: "#f39c12" }]}>
                  {stats.inProgress}
                </Text>
                <Text style={styles.statLabel}>In progress</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: "#27ae60" }]}>
                  {stats.resolved}
                </Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color="#7f8c8d" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search my tickets..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#bdc3c7"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Feather name="x" size={20} color="#7f8c8d" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Tickets List */}
            <FlatList
              data={filteredTickets}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTicketCard}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="inbox" size={64} color="#bdc3c7" />
                  <Text style={styles.emptyTitle}>You don't have tickets</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "No tickets were found with that search."
                      : "You haven't created any support tickets yet."}
                  </Text>
                </View>
              }
            />
          </SafeAreaView>
        </Animated.View>

        {/* Response Modal */}
        <Modal
          visible={responseModalVisible}
          transparent={false}
          animationType="none"
        >
          <StatusBar backgroundColor="#fff" barStyle="dark-content" />
          <Animated.View
            style={[
              styles.fullScreenContainer,
              { transform: [{ translateX: responseSlideAnim }] },
            ]}
          >
            <SafeAreaView style={styles.safeArea}>
              <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                {/* Response Header */}
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={closeResponseModal}
                    style={styles.backButton}
                  >
                    <Feather name="arrow-left" size={24} color="#2c3e50" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Add Answer</Text>
                  <View style={styles.headerRight} />
                </View>

                <ScrollView
                  style={styles.responseContent}
                  contentContainerStyle={styles.responseContentContainer}
                >
                  {/* Ticket Info */}
                  <View style={styles.ticketInfoCard}>
                    <View style={styles.ticketInfoHeader}>
                      <Feather name="file-text" size={20} color="#3498db" />
                      <Text style={styles.ticketInfoTitle}>
                        Ticket Information
                      </Text>
                    </View>
                    <Text style={styles.ticketInfoTitleText}>
                      {selectedTicket?.title}
                    </Text>
                    <Text style={styles.ticketInfoDescription}>
                      {selectedTicket?.description}
                    </Text>
                    <View style={styles.ticketInfoMeta}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              TICKET_STATUSES[selectedTicket?.status]?.bgColor,
                          },
                        ]}
                      >
                        <Feather
                          name={TICKET_STATUSES[selectedTicket?.status]?.icon}
                          size={12}
                          color={TICKET_STATUSES[selectedTicket?.status]?.color}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                TICKET_STATUSES[selectedTicket?.status]?.color,
                            },
                          ]}
                        >
                          {TICKET_STATUSES[selectedTicket?.status]?.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Response Input */}
                  <View style={styles.responseInputCard}>
                    <View style={styles.responseInputHeader}>
                      <Feather name="edit-3" size={20} color="#27ae60" />
                      <Text style={styles.responseInputTitle}>Your answer</Text>
                    </View>
                    <TextInput
                      style={styles.responseInput}
                      placeholder="Write additional information, clarifications, or answers here..."
                      placeholderTextColor="#bdc3c7"
                      value={respondTicket.message}
                      onChangeText={(text) =>
                        setRespondTicket({ ...respondTicket, message: text })
                      }
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                    <Text style={styles.characterCount}>
                      {respondTicket.message.length}/500 characters
                    </Text>
                  </View>
                </ScrollView>

                {/* Response Actions */}
                <View style={styles.responseActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeResponseModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (sendingResponse || !respondTicket.message.trim()) &&
                        styles.sendButtonDisabled,
                    ]}
                    onPress={handleRespond}
                    disabled={sendingResponse || !respondTicket.message.trim()}
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
              </KeyboardAvoidingView>
            </SafeAreaView>
          </Animated.View>
        </Modal>
      </Modal>
      <ConversationModal
        visible={conversationModalVisible || false}
        setVisible={setConversationModalVisible}
        ticket={selectedTicket}
        onSendResponse={handleConversationResponse}
        sendingResponse={sendingResponse}
      />
    </>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
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
  refreshButton: {
    padding: 4,
  },
  headerRight: {
    width: 28,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#2c3e50",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  ticketDescription: {
    fontSize: 16,
    color: "#7f8c8d",
    lineHeight: 22,
    marginBottom: 16,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  ticketInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ticketDate: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  responseCount: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  ticketActions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#ebf3fd",
    gap: 6,
  },
  viewButton: {
    backgroundColor: "#f3e8ff",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3498db",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
  },
  responseContent: {
    flex: 1,
  },
  responseContentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  ticketInfoCard: {
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
  ticketInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  ticketInfoTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  ticketInfoDescription: {
    fontSize: 16,
    color: "#7f8c8d",
    lineHeight: 22,
    marginBottom: 16,
  },
  ticketInfoMeta: {
    alignItems: "flex-start",
  },
  responseInputCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  responseInputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  responseInputTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2c3e50",
    backgroundColor: "#f8f9fa",
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "right",
  },
  responseActions: {
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
    flex: 1,
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
