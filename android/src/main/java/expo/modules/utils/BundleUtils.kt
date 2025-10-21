package expo.modules.utils

import android.os.Bundle
import android.os.Parcelable
import android.util.Log
import java.lang.StringBuilder

private const val TAG = "BundleUtils"
/**
 * Dump funnction for Android Bundle that handles nested Bundles.
 * @param bundle Bundle need to be dumped.
 * @param indent String indent for pretty print.
 * @return String containing the entire content of the Bundle.
 */
fun dumpBundle(bundle: Bundle?, indent: String = ""): String {
  if (bundle == null) return "$indent(null)"
  val sb = StringBuilder()
  val nextIndent = "$indent  "

  sb.appendLine("$indent{")

  val keys = bundle.keySet()

  if (keys.isEmpty()) {
    sb.appendLine("$nextIndent(Empty Bundle)")
  }

  for (key in keys) {
    val value =
            try {
              bundle.get(key)
            } catch (e: Exception) {
              Log.e(TAG, "Error getting value for key $key: ${e.message}")
              "*** Error retrieving value ***"
            }

    when (value) {
      is Bundle -> {
        sb.appendLine("$nextIndent$key (Bundle):")
        sb.append(dumpBundle(value, nextIndent + "  "))
      }
      is Array<*> -> {
        sb.appendLine("$nextIndent$key (${value.javaClass.simpleName}): [")
        value.forEachIndexed { index, item ->
          if (item is Bundle) {
            sb.appendLine("$nextIndent  [$index] (Bundle):")
            sb.append(dumpBundle(item, nextIndent + "    "))
          } else {
            sb.appendLine("$nextIndent  [$index]: $item")
          }
        }
        sb.appendLine("$nextIndent]")
      }
      is ArrayList<*> -> {
        sb.appendLine(
                "$nextIndent$key (ArrayList<${value.firstOrNull()?.javaClass?.simpleName ?: "Any"}>): ["
        )
        value.forEachIndexed { index, item ->
          if (item is Bundle) {
            sb.appendLine("$nextIndent  [$index] (Bundle):")
            sb.append(dumpBundle(item, nextIndent + "    "))
          } else {
            sb.appendLine("$nextIndent  [$index]: $item")
          }
        }
        sb.appendLine("$nextIndent]")
      }
      is IntArray -> sb.appendLine("$nextIndent$key (IntArray): ${value.contentToString()}")
      // is StringArray -> sb.appendLine("$nextIndent$key (StringArray):
      // ${value.contentToString()}")
      is ByteArray -> sb.appendLine("$nextIndent$key (ByteArray): [Length: ${value.size}]")
      is Parcelable ->
              sb.appendLine("$nextIndent$key (${value.javaClass.simpleName} Parcelable): $value")
      else -> sb.appendLine("$nextIndent$key (${value?.javaClass?.simpleName ?: "null"}): $value")
    }
  }
  sb.appendLine("$indent}")
  return sb.toString()
}

fun toBundle(map: Map<String, Any>): Bundle {
  val bundle = Bundle()
  for ((key, value) in map) {
    when (value) {
      is Boolean -> bundle.putBoolean(key, value)
      is Int -> bundle.putInt(key, value)
      is Long -> bundle.putLong(key, value)
      is Double -> bundle.putDouble(key, value)
      is String -> bundle.putString(key, value)
      is Map<*, *> -> {
        // Nested Bundle
        bundle.putBundle(key, toBundle(value as Map<String, Any>))
      }
      is List<*> -> {
        // First check the type of the first element to determine the list type
        val first = value.firstOrNull()
        when (first) {
          is LinkedHashMap<*, *>, is Map<*, *> -> {
            // Nested Bundle List
            val bundleList = ArrayList<Bundle>()
            for (item in value) {
              val itemMap = toBundle(item as Map<String, Any>)
              bundleList.add(itemMap)
            }
            val bundleArray = bundleList.toTypedArray()
            bundle.putParcelableArray(key, bundleArray)
          }
          is String -> bundle.putStringArray(key, value.mapNotNull { it as? String }.toTypedArray())
          is Int -> bundle.putIntegerArrayList(key, ArrayList(value.mapNotNull { it as? Int }))
          else -> {
            // fallback - stringify toàn bộ list
            bundle.putStringArray(key, value.map { it.toString() }.toTypedArray())
          }
        }
      }
      else -> bundle.putString(key, value.toString())
    }
  }
  // Log.v(TAG, "Bundle item: $bundle")
  return bundle
}
