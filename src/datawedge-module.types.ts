export type ACTION_SOFTSCANTRIGGER = "com.symbol.datawedge.api.ACTION_SOFTSCANTRIGGER";
export type ACTION_SCANNERINPUTPLUGIN = "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN";
export type ACTION_ENUMERATESCANNERS = "com.symbol.datawedge.api.ACTION_ENUMERATESCANNERS";
export type ACTION_SETDEFAULTPROFILE = "com.symbol.datawedge.api.ACTION_SETDEFAULTPROFILE";
export type ACTION_RESETDEFAULTPROFILE = "com.symbol.datawedge.api.ACTION_RESETDEFAULTPROFILE";
export type ACTION_SWITCHTOPROFILE = "com.symbol.datawedge.api.ACTION_SWITCHTOPROFILE";
export type START_SCANNING = "START_SCANNING";
export type STOP_SCANNING = "STOP_SCANNING";
export type TOGGLE_SCANNING = "TOGGLE_SCANNING";
export type ENABLE_PLUGIN = "ENABLE_PLUGIN";
export type DISABLE_PLUGIN = "DISABLE_PLUGIN";

export type DataWedgeModuleEvents = {
  "onReceive"(event: Record<string, any>): void;
};

/**
 * ┌────────────────────────────────────────────┐
 * │  Intent Set configuration for DataWedge   │
 * └────────────────────────────────────────────┘
 */

interface PluginConfig {
  RESET_CONFIG?: "true" | "false";
}
interface BarcodePluginConfig extends PluginConfig {
  PLUGIN_NAME: "BARCODE";
  PARAM_LIST: Partial<{
    scanner_selection: "auto" | "internal" | "external";
    decoder_code128: "true" | "false";
    decoder_qr: "true" | "false";
    [key: string]: string | number | boolean;
  }>;
}
interface KeystrokePluginConfig extends PluginConfig {
  PLUGIN_NAME: "KEYSTROKE";
  PARAM_LIST: {
    keystroke_output_enabled: "true" | "false";
    [key: string]: string | number | boolean;
  };
}

export const IntentDelivery = {
  StartActivity: "0",
  StartService: "1",
  BroadCast: "2",
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type IntentDelivery = (typeof IntentDelivery)[keyof typeof IntentDelivery];
type IntentParamList = {
  intent_output_enabled: "true" | "false";
  intent_action: string;
  intent_category?: string;
  intent_delivery: IntentDelivery;
};
export interface IntentPluginConfig extends PluginConfig {
  PLUGIN_NAME: "INTENT";
  PARAM_LIST: IntentParamList;
}

export type DataWedgeSetPluginConfig =
  | BarcodePluginConfig
  | KeystrokePluginConfig
  | IntentPluginConfig;
export interface DataWedgeSetConfig {
  PROFILE_NAME: string;
  CONFIG_MODE?: "CREATE_IF_NOT_EXIST" | "OVERWRITE" | "UPDATE";
  PROFILE_ENABLED?: "true" | "false";
  PLUGIN_CONFIG?: DataWedgeSetPluginConfig;
  APP_LIST?: DataWedgeAppListItem[];
}
export type DataWedgeGetConfig = {
  PROFILE_NAME: string;
  PLUGIN_CONFIG: {
    PROCESS_PLUGIN_NAME?: {
      PLUGIN_NAME?: string;
      OUTPUT_PLUGIN_NAME?: "KEYSTROKE" | "INTENT" | "BARCODE";
    }[];
  };
};

type Value = {
  "com.symbol.datawedge.api.SET_CONFIG": DataWedgeSetConfig;
  "com.symbol.datawedge.api.GET_CONFIG": string;
  "com.symbol.datawedge.api.GET_VERSION_INFO": "";
  "com.symbol.datawedge.api.GET_ACTIVE_PROFILE": "";
  "com.symbol.datawedge.api.ENUMERATE_SCANNERS": "";
  "com.symbol.datawedge.api.SOFT_SCAN_TRIGGER":
    | "START_SCANNING"
    | "STOP_SCANNING"
    | "TOGGLE_SCANNING";
};
export type SendCommand = <K extends keyof Value | (string & {})>(
  extraName: K,
  extraValue?: K extends keyof Value ? Value[K] : any
) => void;

/**
 * Application association list for the profile
 */
export interface DataWedgeAppListItem {
  /**
   * e.g. "com.app.demo" or "*"
   */
  PACKAGE_NAME: string;
  /**
   * e.g. ["*"] or ["com.app.demo.MainActivity"]
   */
  ACTIVITY_LIST: string[];
}
