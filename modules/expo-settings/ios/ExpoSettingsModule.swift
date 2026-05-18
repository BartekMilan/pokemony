import ExpoModulesCore

public class ExpoSettingsModule: Module {
  let ORIENTATION_EVENT = "onOrientationChange"
  
  public func definition() -> ModuleDefinition {
    Name("ExpoSettings")

    Events(ORIENTATION_EVENT)

    Function("getOrientation") { () -> String in 
      return currentOrientation() 
    }

    OnStartObserving(ORIENTATION_EVENT) {
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(orientationDidChange),
        name: UIDevice.orientationDidChangeNotification,
        object: nil
      )
    }

    OnStopObserving(ORIENTATION_EVENT) {
        NotificationCenter.default.removeObserver(
        self,
        name: UIDevice.orientationDidChangeNotification,
        object: nil
      )
    }

    View(ExpoSettingsView.self) {}
  }

  private func currentOrientation() -> String {
    switch UIDevice.current.orientation {
    case .landscapeLeft, .landscapeRight:
      return "landscape"
    case .portrait, .portraitUpsideDown:
      return "portrait"
    default:      
      let bounds = UIScreen.main.bounds
      return bounds.width > bounds.height ? "landscape" : "portrait"
   }
  }

 @objc private func orientationDidChange() {
    let orientation = currentOrientation()
    sendEvent(ORIENTATION_EVENT, ["orientation": orientation])
  }
}
