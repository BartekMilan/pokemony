import { NativeModule, requireNativeModule } from 'expo';

import { ExpoSettingsModuleEvents, ScreenOrientation } from './ExpoSettings.types';

declare class ExpoSettingsModule extends NativeModule<ExpoSettingsModuleEvents> {
  getOrientation: () => ScreenOrientation;
}

export default requireNativeModule<ExpoSettingsModule>('ExpoSettings');
