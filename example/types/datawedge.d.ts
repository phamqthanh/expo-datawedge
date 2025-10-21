declare module "react-native-datawedge-intents" {
  namespace DataWedgeIntents {
    //  THESE ACTIONS ARE DEPRECATED, PLEASE SPECIFY THE ACTION AS PART OF THE CALL TO sendBroadcastWithExtras
    const ACTION_SOFTSCANTRIGGER = "com.symbol.datawedge.api.ACTION_SOFTSCANTRIGGER";
    const ACTION_SCANNERINPUTPLUGIN = "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN";
    const ACTION_ENUMERATESCANNERS = "com.symbol.datawedge.api.ACTION_ENUMERATESCANNERS";
    const ACTION_SETDEFAULTPROFILE = "com.symbol.datawedge.api.ACTION_SETDEFAULTPROFILE";
    const ACTION_RESETDEFAULTPROFILE = "com.symbol.datawedge.api.ACTION_RESETDEFAULTPROFILE";
    const ACTION_SWITCHTOPROFILE = "com.symbol.datawedge.api.ACTION_SWITCHTOPROFILE";
    const EXTRA_PARAMETER = "com.symbol.datawedge.api.EXTRA_PARAMETER";
    const EXTRA_PROFILENAME = "com.symbol.datawedge.api.EXTRA_PROFILENAME";
    //  Intent extra parameters
    const START_SCANNING = "START_SCANNING";
    const STOP_SCANNING = "STOP_SCANNING";
    const TOGGLE_SCANNING = "TOGGLE_SCANNING";
    const ENABLE_PLUGIN = "ENABLE_PLUGIN";
    const DISABLE_PLUGIN = "DISABLE_PLUGIN";
    //  Enumerated Scanner receiver
    const ACTION_ENUMERATEDLISET = "com.symbol.datawedge.api.ACTION_ENUMERATEDSCANNERLIST";
    const KEY_ENUMERATEDSCANNERLIST = "DWAPI_KEY_ENUMERATEDSCANNERLIST";
    //  END DEPRECATED PROPERTIES

    //  Scan data receiver - These strings are only used by registerReceiver, a deprecated method
    const RECEIVED_SCAN_SOURCE = "com.symbol.datawedge.source";
    const RECEIVED_SCAN_DATA = "com.symbol.datawedge.data_string";
    const RECEIVED_SCAN_TYPE = "com.symbol.datawedge.label_type";
    function registerReceiver(action: string, category: string): void;
    function sendIntent(
      action:
        | DataWedgeIntents.ACTION_SOFTSCANTRIGGER
        | DataWedgeIntents.ACTION_SCANNERINPUTPLUGIN
        | DataWedgeIntents.ACTION_ENUMERATESCANNERS
        | DataWedgeIntents.ACTION_SETDEFAULTPROFILE
        | DataWedgeIntents.ACTION_RESETDEFAULTPROFILE
        | DataWedgeIntents.ACTION_SWITCHTOPROFILE
        | DataWedgeIntents.START_SCANNING
        | DataWedgeIntents.STOP_SCANNING
        | DataWedgeIntents.TOGGLE_SCANNING
        | DataWedgeIntents.ENABLE_PLUGIN
        | DataWedgeIntents.DISABLE_PLUGIN,
      extra?:
        | DataWedgeIntents.ACTION_SOFTSCANTRIGGER
        | DataWedgeIntents.ACTION_SCANNERINPUTPLUGIN
        | DataWedgeIntents.ACTION_ENUMERATESCANNERS
        | DataWedgeIntents.ACTION_SETDEFAULTPROFILE
        | DataWedgeIntents.ACTION_RESETDEFAULTPROFILE
        | DataWedgeIntents.ACTION_SWITCHTOPROFILE
        | DataWedgeIntents.START_SCANNING
        | DataWedgeIntents.STOP_SCANNING
        | DataWedgeIntents.TOGGLE_SCANNING
        | DataWedgeIntents.ENABLE_PLUGIN
        | DataWedgeIntents.DISABLE_PLUGIN
    ): void;
    function registerBroadcastReceiver(options: {
      filterActions?: string[];
      filterCategories: string[];
    }): void;
    function sendBroadcastWithExtras(options: {
      action: string;
      extras: { [key: string]: any };
    }): void;
  }
  export default DataWedgeIntents;
  export type Test = number;
}
