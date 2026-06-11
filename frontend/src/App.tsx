import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/app/store';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMe, logout } from '@/features/auth/authSlice';
import { setOnUnauthorized } from '@/api/axios';
import AppRoutes from '@/routes/AppRoutes';
import Loader from '@/components/common/Loader';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, initialized } = useAppSelector((s) => s.auth);

  useEffect(() => {
    // Wire up the 401 callback to Redux
    setOnUnauthorized(() => {
      store.dispatch(logout());
    });
  }, []);

  useEffect(() => {
    if (token && !initialized) {
      dispatch(fetchMe());
    } else if (!token) {
      // No token → mark as initialized immediately
      store.dispatch({ type: 'auth/fetchMe/rejected' });
    }
  }, [dispatch, token, initialized]);

  if (!initialized) {
    return <Loader fullScreen />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <AuthInitializer>
            <AppRoutes />
          </AuthInitializer>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#0d9488', secondary: '#fff' },
              },
            }}
          />
        </BrowserRouter>
      </LocalizationProvider>
    </Provider>
  );
}
