import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { loginUser } from "../../api/endpoint";

const LoginScreen = ({ setIsLoggedIn, navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Toast.show({
          type: "error",
          text1: "Campos vacios",
          text2: "Por favor ingresa tus datos",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }
      const response = await loginUser(email, password);
      console.log(response);

      if (response.result && response.result.token) {
        setIsLoggedIn(true);
        Toast.show({
          type: "success",
          text1: "Hola!",
          text2: "Bienvenido",
          visibilityTime: 10000,
          autoHide: true,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Inicio de sesión fallido",
          text2: "Por favor revisa tus credenciales",
          visibilityTime: 4000,
          autoHide: true,
        });
      }
      
    } catch (error) {
      console.error("error", error);
      console.log(error.response);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
      />
      <Button title="Iniciar sesión" onPress={handleLogin} />
      <TouchableOpacity onPress={navigateToRegister}>
        <Text style={styles.registerText}>
          ¿No tienes cuenta? Regístrate aquí
        </Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  registerText: {
    marginTop: 10,
    color: "blue",
  },
});

export default LoginScreen;
