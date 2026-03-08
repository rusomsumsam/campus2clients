// components/navbar/Navbar.jsx
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SignupModal from "../signup/SignupModal";
import LoginModal from "../login/LoginModal";
import { useAuth } from "../../context-api/AuthContext";

const Navbar = () => {
    const { user, isAuthenticated, logout, loading, profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const sidebarRef = useRef(null);
    const profileDropdownRef = useRef(null);

    useEffect(() => {
        console.log('Navbar - Auth State:', {
            user: user?.email,
            profile: profile?.email,
            isAuthenticated,
            loading,
            profileData: profile
        });
    }, [user, profile, isAuthenticated, loading]);

    console.log('Profile Email:', profile?.email || "No profile email");
    console.log('User Email:', user?.email || "No user email");
    
    // Add console log to track auth state
    useEffect(() => {
        console.log('Navbar auth state:', { user, isAuthenticated, loading });
    }, [user, isAuthenticated, loading]);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                !event.target.closest('button.text-gray-700.text-2xl')) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close main dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative') && dropdownOpen) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showSignupModal || showLoginModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [showSignupModal, showLoginModal]);

    const handleConnectClick = (e) => {
        e.preventDefault();
        setShowSignupModal(true);
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        setShowLoginModal(true);
    };

    const handleLogout = async () => {
        await logout();
        setProfileDropdownOpen(false);
        // Force re-render
        window.location.reload(); // অথবা navigate to home page
    };

    const getInitials = () => {
        if (user) {
            return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
        }
        return '';
    };

    // Show loading state if needed
    if (loading) {
        return (
            <nav className="bg-white px-3 md:px-6 py-4 shadow-md relative oswald tracking-wider">
                <div className="w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Link to="/">
                            <img
                                src="src/assets/img/logo.png"
                                alt="logo"
                                className="w-30 md:w-48"
                            />
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <div className="rounded-xl">
            <nav className="bg-white px-3 md:px-6 py-4 shadow-md relative oswald tracking-wider">
                {/* MAIN BAR */}
                <div className="w-full mx-auto flex items-center justify-between">

                    {/* LEFT: Hamburger + Logo */}
                    <div className="flex items-center gap-1.5">
                        {/* Hamburger */}
                        <button
                            className="md:hidden flex flex-col justify-center items-center w-5 h-5"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${isOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                            <span className={`block w-6 h-0.5 bg-gray-700 my-1 transition-all ${isOpen ? "opacity-0" : ""}`} />
                            <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
                        </button>

                        {/* Logo */}
                        <Link to="/">
                            <img
                                src="src/assets/img/logo.png"
                                alt="logo"
                                className="w-30 md:w-48"
                            />
                        </Link>
                    </div>

                    {/* RIGHT (Mobile): Conditional rendering based on auth status */}
                    <div className="md:hidden flex items-center gap-1.5">
                        {isAuthenticated ? (
                            /* Mobile: Show profile when logged in */
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="w-8 h-8 rounded-full bg-gradient-to-r from-[#47C682] to-[#86D245] text-white font-semibold flex items-center justify-center"
                                >
                                    {getInitials()}
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            Settings
                                        </Link>
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Mobile: Show Log In and Connect when not logged in */
                            <>
                                <button
                                    onClick={handleLoginClick}
                                    className="text-sm font-medium transition-colors duration-300 hover:text-[#47C682]"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={handleConnectClick}
                                    className="text-[14px] px-2 py-1 rounded-md font-medium border border-[#47C682] text-[#000000] bg-white transition-all duration-300 hover:bg-gradient-to-r hover:from-[#47C682] hover:to-[#86D245] hover:text-white hover:border-transparent"
                                >
                                    Connect Now
                                </button>
                            </>
                        )}
                    </div>

                    {/* DESKTOP MENU */}
                    <ul className="hidden md:flex items-center gap-6">
                        <li>
                            <Link to="/why-campus2client" className="hover:text-green-600">
                                Why campus2client
                            </Link>
                        </li>

                        {/* Dropdown */}
                        <li className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1 hover:text-green-600"
                            >
                                Explore to Campus
                                <span className={`${dropdownOpen ? "rotate-180" : ""}`}>▼</span>
                            </button>

                            {dropdownOpen && (
                                <ul className="absolute top-full left-0 bg-white shadow-md rounded-md w-48 mt-2">
                                    <li>
                                        <Link className="block px-4 py-2 hover:bg-gray-100" to="/campus/students">
                                            Students
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="block px-4 py-2 hover:bg-gray-100" to="/campus/projects">
                                            Projects
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="block px-4 py-2 hover:bg-gray-100" to="/campus/skills">
                                            Skills
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        <li>
                            <Link to="/start-freelance" className="hover:text-green-600">
                                Start Your Freelance Journey
                            </Link>
                        </li>

                        {isAuthenticated ? (
                            /* Desktop: Show profile dropdown when logged in */
                            <li className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-2 hover:text-green-600"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#47C682] to-[#86D245] text-white font-semibold flex items-center justify-center">
                                        {getInitials()}
                                    </div>
                                    <span>{user?.firstName}</span>
                                    <span className={`text-xs ${profileDropdownOpen ? "rotate-180" : ""}`}>▼</span>
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            Settings
                                        </Link>
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </li>
                        ) : (
                            /* Desktop: Show Log In and Connect when not logged in */
                            <>
                                <li>
                                    <button
                                        onClick={handleLoginClick}
                                        className="hover:text-green-600"
                                    >
                                        Log In
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={handleConnectClick}
                                        className="px-4 py-2 rounded-md font-medium bg-white border-2 border-[#47C682] text-[#000000] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#47C682] hover:to-[#86D245] hover:text-white hover:border-transparent"
                                    >
                                        Connect Now
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* MOBILE SIDEBAR */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <div
                            ref={sidebarRef}
                            className="fixed top-0 left-0 w-72 h-full bg-white z-50 p-6 shadow-lg"
                        >
                            <button
                                className="absolute top-4 right-4 text-2xl"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>

                            <ul className="mt-10 space-y-4">
                                <li><Link to="/why-campus2client" onClick={() => setIsOpen(false)}>Why campus2client</Link></li>
                                <li><Link to="/campus/students" onClick={() => setIsOpen(false)}>Students</Link></li>
                                <li><Link to="/campus/projects" onClick={() => setIsOpen(false)}>Projects</Link></li>
                                <li><Link to="/campus/skills" onClick={() => setIsOpen(false)}>Skills</Link></li>

                                {isAuthenticated ? (
                                    /* Sidebar: Show profile options when logged in */
                                    <>
                                        <li><Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link></li>
                                        <li><Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
                                        <li><Link to="/settings" onClick={() => setIsOpen(false)}>Settings</Link></li>
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    handleLogout();
                                                }}
                                                className="block w-full text-left text-red-600"
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    /* Sidebar: Show Log In and Connect when not logged in */
                                    <>
                                        <li>
                                            <button
                                                onClick={(e) => {
                                                    setIsOpen(false);
                                                    handleLoginClick(e);
                                                }}
                                                className="block w-full text-left"
                                            >
                                                Log In
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={(e) => {
                                                    setIsOpen(false);
                                                    handleConnectClick(e);
                                                }}
                                                className="block w-full text-center py-2 rounded-md bg-gradient-to-r from-[#47C682] to-[#86D245] text-white"
                                            >
                                                Connect Now
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </>
                )}
            </nav>

            {/* Signup Modal */}
            <SignupModal
                isOpen={showSignupModal}
                onClose={() => setShowSignupModal(false)}
                onSwitchToLogin={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                }}
            />

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToSignup={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                }}
            />
        </div>
    );
};

export default Navbar;