import { NativeModule, requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";
import {
  ACTION_ENUMERATESCANNERS,
  ACTION_RESETDEFAULTPROFILE,
  ACTION_SCANNERINPUTPLUGIN,
  ACTION_SETDEFAULTPROFILE,
  ACTION_SOFTSCANTRIGGER,
  ACTION_SWITCHTOPROFILE,
  DISABLE_PLUGIN,
  ENABLE_PLUGIN,
  START_SCANNING,
  STOP_SCANNING,
  TOGGLE_SCANNING,
} from "./datawedge-module.types";

import { type DataWedgeModuleEvents } from "./datawedge-module.types";

// import { type DataWedgeModuleEvents } from './datawedge.types';
declare class DataWedgeModule extends NativeModule<DataWedgeModuleEvents> {
  /**
   * @deprecated Specifying the DataWedge API constants in this module is deprecated.  It is not feasible to stay current with the DW API
   **/
  ACTION_SOFTSCANTRIGGER: ACTION_SOFTSCANTRIGGER;
  /**
   * @deprecated Specifying the DataWedge API constants in this module is deprecated.  It is not feasible to stay current with the DW API
   **/
  ACTION_SCANNERINPUTPLUGIN: ACTION_SCANNERINPUTPLUGIN;
  /**
   * @deprecated Specifying the DataWedge API constants in this module is deprecated.  It is not feasible to stay current with the DW API
   **/
  ACTION_ENUMERATESCANNERS: ACTION_ENUMERATESCANNERS;
  /**
   * @deprecated Specifying the DataWedge API constants in this module is deprecated.  It is not feasible to stay current with the DW API
   **/
  ACTION_SETDEFAULTPROFILE: ACTION_SETDEFAULTPROFILE;
  /**
   * @deprecated Specifying the DataWedge API constants in this module is deprecated.  It is not feasible to stay current with the DW API
   **/
  ACTION_RESETDEFAULTPROFILE: ACTION_RESETDEFAULTPROFILE;
  /**
   * @deprecated Specifying the DataWedge API constants in this module is deprecated.  It is not feasible to stay current with the DW API
   **/
  ACTION_SWITCHTOPROFILE: ACTION_SWITCHTOPROFILE;
  START_SCANNING: START_SCANNING;
  STOP_SCANNING: STOP_SCANNING;
  TOGGLE_SCANNING: TOGGLE_SCANNING;
  ENABLE_PLUGIN: ENABLE_PLUGIN;
  DISABLE_PLUGIN: DISABLE_PLUGIN;

  sendIntent(action: string, parameterValue: any): void;
  sendBroadcastWithExtras(action: string, extrasObject: Record<string, any>): void;
  registerBroadcastReceiver(actions: string[], categories: string[] | null): void;
  iScannerSupported(): boolean;
  // registerReceiver(action: any, category: any): void;
}

let RNDataWedgeModule: DataWedgeModule;
if (Platform.OS === "android") {
  RNDataWedgeModule = requireNativeModule<DataWedgeModule>("DataWedge");
} else {
  RNDataWedgeModule = Object.assign(new NativeModule<DataWedgeModuleEvents>(), {
    ACTION_SOFTSCANTRIGGER: "" as ACTION_SOFTSCANTRIGGER,
    ACTION_SCANNERINPUTPLUGIN: "" as ACTION_SCANNERINPUTPLUGIN,
    ACTION_ENUMERATESCANNERS: "" as ACTION_ENUMERATESCANNERS,
    ACTION_SETDEFAULTPROFILE: "" as ACTION_SETDEFAULTPROFILE,
    ACTION_RESETDEFAULTPROFILE: "" as ACTION_RESETDEFAULTPROFILE,
    ACTION_SWITCHTOPROFILE: "" as ACTION_SWITCHTOPROFILE,
    START_SCANNING: "" as START_SCANNING,
    STOP_SCANNING: "" as STOP_SCANNING,
    TOGGLE_SCANNING: "" as TOGGLE_SCANNING,
    ENABLE_PLUGIN: "" as ENABLE_PLUGIN,
    DISABLE_PLUGIN: "" as DISABLE_PLUGIN,
    sendIntent: () => {},
    sendBroadcastWithExtras: () => {},
    registerBroadcastReceiver: () => {},
    iScannerSupported: () => false,
  });
}

// This call loads the native module object from the JSI.
// export default requireNativeModule<DataWedgeModule>('Datawedge');
export default RNDataWedgeModule;
