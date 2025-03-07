import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Toast from "react-native-toast-message";
import React from "react";
import { deleteChat } from "../../api/endpoint";

const UserInfo = ({ route, navigation }) => {
  const { user, currentUser, projectId } = route.params;

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="user-x" size={64} color="black" />
        <Text style={styles.noUserText}>No user information available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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
      "Are you sure you want to delete this chat? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: handleDeleteChat, style: "destructive" },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteChat = async () => {
    try {
      await deleteChat(currentUser, user.id);
      Toast.show({
        type: "success",
        text1: "Chat Deleted",
        text2: "The chat has been successfully deleted.",
        visibilityTime: 2000,
        autoHide: true,
        position: "top",
      });
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

  function filterUserRole(user) {
    const userRoles = user.roles
      .filter((role) => role.projectId === projectId)
      .map((role) => `${role.role.roleName}: ${role.role.description}`)
      .join("\n");

    return userRoles;
  }

  function filterIconUserRoles(user) {
    const iconUserRoles = user.roles
      .filter((role) => role.projectId === projectId)
      .map((role) => role.role.roleName)
      .join("\n");

    if (iconUserRoles === "Product Owner") {
      return "crown";
    } else if (iconUserRoles === "Scrum Master") {
      return "user-cog";
    } else {
      return "code";
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.profileImageContainer}>
          <Image
            source={
              user.profileImage
                ? { uri: user.profileImage }
                : require("../../../assets/defaultProfile.jpg")
            }
            style={styles.profilePicture}
          />
        </View>
        <Text style={styles.username}>{user.fullname}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>User Information</Text>

          <InfoItem title="Username" content={user.fullname} icon="user" />

          <InfoItem
            title="ID"
            content={user.id}
            icon="hashtag"
            rightElement={
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyToClipboard}
              >
                <Feather name="copy" size={18} color="#007bff" />
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            }
          />

          {user.roles && user.roles.length > 0 && (
            <InfoItem
              title="Role"
              content={filterUserRole(user)}
              icon={filterIconUserRoles(user)}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={confirmDeleteChat}
        >
          <Feather name="trash-2" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete Chat</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </View>
  );
};

const InfoItem = ({ title, content, icon, rightElement }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoHeader}>
      {icon && (
        <FontAwesome5
          name={icon}
          size={16}
          color="#666"
          style={styles.infoIcon}
        />
      )}
      <Text style={styles.infoTitle}>{title}</Text>
    </View>
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
  emptyContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 30,
  },
  backIcon: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  profileImageContainer: {
    padding: 4,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
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
    flex: 1,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  copyText: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#ff0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  noUserText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserInfo;
