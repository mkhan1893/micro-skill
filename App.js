import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Register standard Expo Router entrypoint
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
