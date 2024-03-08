import Header from "./src/components/Header";
import { View, StyleSheet } from "react-native";
import ProjectNavigation from "./src/components/Navigation/ProjectNavigation";
import { ProjectProvider } from "./src/components/StoreProjects/ProjectContext";
export default function App() {
  return (
    <View style={styles.container}>
      <ProjectProvider>
        <Header />
        <ProjectNavigation />
      </ProjectProvider>
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
