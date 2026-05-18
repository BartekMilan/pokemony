import SwiftUI

struct IncrementingCurrencyView: View {
  @State private var value: Double = 0

  private var currencyFormatter: NumberFormatter = {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencySymbol = "$"
    return formatter
  }()

  var body: some View {
    VStack(spacing: 16) {
      currencyLabel

      Button {
        incrementValue(with: 11.99)
      } label: {
        Text("More money")
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  @ViewBuilder
  private var currencyLabel: some View {
    let formatted =
      currencyFormatter.string(from: NSNumber(value: value)) ?? "$0.00"

    if #available(iOS 17.0, *) {
      Text(formatted)
        .contentTransition(.numericText(value: value))
        .font(.largeTitle)
        .fontWeight(.bold)
    } else {
      Text(formatted)
        .font(.largeTitle)
        .fontWeight(.bold)
    }
  }

  func incrementValue(with amount: Double) {
    withAnimation {
      self.value += amount
    }
  }
}
