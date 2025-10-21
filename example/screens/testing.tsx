import { useEffect, useRef, useState } from "react";
import {
  Button,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";

import DataWedgeIntents from "@pqthanh/expo-datawedge";

export const PROFILE_NAME = "ExpoZebraScannerExample";
export default function TestingScreen() {
  const [ean8checked, setEan8Checked] = useState(true);
  const [ean13checked, setEan13Checked] = useState(true);
  const [code39checked, setCode39Checked] = useState(true);
  const [code128checked, setCode128Checked] = useState(true);
  const [lastApiVisible, _setLastApiVisible] = useState(false);
  const [lastApiText, setLastApiText] = useState("Messages from DataWedge will go here");
  const [checkBoxesDisabled, setCheckBoxesDisabled] = useState(true);
  const [scanButtonVisible, setScanButtonVisible] = useState(false);
  const [dwVersionText, setDwVersionText] = useState(
    "Pre 6.3.  Please create and configure profile manually.  See the ReadMe for more details"
  );
  const [dwVersionTextStyle, setDwVersionTextStyle] = useState<any>();
  // styles.itemTextAttention
  const [activeProfileText, setActiveProfileText] = useState("Requires DataWedge 6.3+");
  const [enumeratedScannersText, setEnumeratedScannersText] = useState("Requires DataWedge 6.3+");
  const [scans, setScans] = useState<any[]>([]);
  const sendCommandResult = useRef("false");

  useEffect(() => {
    const deviceEmitterSubscription = DataWedgeIntents.addListener("onReceive", broadcastReceiver);
    DataWedgeIntents.registerBroadcastReceiver(
      ["com.zebra.reactnativedemo.ACTION", "com.symbol.datawedge.api.RESULT_ACTION"],
      ["android.intent.category.DEFAULT"]
    );
    return () => {
      deviceEmitterSubscription.remove();
    };
  }, []);
  const sendCommand = (extraName: string, extraValue: any) => {
    console.log("Sending Command: " + extraName + ", " + JSON.stringify(extraValue));
    const broadcastExtras: Record<string, any> = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras["SEND_RESULT"] = sendCommandResult.current;
    DataWedgeIntents.sendBroadcastWithExtras("com.symbol.datawedge.api.ACTION", broadcastExtras);
  };
  const _determineVersion = () => {
    sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
  };
  const onPressScanButton = () => {
    sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", "TOGGLE_SCANNING");
  };

  function setDecoders() {
    //  Set the new configuration
    const profileConfig = {
      PROFILE_NAME: "ZebraReactNativeDemo",
      PROFILE_ENABLED: "true",
      CONFIG_MODE: "UPDATE",
      PLUGIN_CONFIG: {
        PLUGIN_NAME: "BARCODE",
        PARAM_LIST: {
          //"current-device-id": this.selectedScannerId,
          scanner_selection: "auto",
          decoder_ean8: "" + ean8checked,
          decoder_ean13: "" + ean13checked,
          decoder_code128: "" + code128checked,
          decoder_code39: "" + code39checked,
        },
      },
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
  }

  function broadcastReceiver(intent: any) {
    //  Broadcast received
    console.log("Received Intent: " + JSON.stringify(intent));
    if (intent.hasOwnProperty("RESULT_INFO")) {
      const commandResult =
        intent.RESULT +
        " (" +
        intent.COMMAND.substring(intent.COMMAND.lastIndexOf(".") + 1, intent.COMMAND.length) +
        ")"; // + JSON.stringify(intent.RESULT_INFO);
      commandReceived(commandResult.toLowerCase());
    }

    if (intent.hasOwnProperty("com.symbol.datawedge.api.RESULT_GET_VERSION_INFO")) {
      //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX
      const versionInfo = intent["com.symbol.datawedge.api.RESULT_GET_VERSION_INFO"];
      console.log("Version Info: " + JSON.stringify(versionInfo));
      const datawedgeVersion = versionInfo["DATAWEDGE"];
      console.log("Datawedge version: " + datawedgeVersion);

      //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
      if (datawedgeVersion >= "06.3") datawedge63();
      if (datawedgeVersion >= "06.4") datawedge64();
      if (datawedgeVersion >= "06.5") datawedge65();

      // setState(this.state);
    } else if (intent.hasOwnProperty("com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS")) {
      //  Return from our request to enumerate the available scanners
      const enumeratedScannersObj = intent["com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS"];
      enumerateScanners(enumeratedScannersObj);
    } else if (intent.hasOwnProperty("com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE")) {
      //  Return from our request to obtain the active profile
      const activeProfileObj = intent["com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE"];
      setActiveProfileText(activeProfileObj);
    } else if (!intent.hasOwnProperty("RESULT_INFO")) {
      //  A barcode has been scanned
      barcodeScanned(intent, new Date().toLocaleString());
    }
  }

  function datawedge63() {
    console.log("Datawedge 6.3 APIs are available");
    //  Create a profile for our application
    sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "ZebraReactNativeDemo");

    setDwVersionText("6.3.  Please configure profile manually.  See ReadMe for more details.");

    //  Although we created the profile we can only configure it with DW 6.4.
    sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

    //  Enumerate the available scanners on the device
    sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

    //  Functionality of the scan button is available
    setScanButtonVisible(true);
  }

  function datawedge64() {
    console.log("Datawedge 6.4 APIs are available");

    //  Documentation states the ability to set a profile config is only available from DW 6.4.
    //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
    setDwVersionText("6.4.");

    setDwVersionTextStyle({});
    //document.getElementById('info_datawedgeVersion').classList.remove("attention");

    //  Decoders are now available
    setCheckBoxesDisabled(false);

    //  Configure the created profile (associated app and keyboard plugin)
    const profileConfig = {
      PROFILE_NAME: "ZebraReactNativeDemo",
      PROFILE_ENABLED: "true",
      CONFIG_MODE: "UPDATE",
      PLUGIN_CONFIG: {
        PLUGIN_NAME: "BARCODE",
        RESET_CONFIG: "true",
        PARAM_LIST: {},
      },
      APP_LIST: [
        {
          PACKAGE_NAME: "com.datawedgereactnative.demo",
          ACTIVITY_LIST: ["*"],
        },
      ],
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

    //  Configure the created profile (intent plugin)
    const profileConfig2 = {
      PROFILE_NAME: "ZebraReactNativeDemo",
      PROFILE_ENABLED: "true",
      CONFIG_MODE: "UPDATE",
      PLUGIN_CONFIG: {
        PLUGIN_NAME: "INTENT",
        RESET_CONFIG: "true",
        PARAM_LIST: {
          intent_output_enabled: "true",
          intent_action: "com.zebra.reactnativedemo.ACTION",
          intent_delivery: "2",
        },
      },
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

    //  Give some time for the profile to settle then query its value
    setTimeout(() => {
      sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
    }, 1000);
  }

  function datawedge65() {
    console.log("Datawedge 6.5 APIs are available");

    setDwVersionText("6.5 or higher.");
    //  Instruct the API to send
    sendCommandResult.current = "true";
    setLastApiText("true");
  }

  function commandReceived(commandText: string) {
    setLastApiText(commandText);
    // this.setState(this.state);
  }

  function enumerateScanners(enumeratedScanners: any[]) {
    let humanReadableScannerList = "";
    for (let i = 0; i < enumeratedScanners.length; i++) {
      console.log(
        "Scanner found: name= " +
          enumeratedScanners[i].SCANNER_NAME +
          ", id=" +
          enumeratedScanners[i].SCANNER_INDEX +
          ", connected=" +
          enumeratedScanners[i].SCANNER_CONNECTION_STATE
      );
      humanReadableScannerList += enumeratedScanners[i].SCANNER_NAME;
      if (i < enumeratedScanners.length - 1) humanReadableScannerList += ", ";
    }
    setEnumeratedScannersText(humanReadableScannerList);
  }

  function barcodeScanned(scanData: any, timeOfScan: number | string) {
    const scannedData = scanData["com.symbol.datawedge.data_string"];
    const scannedType = scanData["com.symbol.datawedge.label_type"];
    console.log("Scan: " + scannedData);
    setScans((prevScans) => [
      {
        data: scannedData,
        decoder: scannedType,
        timeAtDecode: timeOfScan,
      },
      ...prevScans,
    ]);
  }
  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>Zebra ReactNative DataWedge Demo</Text>
      <Text>Information / Configuration</Text>
      <Text>DataWedge version:</Text>
      <Text style={dwVersionTextStyle}>{dwVersionText}</Text>
      <Text>Active Profile</Text>
      <Text>{activeProfileText}</Text>
      {lastApiVisible && <Text>Last API message</Text>}
      {lastApiVisible && <Text>{lastApiText}</Text>}
      <Text>Available scanners:</Text>
      <Text>{enumeratedScannersText}</Text>
      <View style={styles.row}>
        <Pressable
          disabled={checkBoxesDisabled}
          onPress={() => {
            setEan8Checked(!ean8checked);
            setDecoders();
          }}
        >
          <Text>{ean8checked ? "✓" : "x"}</Text>
          <Text>EAN 8</Text>
        </Pressable>
        <Pressable
          disabled={checkBoxesDisabled}
          onPress={() => {
            setEan13Checked(!ean13checked);
            setDecoders();
          }}
        >
          <Text>{ean13checked ? "✓" : "x"}</Text>
          <Text>EAN 13</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable
          disabled={checkBoxesDisabled}
          onPress={() => {
            setCode39Checked(!code39checked);
            setDecoders();
          }}
        >
          <Text>{code39checked ? "✓" : "x"}</Text>
          <Text>Code 39</Text>
        </Pressable>
        <Pressable
          disabled={checkBoxesDisabled}
          onPress={() => {
            setCode128Checked(!code128checked);
            setDecoders();
          }}
        >
          <Text>{code128checked ? "✓" : "x"}</Text>
          <Text>Code 128</Text>
        </Pressable>
      </View>
      {scanButtonVisible && <Button onPress={onPressScanButton} title="Scan" />}

      <Text>Scanned barcodes will be displayed here:</Text>

      <FlatList
        data={scans}
        // extraData={this.state}
        scrollEnabled={false}
        keyExtractor={(item) => item.timeAtDecode}
        renderItem={({ item, separators }) => (
          <TouchableHighlight
            onShowUnderlay={separators.highlight}
            onHideUnderlay={separators.unhighlight}
          >
            <View
              style={{
                backgroundColor: "#0077A0",
                margin: 10,
                borderRadius: 5,
              }}
            >
              <View style={{ flexDirection: "row", flex: 1 }}>
                <Text>{item.decoder}</Text>
                <View style={{ flex: 1 }}>
                  <Text>{item.timeAtDecode}</Text>
                </View>
              </View>
              <Text>{item.data}</Text>
            </View>
          </TouchableHighlight>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
});
