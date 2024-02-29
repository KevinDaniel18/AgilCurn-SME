import Header from "./src/components/Header";
import { View, StyleSheet } from "react-native";
import ProjectNavigation from "./src/components/Navigation/ProjectNavigation";
export default function App() {
  return (
    <View style={styles.container}>
      <Header />
      <ProjectNavigation/>
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
