# @pqthanh/expo-datawedge (DataWedge Expo Module)

## 🎯 Overview

This is an Expo Module (using the Expo Modules SDK in Kotlin) designed to facilitate two-way communication with the Zebra Technologies _DataWedge Intents API_ on Android devices.

It allows your React Native/Expo application to send commands to DataWedge (e.g., Soft Scan Trigger, Profile Configuration) and receive the resulting barcode scan data or API responses back via Android Broadcast Intents.

_Platform Compatibility:_ This module is strictly for Android devices running Zebra DataWedge.

## ✨ Features

- _Send API Commands:_ Easily send any DataWedge API command using the `sendBroadcastWithExtras` method, including complex configuration objects (e.g., `SET_CONFIG`).

- _Real-time Scan Data:_ Listen for barcode scan data broadcasted by DataWedge profiles.

- _API Result Reception:_ Receive responses from critical DataWedge API calls (e.g., `ENUMERATE_SCANNERS`, configuration status).

- _Backward Compatibility:_ Includes support for both the new V2 broadcast format and the older V1 (deprecated) format.

- _Kotlin & Expo SDK:_ Built with modern Kotlin on the robust Expo Modules SDK for enhanced stability and modern Android API compliance (including Android 13+ broadcast restrictions).

## 🚀 Installation

This module requires a custom build of your Expo application.

1. _Install the package:_

```sh
npm install @pqthanh/expo-datawedge
# or
yarn add @pqthanh/expo-datawedge
# or
pnpm add @pqthanh/expo-datawedge
```

2. _Rebuild your application:_
   Since this is a native module, you must use `expo prebuild` or run the development build.

```sh
npx expo run:android
```

## 💻 Basic Usage (JavaScript/TypeScript)

The module exposes three main events for listening to DataWedge broadcasts.

```tsx
import DataWedgeIntents from "@pqthanh/expo-datawedge";

// 1. Register the receiver in Native code (Crucial Step)
// This should match the Action/Category set in your DataWedge Profile settings.
// Example: Register to listen for the Action 'com.myapp.ACTION'
if (Platform.OS === "android") {
  DataWedgeIntents.registerBroadcastReceiver(
    ["com.myapp.ACTION"],
    ["android.intent.category.DEFAULT"]
  );
}

// 2. Subscribe to the event
const subscription = DataWedgeIntents.addListener(
  "onReceive", // Use this for V2 API results and scan data
  (intent) => {
    console.log("DataWedge Intent Received:", intent);

    // Example: Extract scan data from the intent extras
    const scanData = intent["com.symbol.datawedge.data_string"];
    const labelType = intent["com.symbol.datawedge.label_type"];

    if (scanData) {
      console.log(`Scanned Data: ${scanData} (${labelType})`);
    }
  }
);

// Don't forget to unsubscribe when the component unmounts
// return () => subscription.remove();

// 3. Send a command to DataWedge (e.g., Soft Trigger Start)
const SOFT_TRIGGER_START = "com.symbol.datawedge.api.SOFT_SCAN_TRIGGER";
const ACTION_TOGGLE = "START_SCANNING";

DataWedgeIntents.sendBroadcastWithExtras(SOFT_TRIGGER_START, {
  "com.symbol.datawedge.api.SOFT_SCAN_TRIGGER": ACTION_TOGGLE,
});
```
