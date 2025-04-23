import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useProject } from "./StoreProjects/ProjectContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import moment from "moment/moment";

const ProjectSelector = ({ onSelectProject, selectProjectId }) => {
  const { projects } = useProject();
  const ongoingProjects = projects.filter((project) =>
    project ? moment().isBefore(moment(project.endDate)) : false
  );

  return (
    <View>
      {ongoingProjects.length === 0 ? (
        <Text>No projects available</Text>
      ) : (
        ongoingProjects.map(({ projectName, id }) => (
          <TouchableOpacity
            key={id}
            onPress={() => onSelectProject(id)}
            style={styles.projectItem}
          >
            <View style={{ flexDirection: "row", gap: 4 }}>
              {id === selectProjectId && (
                <AntDesign name="right" size={20} color="black" />
              )}
              <Text>{projectName}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default ProjectSelector;

const styles = {
  projectItem: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#e3f2fd",
  },
};
