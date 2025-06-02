import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { deleteAccountByEmailAndPassword } from "../../api/endpoint";
import { useAuth } from "../AuthContext/AuthContext";
import { recoverPassword } from "../../api/endpoint";
import Feather from "@expo/vector-icons/Feather";
import RenderModal from "../modal/RenderModal";

const ManageAccount = () => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isRecoverPasswordModalVisible, setIsRecoverPasswordModalVisible] =
    useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { token, logout } = useAuth();

  const closeModals = () => {
    setIsDeleteModalVisible(false);
    setIsRecoverPasswordModalVisible(false);
  };

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
        closeModals();
        return;
      }

      const res = await deleteAccountByEmailAndPassword(email, password, token);
      if (res && res.message === "Invalid token or token missing") {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "This is not your account",
          visibilityTime: 4000,
          autoHide: true,
        });
        closeModals();
      } else {
        logout();
      }
    } catch (error) {
      console.log("error", error.response.status);
      if (error.response) {
        if (error.response.status === 401) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Invalid credentials",
            visibilityTime: 4000,
            autoHide: true,
          });
          closeModals();
        }
      }
    }
    closeModals();
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
        closeModals();
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
        closeModals();
        return;
      }

      const response = await recoverPassword(email);

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Recovery email sent",
        });
        closeModals();
        setEmail("");
      } else {
        Toast.show({
          type: "error",
          text1: "Error sending recovery email",
        });
        closeModals();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.message,
        text2: "Email not found",
        visibilityTime: 4000,
        autoHide: true,
      });
      closeModals();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recover Password</Text>
          <View style={styles.card}>
            <View style={styles.cardIconContainer}>
              <View style={[styles.iconBackground, styles.recoverIconBg]}>
                <Feather name="lock" size={24} color="#3498db" />
              </View>
            </View>
            <Text style={styles.cardText}>
              If you do not remember your password you can recover it with your
              registered email.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.recoverButton]}
              onPress={() => setIsRecoverPasswordModalVisible(true)}
            >
              <Text style={styles.recoverButtonText}>Recover Password</Text>
              <Feather name="arrow-right" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delete Account</Text>
          <View style={[styles.card, styles.deleteCard]}>
            <View style={styles.cardIconContainer}>
              <View style={[styles.iconBackground, styles.deleteIconBg]}>
                <Feather name="alert-triangle" size={24} color="#e74c3c" />
              </View>
            </View>
            <Text style={styles.cardText}>
              This action is irreversible. Your projects and information will be
              permanently deleted.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => setIsDeleteModalVisible(true)}
            >
              <Feather name="trash-2" size={18} color="white" />
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <RenderModal
          visible={isRecoverPasswordModalVisible}
          title="Recover Password"
          onClose={() => setIsRecoverPasswordModalVisible(false)}
          onSubmit={handleRecoverPass}
          submitText="Send Recovery Email"
          showPassword={false}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />

        <RenderModal
          visible={isDeleteModalVisible}
          title="Delete Account"
          onClose={() => setIsDeleteModalVisible(false)}
          onSubmit={handleDeleteAccount}
          submitText="Delete"
          showPassword={true}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContent: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2c3e50",
    marginBottom: 24,
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#34495e",
    marginBottom: 12,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  cardIconContainer: {
    marginBottom: 16,
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  recoverIconBg: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
  },
  deleteIconBg: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  cardText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 20,
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
  },
  buttonTextModal: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonTextCancel: {
    textAlign: "center",
    color: "#7f8c8d",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  recoverButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  recoverButton: {
    backgroundColor: "#3498db",
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: width * 0.85,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  input: {
    width: "100%",
    height: 54,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    color: "#2c3e50",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    padding: 16,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
});
export default ManageAccount;
