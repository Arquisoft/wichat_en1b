import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

export const ProtectedLayout = () => {
    const isLoggedIn = !!Cookies.get('user');

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export const PublicLayout = () => {
    const isLoggedIn = !!Cookies.get('user');

    if (isLoggedIn) {
        return <Navigate to="/home" />;
    }

    return <Outlet />;
}; 