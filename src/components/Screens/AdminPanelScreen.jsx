import {
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import {
  getAllTickets,
  respondToTicket,
  updateTicketStatus,
} from "../../api/endpoint";
import { renderTicketCard } from "./tickets/renderTicketCard";
import { Feather } from "@expo/vector-icons";
import { RenderStatusModal } from "./tickets/RenderStatusModal";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import RenderResponseModal from "./tickets/RenderResponseModal";

const TICKET_STATUSES = {
  OPEN: { label: "Open", color: "#e74c3c", bgColor: "#fdf2f2" },
  IN_PROGRESS: { label: "In progress", color: "#f39c12", bgColor: "#fef9e7" },
  RESOLVED: { label: "Resolved", color: "#27ae60", bgColor: "#f0f9f4" },
  CLOSED: { label: "Closed", color: "#95a5a6", bgColor: "#f8f9fa" },
};

export default function AdminPanelScreen() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [modalVisible, setModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, selectedStatus]);

  async function fetchTickets() {
    try {
      setLoading(true);
      const res = await getAllTickets();
      setTickets(res.data);
      console.log(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      Alert.alert("Error", "Tickets could not be loaded");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }

  function filterTickets() {
    let filtered = tickets;

    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((ticket) => ticket.status === selectedStatus);
    }

    setFilteredTickets(filtered);
  }

  async function handleUpdateTicketStatus(ticketId, newStatus) {
    try {
      await updateTicketStatus(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
      Alert.alert("Error", "Ticket status could not be updated");
    }
  }

  function getTicketStats() {
    const stats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
    };
    return stats;
  }

  function openStatusModal(ticket) {
    setSelectedTicket(ticket);
    setModalVisible(true);
  }

  function openResponseModal(ticket) {
    setSelectedTicket(ticket);
    setResponseModalVisible(true);
  }

  async function handleRespondTicket() {
    if (!responseMessage.trim()) {
      Toast.show({
        type: "info",
        text1: "Alert",
        text2: "Please enter a reply message",
        autoHide: true,
      });
      return;
    }
    try {
      setSendingResponse(true);
      const respondData = {
        message: responseMessage.trim(),
        ticketId: selectedTicket.id,
      };
      await respondToTicket(respondData);

      if (selectedTicket.status === "OPEN") {
        await handleUpdateTicketStatus(selectedTicket.id, "IN_PROGRESS");
      }

      setResponseMessage("");
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "The response could not be sent.",
      });
    } finally {
      setSendingResponse(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Log Out", "¿Are you sure you want to log out??", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  }

  const stats = getTicketStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Administration Panel</Text>
          <Text style={styles.headerSubtitle}>Ticket Management</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>

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

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        {["ALL", ...Object.keys(TICKET_STATUSES)].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === status && styles.activeFilterButtonText,
              ]}
            >
              {status === "ALL" ? "Todos" : TICKET_STATUSES[status].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          renderTicketCard({
            item,
            TICKET_STATUSES,
            openStatusModal,
            openResponseModal,
          })
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#bdc3c7" />
            <Text style={styles.emptyText}>No tickets found</Text>
          </View>
        }
      />

      <RenderStatusModal
        modalVisible={modalVisible || false}
        setModalVisible={setModalVisible}
        TICKET_STATUSES={TICKET_STATUSES}
        selectedTicket={selectedTicket}
        handleUpdateTicketStatus={handleUpdateTicketStatus}
      />

      <RenderResponseModal
        responseModalVisible={responseModalVisible || false}
        setResponseModalVisible={setResponseModalVisible}
        selectedTicket={selectedTicket}
        TICKET_STATUSES={TICKET_STATUSES}
        responseMessage={responseMessage}
        setResponseMessage={setResponseMessage}
        sendingResponse={sendingResponse}
        handleRespondTicket={handleRespondTicket}
      />
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  logoutButton: {
    padding: 8,
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
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#2c3e50",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
  },
  activeFilterButton: {
    backgroundColor: "#3498db",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: "#fff",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#bdc3c7",
    marginTop: 12,
  },
});
