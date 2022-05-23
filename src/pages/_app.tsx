import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';

// Estilização global
import '../../styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp
