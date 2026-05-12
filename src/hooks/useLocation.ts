import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type UseLocationResult = {
  location: Coordinates | null;
  hasPermission: boolean;
  isLoading: boolean;
};

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (controller.signal.aborted) return;

        if (status !== 'granted') {
          setHasPermission(false);
          return;
        }

        setHasPermission(true);
        const position = await Location.getCurrentPositionAsync();
        if (controller.signal.aborted) return;

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        // Permission/location errors must never crash the app — leave defaults.
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return { location, hasPermission, isLoading };
}
