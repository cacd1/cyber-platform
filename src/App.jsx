
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { SubjectList } from './pages/SubjectList';
import { LectureList } from './pages/LectureList';
import { DataCheck } from './pages/DataCheck';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
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
              <Route path="/course1/:subjectId" element={<LectureList />} />
              <Route path="/verify-db" element={<DataCheck />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
