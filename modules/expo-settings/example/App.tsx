import { useScreenOrientation } from 'expo-settings';
import { Text, View } from 'react-native';

export default function App() {
  const orientation = useScreenOrientation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Orientation: {orientation}</Text>
    </View>
  );
}