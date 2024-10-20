import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { deleteAccountByEmailAndPassword } from "../../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../AuthContext/AuthContext";
import { recoverPassword } from "../../api/endpoint";
import Feather from "@expo/vector-icons/Feather";

const ManageAccount = () => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isRecoverPasswordModalVisible, setIsRecoverPasswordModalVisible] =
    useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
      } catch (error) {
        console.error("Error retrieving token:", error);
      }
    };
    getToken();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Toast.show({
          type: "info",
          text1: "empty fields",
          text2: "Please enter your information",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      const res = await deleteAccountByEmailAndPassword(email, password, token);
      if (res && res.message === "Invalid token or token missing") {
        setError("This is not your account");
        setShowErrorModal(true);
      } else {
        logout();
      }
    } catch (error) {
      console.log("error", error.response.status);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid credentials");
        }
      }
      setShowErrorModal(true);
    }
    setEmail("");
    setPassword("");
  };

  const handleRecoverPass = async () => {
    try {
      if (!email.trim()) {
        Toast.show({
          type: "info",
          text1: "Empty field",
          text2: "Please enter your email",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Please enter a valid email address",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      const response = await recoverPassword(email);

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Recovery email sent",
        });
        setEmail("");
      } else {
        Toast.show({
          type: "error",
          text1: "Error sending recovery email",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.message,
        text2: "Email not found",
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const renderModal = (
    visible,
    title,
    onClose,
    onSubmit,
    submitText,
    showPassword = false
  ) => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {showPassword && (
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonTextModal}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  { backgroundColor: showPassword ? "#ff6b6b" : "#28a745" },
                ]}
                onPress={onSubmit}
              >
                <Text style={styles.buttonTextModal}>{submitText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Toast/>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recover Password</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              If you do not remember your password you can recover it with your
              registered email.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.recoverButton]}
              onPress={() => setIsRecoverPasswordModalVisible(true)}
            >
              <Feather name="lock" size={24} color="black" />
              <Text style={styles.buttonText}>Recover Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delete Account</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              This action is irreversible. Your projects and information will be
              deleted.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => setIsDeleteModalVisible(true)}
            >
              <Feather name="trash-2" size={20} color="white" />
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderModal(
          isRecoverPasswordModalVisible,
          "Recover Password",
          () => setIsRecoverPasswordModalVisible(false),
          handleRecoverPass,
          "Send Recovery Email"
        )}

        {renderModal(
          isDeleteModalVisible,
          "Delete Account",
          () => setIsDeleteModalVisible(false),
          handleDeleteAccount,
          "Delete",
          true
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={showErrorModal}
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={[styles.button, styles.errorButton]}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  buttonTextModal: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  recoverButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#999",
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 24,
  },
});

export default ManageAccount;
