// context/ProfileContext.jsx (উন্নত ভার্সন)
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const ProfileContext = createContext();

export const CurrentUser = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchProfile = useCallback(async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            setIsAuthenticated(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setProfile(response.data.data);
                setIsAuthenticated(true);
                setError(null);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setProfile(null);
            }
            setError(err.response?.data?.message || 'Failed to fetch profile');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('/api/profile', updatedData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setProfile(prev => ({
                    ...prev,
                    ...updatedData
                }));
                return { success: true };
            }
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Failed to update profile'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setProfile(null);
        setIsAuthenticated(false);
    };

    const serve = {
        profile,
        loading,
        error,
        isAuthenticated,
        refreshProfile: fetchProfile,
        updateProfile,
        logout
    };

    return (
        <ProfileContext.Provider value={serve}>
            {children}
        </ProfileContext.Provider>
    );
};

// Custom hook for using the profile context
export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a CurrentUser provider');
    }
    return context;
};

export default ProfileContext;