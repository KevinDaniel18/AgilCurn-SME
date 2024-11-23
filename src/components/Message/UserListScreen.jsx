import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  LayoutAnimation,
} from "react-native";
import { getInvitedUsers } from "../../api/endpoint";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Spinner } from "../Screens/ReportScreen";
import { Link } from "@react-navigation/native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const UserListScreen = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
        try {
          const response = await getInvitedUsers(projectId);
          const filteredUsers = response.data.filter(
            (user) => user.id !== currentUserId
          );
          setUsers(filteredUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setIsLoading(false);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
      };

      if (currentUserId !== null) {
        fetchUsers();
      }
    }
  }, [projectId, currentUserId]);

  const handleSelectUser = (user) => {
    navigation.navigate("MessageScreen", {
      selectedUser: user,
      currentUser: currentUserId,
      projectId: projectId,
    });
  };

  const getRoleIcon = (roles, projectId) => {
    // Filtrar los roles asociados al projectId actual
    const role = roles.find((r) => r.projectId === projectId);

    if (!role) return null;

    switch (role.roleId) {
      case 1: // Product Owner
        return <FontAwesome6 name="crown" size={24} color="black" />;
      case 2: // Scrum Master
        return <FontAwesome5 name="user-cog" size={24} color="black" />;
      case 3: // Developer
        return <FontAwesome6 name="code" size={24} color="black" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Spinner />
      ) : users.length > 0 ? (
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
                    source={
                      item.profileImage
                        ? { uri: item.profileImage }
                        : require("../../../assets/defaultProfile.jpg")
                    }
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

                {getRoleIcon(item.roles, projectId) && (
                  <View style={styles.roleIcon}>
                    {getRoleIcon(item.roles, projectId)}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          style={styles.userList}
        />
      ) : (
        <Text style={styles.textStyle}>
          There are no users in this project yet.{" "}
          <Link to={{ screen: "Projects", params: { showInviteModal: true } }}>
            <Text style={{ color: "blue", textDecorationLine: "underline" }}>
              Invite one first
            </Text>
          </Link>
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
    position: "relative",
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
  roleIcon: {
    position: "absolute",
    right: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
});

export default UserListScreen;
