import ExpoModulesCore
import SwiftUI
import UIKit

public class ExpoSettingsView: ExpoView {
  private let hostingController: UIHostingController<IncrementingCurrencyView>

  public required init(appContext: AppContext? = nil) {
    let rootView = IncrementingCurrencyView()
    hostingController = UIHostingController(rootView: rootView)
    hostingController.view.backgroundColor = .clear

    super.init(appContext: appContext)

    clipsToBounds = true
    addSubview(hostingController.view)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    hostingController.view.frame = bounds
  }
}
