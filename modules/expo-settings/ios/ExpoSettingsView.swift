import ExpoModulesCore
import UIKit

public class ExpoSettingsView: ExpoView {
  private let label = UILabel()

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    backgroundColor = .systemBlue
    label.textAlignment = .center
    label.textColor = .white
    addSubview(label)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    label.frame = bounds
  }

  public func setMessage(_ message: String) {
    label.text = message
  }
}