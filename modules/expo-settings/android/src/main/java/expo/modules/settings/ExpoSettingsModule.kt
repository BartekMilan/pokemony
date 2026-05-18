package expo.modules.settings

import android.content.ComponentCallbacks
import android.content.res.Configuration
import android.content.res.Resources
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSettingsModule : Module() {
  companion object {
    private const val ORIENTATION_EVENT = "onOrientationChange"
  }

  private val context
    get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("ExpoSettings")

    Events(ORIENTATION_EVENT)

    Function("getOrientation") {
      return@Function currentOrientation()
    }

    OnStartObserving(ORIENTATION_EVENT) {
      context.applicationContext.registerComponentCallbacks(configCallback)
    }

    OnStopObserving(ORIENTATION_EVENT) {
      context.applicationContext.unregisterComponentCallbacks(configCallback)
    }
  }

  private fun currentOrientation(): String {
    val config = appContext.currentActivity?.resources?.configuration
      ?: Resources.getSystem().configuration
    return orientationString(config.orientation)
  }

  private fun orientationString(orientation: Int) =
    if (orientation == Configuration.ORIENTATION_LANDSCAPE) "landscape" else "portrait"

  private val configCallback = object : ComponentCallbacks {
    override fun onConfigurationChanged(newConfig: Configuration) {
      sendEvent(ORIENTATION_EVENT, bundleOf("orientation" to orientationString(newConfig.orientation)))
    }

    override fun onLowMemory() {}
  }
}
