import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigation = useNavigation();

  async function registerForPushNotificationsAsync() {
    let token = null;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token");
        return null;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data;

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    } else {
      alert("Must use a physical device for Push Notifications");
    }

    return token;
  }

  const handleNotificationResponse = (data) => {
    if (!data?.type) return;

    switch (data.type) {
      case "message":
        if (data.senderId && data.senderName) {
          const user = {
            id: data.senderId,
            fullname: data.senderName,
          };

          navigation.navigate("MessageScreen", {
            selectedUser: user,
          });
        }
        break;

      case "report":
        if (
          data.projectId &&
          data.projectName &&
          data.startDate &&
          data.endDate
        ) {
          navigation.navigate("ReportScreen", {
            projectId: data.projectId,
            projectName: data.projectName,
            startDate: data.startDate,
            endDate: data.endDate,
          });
        }
        break;

      default:
        console.log("Tipo de notificación no manejado:", data.type);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
        const data = response.notification.request.content.data;
        handleNotificationResponse(data);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
