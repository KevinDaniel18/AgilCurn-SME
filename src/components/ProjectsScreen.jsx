import React from "react";
import { View, Text, Button } from "react-native";

const ProjectsScreen = ({ /*navigation*/ }) => {
  return (
    <View>
      <Text>No projects yet.</Text>
      <Button
        title="Create Projects"
        onPress={() => {/*navigation.navigate("CreateProjects")*/}}
      />
    </View>
  );
};

export default ProjectsScreen;
