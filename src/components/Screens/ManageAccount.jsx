import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  Modal,
  TextInput,
  Animated,
  Text,
  TouchableOpacity,
} from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { deleteAccountByEmailAndPassword } from "../../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../AuthContext/AuthContext";
import { recoverPassword } from "../../api/endpoint";

const ManageAccount = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRecoverPasswordModalVisible, setIsRecoverPasswordModalVisible] =
    useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const fadeAnim = new Animated.Value(0);
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

  useEffect(() => {
    if (isModalVisible || isRecoverPasswordModalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isModalVisible, isRecoverPasswordModalVisible]);

  const handleDeleteAccount = () => {
    setIsModalVisible(true);
    fadeAnim.setValue(1);
  };

  const handleSubmit = async () => {
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
        setIsModalVisible(false);
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
    setIsModalVisible(false);
    setEmail("");
    setPassword("");
  };

  const onRequestClose = () => {
    setIsModalVisible(false);
    setShowErrorModal(false);
    setIsRecoverPasswordModalVisible(false);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setIsRecoverPasswordModalVisible(false);
  };

  const recoverPass = async () => {
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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recover Password</Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>
          If you do not remember your password you can recover it with your
          registered email.
        </Text>
        <Button
          title="Recover"
          onPress={() => setIsRecoverPasswordModalVisible(true)}
          color="#28a745"
        />
      </View>

      <Text style={styles.title}>Delete Account</Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>
          This action is irreversible. Your projects and information will be
          deleted.
        </Text>
        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          color="#ff6b6b"
        />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={onRequestClose}
      >
        <View style={styles.centeredView}>
          <Animated.View style={{ ...styles.modalView, opacity: fadeAnim }}>
            <Text style={styles.modalText}>
              Enter your email and password to delete your account
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <View style={styles.buttonContent}>
              <Button title="Cancel" onPress={handleCloseModal} color="#999" />
              <Button
                title="Delete Account"
                onPress={handleSubmit}
                color="#ff6b6b"
              />
            </View>
          </Animated.View>
        </View>
        <Toast />
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isRecoverPasswordModalVisible}
        onRequestClose={onRequestClose}
      >
        <View style={styles.centeredView}>
          <Animated.View style={{ ...styles.modalView, opacity: fadeAnim }}>
            <Text style={styles.modalText}>
              Enter your email to recover your password
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              autoCapitalize="none"
            />
            <View style={styles.buttonContent}>
              <Button title="Cancel" onPress={handleCloseModal} color="#999" />
              <Button
                title="Send Recovery Email"
                onPress={recoverPass}
                color="#28a745"
              />
            </View>
          </Animated.View>
        </View>
        <Toast />
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showErrorModal}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.textError}>{error}</Text>
            <TouchableOpacity onPress={()=>setShowErrorModal(false)}>
              <Text style={{color: "red", fontWeight: "bold"}}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  box: {
    width: "90%",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  boxText: {
    marginBottom: 15,
    color: "#555",
    lineHeight: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  modalView: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: "100%",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  buttonContent: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-around",
    width: "100%",
  },
  textError: {
    marginBottom: 10,
  },
});

export default ManageAccount;
