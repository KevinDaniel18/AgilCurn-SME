import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  LayoutAnimation,
  Alert,
  BackHandler,
} from "react-native";
import { getInvitedUsers, leaveProjectFromAPI } from "../../api/endpoint";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Spinner } from "../Screens/ReportScreen";
import { Link, useFocusEffect } from "@react-navigation/native";
import { FontAwesome5, FontAwesome6, AntDesign } from "@expo/vector-icons";
import { useCallback } from "react";
import { useUser } from "../UserContext/UserContext";

const UserListScreen = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [users, setUsers] = useState([]);
  const [currentUserPO, setCurrentUserPO] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { userId } = useUser();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showUserOptions) {
          setShowUserOptions(false);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [showUserOptions])
  );

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getInvitedUsers(projectId);
      const filteredUsers = response.data.filter((user) => user.id !== userId);
      console.log(JSON.stringify(filteredUsers));
      setCurrentUserPO(response.data);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  };

  useEffect(() => {
    if (projectId) {
      if (userId !== null) {
        fetchUsers();
      }
    }
  }, [projectId, userId]);

  const handleSelectUser = (user) => {
    navigation.navigate("MessageScreen", {
      selectedUser: user,
      currentUser: userId,
      projectId: projectId,
    });
    setShowUserOptions(false);
  };

  const getRoleIcon = (roles, projectId) => {
    // Filter roles associated with the current projectId
    const role = roles.find((r) => r.projectId === projectId);

    if (!role) return null;

    const roleConfig = {
      1: {
        // Product Owner
        icon: <FontAwesome6 name="crown" size={20} color="#FFFFFF" />,
        label: "Product Owner",
        bgColor: "#F59E0B", // Amber
      },
      2: {
        // Scrum Master
        icon: <FontAwesome5 name="user-cog" size={18} color="#FFFFFF" />,
        label: "Scrum Master",
        bgColor: "#6366F1", // Indigo
      },
      3: {
        // Developer
        icon: <FontAwesome6 name="code" size={18} color="#FFFFFF" />,
        label: "Developer",
        bgColor: "#10B981", // Emerald
      },
    };

    return roleConfig[role.roleId] || null;
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowUserOptions(true);
  };

  async function onReject(userId) {
    try {
      await leaveProjectFromAPI(projectId, userId);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  }

  const handleEjectUser = () => {
    if (!selectedUser) return;

    Alert.alert(
      "Eject User",
      `Are you sure you want to remove ${selectedUser.fullname} from this project?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Eject",
          style: "destructive",
          onPress: () => {
            // Call the eject function passed as prop
            onReject(selectedUser.id);
            setShowUserOptions(false);
            setSelectedUser(null);
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => {
    const roleData = getRoleIcon(item.roles, projectId);
    const currentUser = currentUserPO.find((u) => u.id === userId);

    const isCurrentUserPO = currentUser?.roles?.some(
      (role) => role.projectId === projectId && role.roleId === 1
    );

    return (
      <TouchableOpacity
        onPress={() => handleSelectUser(item)}
        style={styles.userItem}
        activeOpacity={0.7}
        onLongPress={isCurrentUserPO ? () => handleUserSelect(item) : null}
      >
        <View style={styles.userInfo}>
          {item.profileImage ? (
            <Image
              source={{ uri: item.profileImage }}
              style={styles.profileImage}
              defaultSource={require("../../../assets/defaultProfile.jpg")}
              onError={(e) =>
                console.log("Image load error:", e.nativeEvent.error)
              }
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={22} color="#FFFFFF" />
            </View>
          )}

          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.fullname}</Text>
            {item.email && (
              <Text
                style={styles.userEmail}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.email}
              </Text>
            )}
          </View>
        </View>

        {roleData && (
          <View
            style={[
              styles.roleContainer,
              { backgroundColor: roleData.bgColor },
            ]}
          >
            <View style={styles.roleIconContainer}>{roleData.icon}</View>
            <Text style={styles.roleText}>{roleData.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people" size={60} color="#D1D5DB" />
      <Text style={styles.emptyText}>
        There are no users in this project yet.
      </Text>
      <Link to={{ screen: "Projects", params: { showInviteModal: true } }}>
        <View style={styles.inviteButton}>
          <Ionicons
            name="person-add"
            size={16}
            color="#FFFFFF"
            style={styles.inviteIcon}
          />
          <Text style={styles.inviteText}>Invite Team Members</Text>
        </View>
      </Link>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showUserOptions ? (
          <View style={styles.userOptionsHeader}>
            <View style={styles.selectedUserInfo}>
              <TouchableOpacity
                onPress={() => setShowUserOptions(false)}
                style={styles.backButton}
              >
                <AntDesign name="arrowleft" size={24} color="#1F2937" />
              </TouchableOpacity>

              <View style={styles.userOptionsContent}>
                <Text
                  style={styles.selectedUserName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedUser?.fullname}
                </Text>

                {selectedUser && getRoleIcon(selectedUser.roles, projectId) && (
                  <View
                    style={[
                      styles.smallRoleContainer,
                      {
                        backgroundColor: getRoleIcon(
                          selectedUser.roles,
                          projectId
                        ).bgColor,
                      },
                    ]}
                  >
                    <Text style={styles.smallRoleText}>
                      {getRoleIcon(selectedUser.roles, projectId).label}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.ejectButton}
              onPress={handleEjectUser}
            >
              <Ionicons name="exit-outline" size={18} color="#FFFFFF" />
              <Text style={styles.ejectButtonText}>Eject User</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.normalHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <AntDesign name="arrowleft" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.title}>Project Team</Text>
            <View style={{ width: 24 }} />
          </View>
        )}
      </View>

      {isLoading ? (
        <Spinner />
      ) : users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          style={styles.userList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  normalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userOptionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  selectedUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userOptionsContent: {
    marginLeft: 12,
    flex: 1,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  smallRoleContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  smallRoleText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  ejectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ejectButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  userList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#9CA3AF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleIconContainer: {
    marginRight: 6,
  },
  roleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteIcon: {
    marginRight: 8,
  },
  inviteText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserListScreen;
