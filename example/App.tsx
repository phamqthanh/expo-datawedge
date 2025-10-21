import { StatusBar, View } from "react-native";
import TestingScreen from "./screens/testing";
import "./utils/json";

export default function App() {
  return (
    <View style={{ paddingTop: 40, flex: 1, backgroundColor: "white" }}>
      <TestingScreen />
      <StatusBar barStyle={"dark-content"} />
    </View>
  );
}
