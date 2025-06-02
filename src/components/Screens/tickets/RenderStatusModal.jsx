import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

export const RenderStatusModal = ({
  modalVisible,
  setModalVisible,
  TICKET_STATUSES,
  selectedTicket,
  handleUpdateTicketStatus,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (modalVisible) {
      // Fade in + slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out + slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  return (
    <Modal visible={modalVisible} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.modalTitle}>Change Ticket Status</Text>
          <Text style={styles.modalSubtitle}>{selectedTicket?.title}</Text>

          {Object.entries(TICKET_STATUSES).map(([status, config]) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusOption,
                selectedTicket?.status === status && styles.currentStatusOption,
              ]}
              onPress={() =>
                handleUpdateTicketStatus(selectedTicket.id, status)
              }
            >
              <View
                style={[styles.statusDot, { backgroundColor: config.color }]}
              />
              <Text style={styles.statusOptionText}>{config.label}</Text>
              {selectedTicket?.status === status && (
                <Feather name="check" size={20} color="#27ae60" />
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  currentStatusOption: {
    backgroundColor: "#f0f9f4",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#7f8c8d",
  },
});
