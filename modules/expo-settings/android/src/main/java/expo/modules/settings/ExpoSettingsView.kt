package expo.modules.settings

import android.content.Context
import android.graphics.Color
import android.widget.TextView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class ExpoSettingsView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val textView = TextView(context).also {
    it.setTextColor(Color.DKGRAY)
    it.textAlignment = TextView.TEXT_ALIGNMENT_CENTER
    it.text = "IncrementingCurrencyView is available on iOS"
    addView(it)
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    textView.layout(0, 0, right - left, bottom - top)
  }

}