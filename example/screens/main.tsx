import ExpoDatawedgeType, { useBatteryLevel } from "@pqthanh/expo-datawedge";
import { requireNativeModule } from "expo";
import { useEffect } from "react";
import { Button, DeviceEventEmitter, ScrollView, Text, View } from "react-native";

const ExpoDatawedge = requireNativeModule<typeof ExpoDatawedgeType>("ExpoDatawedge");

export default function MainScreen() {
  const batteryLevel = useBatteryLevel();
  // const onChangePayload = useEvent(ExpoDatawedge, "onChange");
  useEffect(() => {
    // console.stringify(ExpoDatawedge, null, 2);
    const subscription = DeviceEventEmitter.addListener("datawedge_broadcast_intent", (event) => {
      console.stringify(event, null, 2);
    });
    const enumeratedScannersSubscription = ExpoDatawedge.addListener(
      "enumerated_scanners",
      console.log
    );
    ExpoDatawedge.registerBroadcastReceiver(
      // ["com.zebra.reactnativedemo.ACTION", "com.symbol.datawedge.api.RESULT_ACTION"],
      ["com.symbol.datawedge.DWDEMO", "com.symbol.datawedge.api.RESULT_ACTION"],
      ["android.intent.category.DEFAULT"]
    );

    return () => {
      enumeratedScannersSubscription.remove();
      subscription.remove();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Module API Example</Text>
      <Group name="Battery">
        <Text>Current Battery Level: {batteryLevel}</Text>
      </Group>
      <Group name="Constants">{/* <Text>{ExpoDatawedge.PI}</Text> */}</Group>
      <Group name="Functions">{/* <Text>{ExpoDatawedge.hello()}</Text> */}</Group>
      <Group name="ENUMS">
        <Button
          title="Send intent enum"
          onPress={async () => {
            try {
              ExpoDatawedge.sendIntent(ExpoDatawedge.ACTION_ENUMERATESCANNERS, null);
              console.log("sended");
            } catch (error) {
              console.error("error", error);
            }
          }}
        />
      </Group>
      <Group name="Actions">
        <Button
          title="Send intent action"
          onPress={async () => {
            try {
              ExpoDatawedge.sendIntent("com.symbol.datawedge.api.RESULT_ACTION", null);
              console.log("sended");
            } catch (error) {
              console.error("error", error);
            }
          }}
        />
        {/* <Text>{onChangePayload?.value}</Text> */}
      </Group>
      <Group name="Views">
        {/* <ExpoDatawedgeView
            url="https://www.example.com"
            onLoad={({ nativeEvent: { url } }) => console.log(`Loaded: ${url}`)}
            style={styles.view}
          /> */}
      </Group>
    </ScrollView>
  );
}

function Group(props: { name: string; children?: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  view: {
    flex: 1,
    height: 200,
  },
};
