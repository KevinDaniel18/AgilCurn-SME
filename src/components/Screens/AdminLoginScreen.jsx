import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../AuthContext/AuthContext";
import { loginAdmin } from "../../api/endpoint";

export default function AdminLoginScreen({ navigation, toast }) {
  const { loginAsAdmin } = useAuth();
  const [data, setData] = useState({
    fullname: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setIsLoading] = useState(false);

  function getInput(name, value) {
    setData((prev) => ({ ...prev, [name]: value }));
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  async function handleLogin() {
    setIsLoading(true);
    try {
      if (!data.fullname.trim() || !data.password.trim()) {
        toast(
          "info",
          "empty fields",
          "Please enter your information",
          4000,
          true
        );
        return;
      }
      const res = await loginAdmin(data);
      const token = res?.data?.access_token;

      if (token) {
        await loginAsAdmin(token);
        navigation.navigate("AdminPanel");
      } else {
        toast(
          "error",
          "Failed login",
          "Please check your credentials",
          4000,
          true
        );
      }
    } catch (error) {
      toast(
        "error",
        "Failed login",
        `${error.response.data.message}`,
        4000,
        true
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administration Panel</Text>
      <Text style={styles.subtitle}>Exclusive access for administrators</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <Feather name="user" size={20} color="#666" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#999"
            onChangeText={(text) => getInput("fullname", text)}
            value={data.fullname}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <Feather name="shield" size={20} color="#666" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Administrator password"
            placeholderTextColor="#999"
            onChangeText={(text) => getInput("password", text)}
            value={data.password}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Feather
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Access the Panel</Text>
          )}
        </TouchableOpacity>

        <View style={styles.adminNotice}>
          <Feather name="info" size={16} color="#7f8c8d" />
          <Text style={styles.adminNoticeText}>
            Only authorized personnel can access this section
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: "#3498db",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 24,
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: "#bdc3c7",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  adminNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  adminNoticeText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 8,
    textAlign: "center",
    flex: 1,
    lineHeight: 16,
  },
});
