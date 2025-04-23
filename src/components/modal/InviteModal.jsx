import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  ActivityIndicator
} from "react-native";
import Toast from "react-native-toast-message";
import DropdownSelect from "react-native-input-select";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useEffect } from "react";

export default function InviteModal({
  visible,
  onClose,
  invitedUser,
  setInvitedUser,
  roleId,
  setRoleId,
  loading,
  confirmInviteUser,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current; // parte desde abajo

  useEffect(() => {
    if (visible) {
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
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Toast />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Ionicons name="person-add-outline" size={24} color="#4A6CF7" />
            <Text style={styles.modalTitle}>Invite Team Member</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* Body */}
          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Email or User ID</Text>
            <TextInput
              style={styles.input}
              value={invitedUser.trim()}
              onChangeText={setInvitedUser}
              placeholder="Enter email address or user ID"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              Select Role
            </Text>
            <DropdownSelect
              placeholder="Choose a role..."
              options={[
                { label: "Product Owner", value: 1 },
                { label: "Scrum Master", value: 2 },
                { label: "Developer/Invited", value: 3 },
              ]}
              selectedValue={roleId}
              onValueChange={(value) => setRoleId(value)}
              primaryColor="#4A6CF7"
              dropdownStyle={styles.dropdown}
              optionContainerStyle={styles.dropdownOptions}
              selectedItemStyle={styles.selectedItem}
              placeholderStyle={styles.placeholderStyle}
            />
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.inviteButton,
                { opacity: invitedUser.trim() && !loading ? 1 : 0.7 },
              ]}
              onPress={confirmInviteUser}
              disabled={!invitedUser.trim() || loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.inviteButtonText}>Invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    padding: 20,
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  dropdown: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownOptions: {
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedItem: {
    color: "#1E293B",
    fontWeight: "500",
  },
  placeholderStyle: {
    color: "#94A3B8",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  cancelButtonText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 16,
  },
  inviteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#4A6CF7",
    minWidth: 100,
    alignItems: "center",
  },
  inviteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
