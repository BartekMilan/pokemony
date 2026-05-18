package expo.modules.settings

import android.content.Context
import androidx.compose.ui.platform.ComposeView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class ExpoSettingsView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val composeView =
    ComposeView(context).also { view ->
      view.setContent {
        IncrementingCurrencyView()
      }
      addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    val width = right - left
    val height = bottom - top
    composeView.layout(0, 0, width, height)
  }
}
