
export const sendPushNotification = async (expoPushToken, title, body) => {
    
  const message = {
    to: expoPushToken, 
    sound: "default",
    title: title,
    body: body,
    data: { someData: "goes here" },
  };

  try {
  
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    const result = await res.json();
    console.log("Push notification result:", result); 
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
