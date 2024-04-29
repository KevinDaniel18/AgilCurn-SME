import React from "react";
import { View, Button } from "react-native";

const SettingsScreen = () => {
  const handleLogout = () => {
   alert("Going to login")
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Salir" onPress={handleLogout} />
    </View>
  );
};

export default SettingsScreen;
