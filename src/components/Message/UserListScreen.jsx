import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { getInvitedUsers } from "../../api/endpoint";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import { EXPO_PRODUCTION_API_MESSAGE_URL, EXPO_PUBLIC_API_URL } from "@env";

const UserListScreen = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setCurrentUserId(Number(storedUserId));
    };

    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    if (projectId) {
      const fetchUsers = async () => {
        try {
          const response = await getInvitedUsers(projectId);
          const filteredUsers = response.data.filter(
            (user) => user.id !== currentUserId
          );
          setUsers(filteredUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };

      if (currentUserId !== null) {
        fetchUsers();
      }
    }
  }, [projectId, currentUserId]);

  useEffect(() => {
    const initializeSocket = async () => {
      const socket = io(EXPO_PUBLIC_API_URL, {
        query: { token: await AsyncStorage.getItem("token") },
        transports: ["websocket"],
      });

      socket.on("userStatus", ({ id, status }) => {
        setOnlineUsers((prev) => {
          const newOnlineUsers = new Set(prev);
          if (status === "online") {
            newOnlineUsers.add(id);
          } else {
            newOnlineUsers.delete(id);
          }
          return newOnlineUsers;
        });
      });

      return () => {
        socket.disconnect();
      };
    };
    initializeSocket();
  }, []);

  const handleSelectUser = (user) => {
    navigation.navigate("MessageScreen", {
      selectedUser: user,
      currentUser: currentUserId,
    });
  };

  return (
    <View style={styles.container}>
      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => handleSelectUser(item)}
                style={styles.userItem}
              >
                {item.profileImage ? (
                  <Image
                    source={{ uri: item.profileImage || "default_image_url" }}
                    style={styles.profileImage}
                    onError={(e) =>
                      console.log("Image load error:", e.nativeEvent.error)
                    }
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={28}
                    color="black"
                    style={{ marginRight: 20 }}
                  />
                )}
                <Text style={styles.userName}>{item.fullname}</Text>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: onlineUsers.has(item.id)
                        ? "green"
                        : "gray",
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          }}
          style={styles.userList}
        />
      ) : (
        <Text style={styles.textStyle}>
          There are no users in this project yet. Invite one first
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },
  textStyle: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  userList: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  userName: {
    fontSize: 16,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
});

export default UserListScreen;
