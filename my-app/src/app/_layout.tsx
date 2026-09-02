import { Provider } from 'react-redux';
import { SWRConfig } from 'swr';
import { store } from '@/store';
import { ToastProvider } from '@/components/atoms/Toast';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '@/components/AuthGate';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SWRConfig
        value={{
          revalidateOnFocus: true,
          shouldRetryOnError: false,
        }}
      >
        <ToastProvider>
          <StatusBar style="light" />
          <AuthGate />
        </ToastProvider>
      </SWRConfig>
    </Provider>
  );
}
