package expo.modules.settings

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import java.text.DecimalFormat
import java.text.NumberFormat
import java.util.Locale

private const val INCREMENT_AMOUNT = 11.99

@Composable
fun IncrementingCurrencyView() {
  var value by remember { mutableDoubleStateOf(0.0) }

  val currencyFormatter = remember {
    (NumberFormat.getCurrencyInstance(Locale.US) as DecimalFormat).apply {
      decimalFormatSymbols = decimalFormatSymbols.apply {
        currencySymbol = "$"
      }
    }
  }

  val formatted = remember(value) {
    currencyFormatter.format(value)
  }

  Column(
    modifier = Modifier.fillMaxSize(),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center,
  ) {
    AnimatedContent(
      targetState = formatted,
      transitionSpec = {
        fadeIn(animationSpec = tween(300)) togetherWith fadeOut(animationSpec = tween(300))
      },
      label = "currency",
    ) { text ->
      Text(
        text = text,
        style = MaterialTheme.typography.headlineLarge,
        fontWeight = FontWeight.Bold,
      )
    }

    Button(
      modifier = Modifier.padding(top = 16.dp),
      onClick = { value += INCREMENT_AMOUNT },
    ) {
      Text("More money")
    }
  }
}

@Preview(showBackground = true)
@Composable
fun IncrementingCurrencyViewPreview() {
  MaterialTheme {
    IncrementingCurrencyView()
  }
}
