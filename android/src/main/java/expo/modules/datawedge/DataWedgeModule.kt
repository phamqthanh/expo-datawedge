package expo.modules.datawedge

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Bundle
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.utils.toBundle
import java.lang.ref.WeakReference

class DataWedgeModule : Module() {
  companion object {
    internal const val ON_RECEIVE = "onReceive"

    private const val TAG = "DataWedgeModule"

    private const val EXTRA_GET_VERSION_INFO = "com.symbol.datawedge.api.GET_VERSION_INFO"

    private const val EXTRA_EMPTY = ""

    // DEPRECATED ACTIONS (exported for backward compatibility)
    private const val ACTION_SOFTSCANTRIGGER = "com.symbol.datawedge.api.ACTION_SOFTSCANTRIGGER"
    private const val ACTION_SCANNERINPUTPLUGIN =
            "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN"
    private const val ACTION_ENUMERATESCANNERS = "com.symbol.datawedge.api.ACTION_ENUMERATESCANNERS"
    private const val ACTION_SETDEFAULTPROFILE = "com.symbol.datawedge.api.ACTION_SETDEFAULTPROFILE"
    private const val ACTION_RESETDEFAULTPROFILE =
            "com.symbol.datawedge.api.ACTION_RESETDEFAULTPROFILE"
    private const val ACTION_SWITCHTOPROFILE = "com.symbol.datawedge.api.ACTION_SWITCHTOPROFILE"
    private const val EXTRA_PARAMETER = "com.symbol.datawedge.api.EXTRA_PARAMETER"
    private const val EXTRA_PROFILENAME = "com.symbol.datawedge.api.EXTRA_PROFILENAME"

    private const val START_SCANNING = "START_SCANNING"
    private const val STOP_SCANNING = "STOP_SCANNING"
    private const val TOGGLE_SCANNING = "TOGGLE_SCANNING"
    private const val ENABLE_PLUGIN = "ENABLE_PLUGIN"
    private const val DISABLE_PLUGIN = "DISABLE_PLUGIN"

    // Enumerated Scanner receiver
    private const val ACTION_ENUMERATEDLISET =
            "com.symbol.datawedge.api.ACTION_ENUMERATEDSCANNERLIST"
    private const val KEY_ENUMERATEDSCANNERLIST = "DWAPI_KEY_ENUMERATEDSCANNERLIST"
    // DataWedge Actions
    private const val ACTION_DATAWEDGE = "com.symbol.datawedge.api.ACTION"
    private const val ACTION_RESULT_NOTIFICATION = "com.symbol.datawedge.api.NOTIFICATION_ACTION"
    private const val ACTION_RESULT = "com.symbol.datawedge.api.RESULT_ACTION"

    // Scan data receiver - DEPRECATED fields
    private const val RECEIVED_SCAN_SOURCE = "com.symbol.datawedge.source"
    private const val RECEIVED_SCAN_DATA = "com.symbol.datawedge.data_string"
    private const val RECEIVED_SCAN_TYPE = "com.symbol.datawedge.label_type"
  }
  private val reactContext: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React Context is null")
  private var registeredAction: String? = null
  private var registeredCategory: String? = null

