import { View, StyleSheet } from "react-native";
import ProjectNavigation from "./src/components/Navigation/ProjectNavigation";
import { ProjectProvider } from "./src/components/StoreProjects/ProjectContext";
import Header from "./src/components/Header";
//import HeaderNavigation from "./src/components/Navigation/HeaderNavigation";

export default function App() {
  return (
    <ProjectProvider>
      <View style={styles.container}>
        <Header/>
        <ProjectNavigation />
      </View>
    </ProjectProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
