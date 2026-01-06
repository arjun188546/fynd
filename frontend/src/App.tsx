import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Feedback Form */}
          <Route path="/" element={<UserDashboard />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Dashboard with Layout (Sidebar + Topbar) */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A1C',
            color: '#FFFFFF',
            border: '1px solid #333333',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
