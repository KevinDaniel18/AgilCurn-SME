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
import React, { useEffect } from "react";
import { deleteChat } from "../../api/endpoint";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

const UserInfo = ({ route, navigation }) => {
  const { user, currentUser, projectId } = route.params;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>No user information available</Text>
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

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={confirmDeleteChat}>
          <SimpleLineIcons
            name="options-vertical"
            size={24}
            color="black"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, confirmDeleteChat]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            user.profileImage
              ? { uri: user.profileImage }
              : require("../../../assets/defaultProfile.jpg")
          }
          style={styles.profilePicture}
        />
        <Text style={styles.username}>{user.fullname}</Text>
      </View>

      <View style={styles.infoContainer}>
        <InfoItem title="Username" content={user.fullname} />
        <InfoItem
          title="ID"
          content={user.id}
          rightElement={
            <TouchableOpacity onPress={copyToClipboard}>
              <Feather name="copy" size={20} color="#007bff" />
            </TouchableOpacity>
          }
        />
        {user.roles.length > 0 && (
          <InfoItem
            title="Role"
            content={user.roles
              .filter((role) => role.projectId === projectId)
              .map((role) => `${role.role.roleName}: ${role.role.description}`)
              .join("\n")}
          />
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteChat}>
        <Text style={styles.deleteButtonText}>Delete Chat</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

const InfoItem = ({ title, content, rightElement }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoTitle}>{title}</Text>
    <View style={styles.infoContent}>
      <Text style={styles.infoText}>{content}</Text>
      {rightElement}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#FFC866",
    alignItems: "center",
    padding: 30,
    paddingTop: 60,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  noUserText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
});

export default UserInfo;
