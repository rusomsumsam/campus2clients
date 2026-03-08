// context/AuthContext.jsx
import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Use a ref to track if component is mounted
    const isMounted = useRef(true);

    // Use a ref to store user ID for profile fetching
    const userIdRef = useRef(null);

    // Separate function to fetch profile with user ID
    const fetchUserProfile = useCallback(async (userId) => {
        if (!userId) return;

        try {
            setProfileLoading(true);
            console.log('Fetching user profile for ID:', userId);

            const response = await fetch('http://localhost:3001/api/users/profile', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Profile fetch response:', data);

            if (isMounted.current && data.success) {
                setProfile(data.data);
                console.log('Profile set:', data.data);
                return data.data;
            } else if (isMounted.current) {
                setProfile(null);
            }
        } catch (error) {
            console.error('Profile fetch failed:', error);
            if (isMounted.current) {
                setProfile(null);
            }
        } finally {
            if (isMounted.current) {
                setProfileLoading(false);
            }
        }
    }, []);

    const checkAuthStatus = useCallback(async () => {
        try {
            console.log('Checking auth status...');
            const response = await fetch('http://localhost:3001/api/auth/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Auth check response:', data);

            if (isMounted.current) {
                if (data.success) {
                    setUser(data.data);
                    userIdRef.current = data.data._id || data.data.id;
                    console.log('User set from auth check:', data.data);

                    // Fetch profile immediately with the user data
                    await fetchUserProfile(userIdRef.current);
                } else {
                    setUser(null);
                    setProfile(null);
                    userIdRef.current = null;
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            if (isMounted.current) {
                setUser(null);
                setProfile(null);
                userIdRef.current = null;
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [fetchUserProfile]);

    // Update profile function
    const updateProfile = useCallback(async (profileData) => {
        try {
            setProfileLoading(true);
            console.log('Updating user profile...', profileData);

            const response = await fetch('http://localhost:3001/api/users/profile', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            console.log('Profile update response:', data);

            if (data.success) {
                setProfile(data.data);
                // Update user if needed
                if (data.data.firstName || data.data.lastName) {
                    setUser(prevUser => ({
                        ...prevUser,
                        ...data.data
                    }));
                }
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            return { success: false, error: error.message };
        } finally {
            setProfileLoading(false);
        }
    }, []);

    // Login function
    const login = async (userData) => {
        console.log('Login called with userData:', userData);
        setUser(userData);
        userIdRef.current = userData._id || userData.id;

        // Fetch profile immediately after login
        await fetchUserProfile(userIdRef.current);

        // Also verify with server
        await checkAuthStatus();
    };

    // Logout function
    const logout = async () => {
        try {
            console.log('Logging out...');
            const response = await fetch('http://localhost:3001/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Logout response:', data);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setProfile(null);
            userIdRef.current = null;
        }
    };

    // Refresh profile function
    const refreshProfile = useCallback(async () => {
        if (userIdRef.current) {
            await fetchUserProfile(userIdRef.current);
        } else if (user) {
            await fetchUserProfile(user._id || user.id);
        }
    }, [fetchUserProfile, user]);

    // Check authentication status on mount
    useEffect(() => {
        isMounted.current = true;

        checkAuthStatus();

        return () => {
            isMounted.current = false;
        };
    }, [checkAuthStatus]);

    // Effect to fetch profile when user changes (backup mechanism)
    useEffect(() => {
        if (user && !profile) {
            const userId = user._id || user.id;
            if (userId && userId !== userIdRef.current) {
                userIdRef.current = userId;
                fetchUserProfile(userId);
            }
        }
    }, [user, profile, fetchUserProfile]);

    const value = {
        user,
        profile,
        loading,
        profileLoading,
        login,
        logout,
        updateProfile,
        refreshProfile,
        isAuthenticated: !!user
    };

    // Debug log
    console.log('AuthContext State:', {
        user: user?.email,
        profile: profile?.email,
        isAuthenticated: !!user,
        loading,
        profileLoading
    });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};