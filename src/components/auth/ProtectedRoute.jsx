
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = () => {
    const { isAuthenticated, hasAccessCode, loading } = useAuth();

    // While auth is initializing, show nothing or a spinner
    if (loading) return null; // Or a loading spinner

    // If neither authenticated (Rep) nor has access code (Student), kick them out
    if (!isAuthenticated && !hasAccessCode) {
        return <Navigate to="/" replace />;
    }

    // If allowed, render the child routes
    return <Outlet />;
};
