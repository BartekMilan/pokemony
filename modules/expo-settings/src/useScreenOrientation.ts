import { useEffect, useState } from 'react';
import ExpoSettingsModule from './ExpoSettingsModule'; 
import type { ScreenOrientation } from './ExpoSettings.types';

export function useScreenOrientation(): ScreenOrientation {
    const [orientation, setOrientation] = useState<ScreenOrientation>(
        () => ExpoSettingsModule.getOrientation()
    );

    useEffect(() => {
        const subscription = ExpoSettingsModule.addListener(
          'onOrientationChange',
          ({ orientation }) => setOrientation(orientation)
        );
        return () => subscription.remove();
    }, []);

    return orientation;
}