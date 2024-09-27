import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import React from "react";
import { deleteChat } from "../../api/endpoint";

const UserInfo = ({ route, navigation }) => {
  const { user, currentUser } = route.params;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user information available</Text>
      </View>
    );
  }

  const copyToClipboard = async () => {
    if (user !== null) {
      await Clipboard.setStringAsync(String(user.id));
      Toast.show({
        type: "success",
        text1: "ID Copied",
        text2: "The ID has been copied to clipboard!",
        autoHide: true,
        position: "top",
      });
    }
  };

  const confirmDeleteChat = () => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: handleDeleteChat },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteChat = async () => {
    try {
      await deleteChat(currentUser, user.id);
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting chat:", error);
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: "Failed to delete the chat. Please try again.",
        autoHide: true,
        position: "top",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: user.profileImage || "https://via.placeholder.com/150",
        }}
        style={styles.profilePicture}
      />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.id}>ID: {user.id}</Text>
      <TouchableOpacity onPress={copyToClipboard}>
        <Feather name="copy" size={24} color="#007bff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteChat}>
        <Text style={styles.deleteButtonText}>Delete Chat</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  id: {
    fontSize: 18,
    color: "#666",
  },
  deleteButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FF4D4D",
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});

export default UserInfo;
