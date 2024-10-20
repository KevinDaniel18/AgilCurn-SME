import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getSprints } from "../api/endpoint";
import Entypo from "@expo/vector-icons/Entypo";

const SprintSelector = ({ projectId, onSelectSprint, selectedSprintId }) => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSprints = async () => {
      setLoading(true);
      try {
        const response = await getSprints(projectId);
        setSprints(response.data);
      } catch (error) {
        console.log("Error fetching sprints", error);
      } finally {
        setLoading(false);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
    };
    if (projectId) {
      fetchSprints();
    }
  }, [projectId]);

  return (
    <View>
      {loading ? (
        <ActivityIndicator size="small" color="black" />
      ) : sprints.length === 0 ? (
        <Text style={{ textAlign: "center", marginVertical: 20 }}>
          There are no sprints available.
        </Text>
      ) : (
        <View>
          {sprints.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelectSprint(item.id)}
              style={styles.sprintSection}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ flex: 1 }}>{item.sprintName}</Text>
                {item.id === selectedSprintId && (
                  <Entypo name="check" size={15} color="green" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = {
  sprintSection: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#ffe0b2",
  },
};

export default SprintSelector;
