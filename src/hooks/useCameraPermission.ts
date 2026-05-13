import { useCallback, useEffect, useState } from 'react';
import { Camera } from 'react-native-vision-camera';

type UseCameraPermissionResult = {
  hasPermission: boolean;
  isLoading: boolean;
  request: () => Promise<void>;
};

export function useCameraPermission(): UseCameraPermissionResult {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const status = Camera.getCameraPermissionStatus();
        setHasPermission(status === 'granted');
      } catch {
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const request = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    } catch {
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { hasPermission, isLoading, request };
}
