
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { SubjectList } from './pages/SubjectList';
import { LectureList } from './pages/LectureList';
import { Admin } from './pages/Admin';
import ScrollToTop from './components/layout/ScrollToTop';

import { useRegisterSW } from 'virtual:pwa-register/react';

function App() {
  useRegisterSW({
    onRegistered(r) {
      r && setInterval(() => { r.update(); }, 60 * 1000);
    },
    onNeedRefresh() {
      if (confirm("New update available. Reload?")) {
        window.location.reload();
      }
    }
  });

  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Home />} />
              <Route path="/course1" element={<SubjectList />} />
              <Route path="/course1/:subjectId" element={<LectureList />} />
              <Route path="/ctrl-panel" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
