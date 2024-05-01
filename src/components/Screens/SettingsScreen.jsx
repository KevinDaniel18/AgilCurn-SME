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
import { deleteAccount } from "../../api/endpoint";
import { Toast } from "react-native-toast-message/lib/src/Toast";

const SettingsScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fadeAnim = new Animated.Value(0);

  const handleLogout = () => {
    alert("Going to login");
  };

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

  const handleSubmit = async() => {
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
    await deleteAccount(email, password)
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Failed to delete",
      text2: error.message,
      visibilityTime: 4000,
      autoHide: true,
    });
  }
    setIsModalVisible(false);
    // Restablece los valores de los campos de entrada
    setEmail("");
    setPassword("");
  };

  const onRequestClose = () => {
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
              placeholder="Correo electrónico"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <Button title="Eliminar cuenta" onPress={handleSubmit} />
          </Animated.View>
        </View>
      <Toast/>
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
});

export default SettingsScreen;
