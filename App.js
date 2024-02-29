import Header from "./src/components/Header";
import NavBar from "./src/components/Navigation/NavBar";
import { View, StyleSheet } from "react-native";
export default function App() {
  return (
    <View style={styles.container}>
      <Header />
      <View></View>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /*navPosition: {
    flex: 1,
  },*/
});
