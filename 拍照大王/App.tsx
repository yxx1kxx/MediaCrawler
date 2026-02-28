import React from 'react';
import { AppStoreProvider } from './src/state/store';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AppStoreProvider>
      <RootNavigator />
    </AppStoreProvider>
  );
}
