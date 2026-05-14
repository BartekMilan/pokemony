import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import type { TabParamList } from '../navigation/types';
import { AndroidCameraContent } from '../components/AndroidCameraContent';

type Props = BottomTabScreenProps<TabParamList, 'Camera'>;

export function CameraScreen({ navigation }: Props) {
  return <AndroidCameraContent navigation={navigation} />;
}
