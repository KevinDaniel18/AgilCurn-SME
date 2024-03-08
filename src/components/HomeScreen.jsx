import React from "react";
import { View, Text} from "react-native";
import { useProject } from "./StoreProjects/ProjectContext";

const HomeScreen = () => {
  const { projects } = useProject();

  return (
    <View>
      <Text>Projects:</Text>
      {projects.map((project, index) => (
        <View key={index}>
          <Text>{project.projectName}</Text>
          <Text>{project.endDate.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
};

export default HomeScreen;
