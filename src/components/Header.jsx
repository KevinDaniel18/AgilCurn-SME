import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function Header({ navigation }) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>AgilCurn SME</Text>
        <TouchableOpacity onPress={() => navigation.navigate("MessageScreen")}>
          <Ionicons
            name="chatbox-outline"
            size={28}
            color="black"
            style={{ marginRight: 20 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 100,
    paddingTop: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.26,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    color: "#ff9400",
    fontSize: 18,
    marginLeft: 20,
  },
});

export default Header;
