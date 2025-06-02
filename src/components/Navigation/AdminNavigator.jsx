import { createStackNavigator } from "@react-navigation/stack";
import AdminPanelScreen from "../Screens/AdminPanelScreen";

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
    </Stack.Navigator>
  );
}
