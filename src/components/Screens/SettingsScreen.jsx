import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  Modal,
  TextInput,
  Animated,
  Text,
} from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { deleteAccountByEmailAndPassword } from "../../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../AuthContext/AuthContext";

const SettingsScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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
    if (isModalVisible) {
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
  }, [isModalVisible]);

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
        logout()
      }
    } catch (error) {
      console.log("error", error);
      setShowErrorModal(true);
    }
    setIsModalVisible(false);
    setEmail("");
    setPassword("");
  };

  const onRequestClose = () => {
    setIsModalVisible(false);
    setShowErrorModal(false);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Salir" onPress={handleLogout} />
      <Text>Delete Account</Text>
      <Button title="Delete Account" onPress={handleDeleteAccount} />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={onRequestClose}
      >
        <View style={styles.centeredView}>
          <Animated.View style={{ ...styles.modalView, opacity: fadeAnim }}>
            <Text>Enter your email and password to delete your account</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <View style={styles.buttonContent}>
              <Button title="Cancel" onPress={handleCloseModal} />
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
        visible={showErrorModal}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>{error}</Text>
            <Button title="OK" onPress={() => setShowErrorModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    width: 250,
    margin: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  buttonContent: {
    flexDirection: "row", // Esto hace que los elementos dentro del View se distribuyan horizontalmente
    marginTop: 20,
    justifyContent: "space-around", // Esto distribuye los elementos equitativamente a lo largo del eje principal (horizontalmente)
    width: "100%", // E
  },
});

export default SettingsScreen;
