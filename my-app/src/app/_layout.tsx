import { Provider } from 'react-redux';
import { SWRConfig } from 'swr';
import { store } from '@/store';
import { ToastProvider } from '@/components/atoms/Toast';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '@/components/AuthGate';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Text, TextInput } from 'react-native';

// Overwrite default font family for all Text and TextInput components globally
interface TextWithDefaultProps extends Text {
  defaultProps?: { style?: any };
}
interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: { style?: any };
}
(Text as unknown as TextWithDefaultProps).defaultProps = (Text as unknown as TextWithDefaultProps).defaultProps || {};
(Text as unknown as TextWithDefaultProps).defaultProps!.style = { fontFamily: 'Inter_400Regular' };

(TextInput as unknown as TextInputWithDefaultProps).defaultProps = (TextInput as unknown as TextInputWithDefaultProps).defaultProps || {};
(TextInput as unknown as TextInputWithDefaultProps).defaultProps!.style = { fontFamily: 'Inter_400Regular' };

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

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
