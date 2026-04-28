import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const userData = await apiRequest('/auth/me');
            setUser(userData);
        } catch {
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email, password, remember = false) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, remember }),
        });
        localStorage.setItem('token', data.token);
        // Fetch full user with all associations
        const fullUser = await apiRequest('/auth/me');
        setUser(fullUser);
        return fullUser;
    };

    const register = async (email, password, name, code) => {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, code }),
        });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const userData = await apiRequest('/auth/me');
            setUser(userData);
        } catch {
            // ignore
        }
    };

    const updateUser = (updater) => {
        setUser(prev => typeof updater === 'function' ? updater(prev) : updater);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            refreshUser,
            updateUser,
            isAuthenticated: !!user,
            isCoach: user?.role === 'coach' || user?.role === 'admin',
            isAdmin: user?.role === 'admin',
        }}>
            {children}
        </AuthContext.Provider>
    );
};
