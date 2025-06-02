import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export const renderTicketCard = ({
  item,
  TICKET_STATUSES,
  openStatusModal,
  openResponseModal,
}) => (
  <View style={styles.ticketCard}>
    <View style={styles.ticketHeader}>
      <Text style={styles.ticketTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <TouchableOpacity onPress={() => openStatusModal(item)}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                TICKET_STATUSES[item.status]?.bgColor || "#f8f9fa",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: TICKET_STATUSES[item.status]?.color || "#666" },
            ]}
          >
            {TICKET_STATUSES[item.status]?.label || item.status}
          </Text>
        </View>
      </TouchableOpacity>
    </View>

    <Text style={styles.ticketDescription} numberOfLines={2}>
      {item.description}
    </Text>

    <View style={styles.ticketFooter}>
      <View style={styles.ticketInfo}>
        <Feather name="calendar" size={14} color="#7f8c8d" />
        <Text style={styles.ticketDate}>
          {new Date(item.createdAt || Date.now()).toLocaleDateString("es-ES")}
        </Text>
      </View>
      <View style={styles.ticketInfo}>
        <Feather name="user" size={14} color="#7f8c8d" />
        <Text style={styles.ticketUser}>
          {item.user?.fullname || "Usuario"}
        </Text>
      </View>
    </View>

    <View style={styles.ticketActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => openResponseModal(item)}
      >
        <Feather name="message-circle" size={16} color="#3498db" />
        <Text style={styles.actionButtonText}>Reply</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.statusActionButton]}
        onPress={() => openStatusModal(item)}
      >
        <Feather name="edit-3" size={16} color="#f39c12" />
        <Text style={[styles.actionButtonText, { color: "#f39c12" }]}>
          Status
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  ticketDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },
  ticketInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketDate: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  ticketUser: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  ticketActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    flex: 0.48,
    justifyContent: "center",
  },
  statusActionButton: {
    backgroundColor: "#fef9e7",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#3498db",
    marginLeft: 6,
    fontWeight: "500",
  },
});