  private val genericReceiver =
          object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
              Log.v(TAG, "Received Broadcast from DataWedge (Generic)")
              processIntent(intent)
            }
          }

  private fun registerBroadcastReceiver(
          filterActions: List<String>,
          filterCategories: List<String>?
  ) {
    unregisterReceiver(genericReceiver)
    val filter = IntentFilter()

    filterActions.forEach { filter.addAction(it) }
    if (!filterCategories.isNullOrEmpty()) {
      filterCategories.forEach { filter.addCategory(it) }
    }
    Log.d(TAG, "Registering BroadcastReceiver with filter: $filter")
    safeRegisterReceiver(genericReceiver, filter)
  }

  private fun processIntent(intent: Intent?) {
    if (intent == null) return

    val weakModule = WeakReference(this@DataWedgeModule)
    val emitEvent = { name: String, body: Bundle ->
      try {
        // It may thrown, because RN event emitter may not be available
        // we can just ignore those cases
        weakModule.get()?.sendEvent(name, body)
      } catch (_: Throwable) {}
      Unit
    }

    // V2 API (Generic Receiver)
    Log.d(TAG, "Processing V2 API Intent ${intent.action}")
    val intentBundle = intent.extras ?: return

    val cleanBundle = Bundle(intentBundle)
    cleanBundle
            .keySet()
            .filter { key ->
              val extraValue = cleanBundle.get(key)
              extraValue is ByteArray || extraValue is ArrayList<*>
            }
            .forEach { cleanBundle.remove(it) }

    emitEvent(ON_RECEIVE, cleanBundle)
  }
  private fun sendIntent(action: String, parameterValue: String?) {
    // THIS METHOD IS DEPRECATED, use SendBroadcastWithExtras
    Log.v(TAG, "Sending Intent with action: " + action + ", parameter: [" + parameterValue + "]")
    // Some DW API calls use a different paramter name, abstract this from the
    // caller.
    val parameterKey =
            when (action) {
              ACTION_SETDEFAULTPROFILE, ACTION_RESETDEFAULTPROFILE, ACTION_SWITCHTOPROFILE ->
                      EXTRA_PROFILENAME
              else -> EXTRA_PARAMETER
            }
    val dwIntent = Intent(parameterKey)
    if (!parameterValue.isNullOrEmpty()) {
      dwIntent.putExtra(parameterKey, parameterValue)
    }
    reactContext.sendBroadcast(dwIntent)
  }
  private fun sendBroadcastWithExtras(action: String, extras: Map<String, Any>) {
    val i = Intent(action)
    i.putExtras(toBundle(extras))
    reactContext.sendBroadcast(i)
  }

  private fun safeRegisterReceiver(receiver: BroadcastReceiver, filter: IntentFilter) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        reactContext.registerReceiver(receiver, filter, null, null, Context.RECEIVER_EXPORTED)
      } else {
        reactContext.registerReceiver(receiver, filter, null, null)
      }
    } catch (e: Exception) {}
  }
  private fun unregisterReceiver(receiver: BroadcastReceiver) {
    try {
      reactContext.unregisterReceiver(receiver)
    } catch (e: Exception) {
      // Expected behaviour if there was not a previously registered receiver.
    }
  }
  private fun unregisterReceivers() {
    unregisterReceiver(genericReceiver)
  }

  override fun definition() = ModuleDefinition {
    Name("DataWedge")

    // Defines constant property on the module.
    Constant("ACTION_SOFTSCANTRIGGER") { ACTION_SOFTSCANTRIGGER }
    Constant("ACTION_SCANNERINPUTPLUGIN") { ACTION_SCANNERINPUTPLUGIN }
    Constant("ACTION_ENUMERATESCANNERS") { ACTION_ENUMERATESCANNERS }
    Constant("ACTION_SETDEFAULTPROFILE") { ACTION_SETDEFAULTPROFILE }
    Constant("ACTION_RESETDEFAULTPROFILE") { ACTION_RESETDEFAULTPROFILE }
    Constant("ACTION_SWITCHTOPROFILE") { ACTION_SWITCHTOPROFILE }
    Constant("START_SCANNING") { START_SCANNING }
    Constant("STOP_SCANNING") { STOP_SCANNING }
    Constant("TOGGLE_SCANNING") { TOGGLE_SCANNING }
    Constant("ENABLE_PLUGIN") { ENABLE_PLUGIN }
    Constant("DISABLE_PLUGIN") { DISABLE_PLUGIN }

    Events(ON_RECEIVE)

    OnCreate() {
      Log.v(TAG, "On Create")
      if (registeredAction !== null) {}
    }

    OnDestroy() {
      Log.v(TAG, "On Destroy")
      unregisterReceivers()
    }

    Function("registerBroadcastReceiver") {
            filterActions: List<String>,
            filterCategories: List<String>? ->
      registerBroadcastReceiver(filterActions, filterCategories)
    }
    Function("sendIntent") { action: String, parameterValue: String? ->
      sendIntent(action, parameterValue)
    }
    Function("sendBroadcastWithExtras") { action: String, extras: Map<String, Any> ->
      sendBroadcastWithExtras(action, extras)
    }
    Function<Boolean>("iScannerSupported") { ->
      val context = appContext.reactContext ?: return@Function false

      try {
        context.packageManager.getPackageInfo("com.symbol.datawedge", 0)
        true
      } catch (e: Exception) {
        Log.e(TAG, "DataWedge is not installed: ${e.message}")
        false
      }
    }
  }
}
