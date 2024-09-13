import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useProject } from "../StoreProjects/ProjectContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../AuthContext/AuthContext";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import { getUserById } from "../../api/endpoint";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import { StatusBar } from "expo-status-bar";

const Account = ({ navigation }) => {
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const { profileImage, updateProfileImage } = useProject();
  const [userId, setUserId] = useState(null);
  const [userFullName, setUserFullName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current; 
  const [progress, setProgress] = useState(0);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      const userName = await AsyncStorage.getItem("userName");
      setUserFullName(userName);
      setUserId(Number(storedUserId));
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    setLocalProfileImage(profileImage);
  }, [profileImage]);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (userId) {
        const res = await getUserById(userId);
        setLocalProfileImage(res.data.profileImage);
      }
    };

    loadProfileImage();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("profileImage");
      logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("Image picker result:", result);

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const fileType = uri.split(".").pop(); 
      try {
        setUploading(true);
        const downloadURL = await uploadImage(uri, fileType);
        setLocalProfileImage(downloadURL);
        updateProfileImage(downloadURL);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  async function uploadImage(uri, fileType) {
    const res = await fetch(uri);
    const blob = await res.blob();

    const storageRef = ref(storage, "Stuff/" + new Date().getTime());
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          Animated.timing(progressAnim, {
            toValue: progress,
            duration: 500,
            useNativeDriver: false,
          }).start();
        },
        (error) => {
          setUploading(false);
          reject(error);
        },
        async () => {
          setUploading(false);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  }

  const copyToClipboard = async () => {
    if (userId !== null) {
      await Clipboard.setStringAsync(String(userId));
      Alert.alert("ID Copied", "The ID has been copied to clipboard!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
       <StatusBar
        barStyle={uploading ? "light-content" : "dark-content"}
        backgroundColor={uploading ? "#007bff" : "#f5f5f5"}
      />
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: localProfileImage || "default_image_url" }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userFullName}</Text>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Select Profile Picture</Text>
          </TouchableOpacity>
        </View>
      </View>
      {uploading && ( 
        <View style={styles.uploadingContainer}>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                }) }
              ]}
            />
          </View>
          <Text style={styles.uploadingText}>{Math.round(progress)}%</Text>
        </View>
      )}
      <View style={styles.hr} />
      <View style={styles.accountDetails}>
        <Text style={styles.sectionTitle}>MY ACCOUNT</Text>
        <View style={styles.userIdContainer}>
          <Text style={styles.userId}>ID: {userId}</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyIcon}>
            <Feather name="copy" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => navigation.navigate("ManageAccount")}
        >
          <Text style={styles.manageButtonText}>Manage Account</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#ddd",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 20,
  },
  accountDetails: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  userIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  userId: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  copyIcon: {
    marginLeft: 10,
  },
  manageButton: {
    backgroundColor: "#28a745",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  manageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "gray",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadingContainer: {
    marginBottom: 20,
    backgroundColor: "#007bff",
    borderRadius: 10,
    padding: 15,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#4caf50",
    borderRadius: 5,
  },
  uploadingText: {
    marginTop: 5,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default Account;
