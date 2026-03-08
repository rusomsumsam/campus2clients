// components/login/LoginModal.jsx
import { useState } from 'react';
import signupLeft from '../../assets/img/signupleft.jpg';
import { useAuth } from '../../context-api/AuthContext';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [phoneError, setPhoneError] = useState('');
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false,
    });

    // State to toggle between social login and email form
    const [showEmailForm, setShowEmailForm] = useState(false);

    // State for login form (email/password only)
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [loginErrors, setLoginErrors] = useState({});
    const [loginTouched, setLoginTouched] = useState({
        email: false,
        password: false
    });

    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // If modal is not open, don't render anything
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData({
            ...loginData,
            [name]: value,
        });
        if (loginErrors[name]) {
            setLoginErrors({
                ...loginErrors,
                [name]: '',
            });
        }
        // Clear general login error when user types
        if (loginError) setLoginError('');
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true,
        });
    };

    const handleLoginBlur = (e) => {
        const { name } = e.target;
        setLoginTouched({
            ...loginTouched,
            [name]: true,
        });
    };

    const handlePhoneChange = (value, country) => {
        setFormData({
            ...formData,
            phone: value,
            countryCode: country.countryCode
        });
        if (phoneError) {
            setPhoneError('');
        }
    };

    const handlePhoneBlur = () => {
        setTouched({
            ...touched,
            phone: true,
        });
    };

    const getInputBorderClass = (fieldName, error, isLogin = false) => {
        const fieldTouched = isLogin ? loginTouched[fieldName] : touched[fieldName];
        const fieldValue = isLogin ? loginData[fieldName] : formData[fieldName];
        const hasValue = fieldValue?.trim() !== '';
        const hasError = error;

        if (hasError) {
            return 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500';
        } else if (hasValue && !hasError) {
            return 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500';
        } else {
            return 'border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500';
        }
    };

    const getPhoneInputClass = () => {
        const hasValue = formData.phone.trim() !== '';
        const hasError = phoneError;

        if (hasError) {
            return 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500';
        } else if (hasValue && !hasError) {
            return 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500';
        } else {
            return 'border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500';
        }
    };

    const validateLoginForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!loginData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (!loginData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setLoginErrors(newErrors);
        return isValid;
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (!formData.phone.trim()) {
            setPhoneError('Phone number is required');
            isValid = false;
        } else if (formData.phone.length < 8) {
            setPhoneError('Please enter a valid phone number');
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // components/login/LoginModal.jsx - handleLoginSubmit function আপডেট করুন

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        if (!validateLoginForm()) return;

        setLoading(true);
        setLoginError('');

        try {
            console.log('Sending login request with data:', {
                email: loginData.email,
                password: '***',
                rememberMe: document.getElementById('remember-me')?.checked || false
            });

            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password,
                    rememberMe: document.getElementById('remember-me')?.checked || false
                }),
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (data.success) {
                console.log('Login successful, updating auth context with user:', data.data.user);

                // Update auth context
                login(data.data.user);

                // Reset form and close modal
                setLoginData({
                    email: '',
                    password: ''
                });
                setLoginTouched({
                    email: false,
                    password: false
                });
                setLoginErrors({});
                setShowEmailForm(false);

                // Small delay before closing to ensure state updates
                setTimeout(() => {
                    onClose();
                    // Show success message
                    alert(`Welcome back, ${data.data.user.firstName}!`);
                }, 100);
            } else {
                setLoginError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            console.log('Signup submitted successfully:', formData);
            alert('Signup successful! Check console for data.');

            // Reset form and close modal
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
            });
            setTouched({
                firstName: false,
                lastName: false,
                email: false,
                phone: false,
                password: false,
                confirmPassword: false,
            });
            setPhoneError('');
            setShowEmailForm(false);
            onClose();
        }
    };

    const handleModalClick = (e) => {
        // Close modal when clicking on backdrop
        if (e.target.id === 'modal-backdrop') {
            onClose();
        }
    };

    const handleEmailContinue = () => {
        setShowEmailForm(true);
    };

    const handleSwitchToSignup = (e) => {
        e.preventDefault();
        onClose();
        if (onSwitchToSignup) {
            onSwitchToSignup();
        }
    };

    return (
        <div
            id="modal-backdrop"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={handleModalClick}
        >
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center text-gray-800 hover:text-red-600 text-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    ×
                </button>

                {/* Login Content */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm h-full">
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Left Side - Full Image with Overlay Text */}
                        <div className="md:w-1/2 hidden md:block relative h-64 md:h-full overflow-hidden">
                            <img
                                src={signupLeft}
                                alt="Success Illustration"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black opacity-40"></div>
                            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-8">
                                <div className="text-white">
                                    <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
                                        Welcome Back!
                                    </h1>
                                    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 w-5 h-5 md:w-7 md:h-7 bg-green-500 rounded-full flex items-center justify-center mr-2 md:mr-3 mt-1">
                                                <span className="text-white text-xs md:text-sm font-bold">✓</span>
                                            </div>
                                            <span className="text-sm md:text-lg text-white">Access your account</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 w-5 h-5 md:w-7 md:h-7 bg-blue-500 rounded-full flex items-center justify-center mr-2 md:mr-3 mt-1">
                                                <span className="text-white text-xs md:text-sm font-bold">⚡</span>
                                            </div>
                                            <span className="text-sm md:text-lg text-white">Manage your projects</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 w-5 h-5 md:w-7 md:h-7 bg-purple-500 rounded-full flex items-center justify-center mr-2 md:mr-3 mt-1">
                                                <span className="text-white text-xs md:text-sm font-bold">🌍</span>
                                            </div>
                                            <span className="text-sm md:text-lg text-white">Connect with clients worldwide</span>
                                        </li>
                                    </ul>
                                    <div className="mt-6 pt-4 md:pt-6 border-t border-white/30">
                                        <div className="bg-white/10 p-3 md:p-4 rounded-lg border border-white/20">
                                            <p className="text-white text-sm md:text-lg font-semibold">
                                                Don't have an account?{' '}
                                                <a
                                                    href="#"
                                                    className="text-white bg-gradient-to-r from-[#47C682] to-[#86D245] hover:from-[#3CB072] hover:to-[#78C23D] font-bold py-1 px-3 md:py-2 md:px-6 rounded-full inline-block transition-all duration-300 hover:shadow-lg hover:shadow-[#47C682]/30 ml-2 md:ml-3 text-sm md:text-base"
                                                    onClick={handleSwitchToSignup}
                                                >
                                                    Create →
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Login Form */}
                        <div className="md:w-1/2 p-6 md:p-8 h-auto md:h-full flex flex-col">
                            <div className="text-center mb-6 md:mb-8 flex-shrink-0">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Log In To Your Account</h2>
                                <p className="text-gray-500 text-sm mt-2">Welcome back! Please select your login method</p>
                            </div>

                            {!showEmailForm ? (
                                /* Social Login Options - Image Interface Style */
                                <div className="flex flex-col space-y-4 flex-grow justify-center">
                                    {/* Continue with Google */}
                                    <button className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 bg-white rounded-xl py-3 px-4 transition-all duration-300 hover:shadow-md group">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span className="text-gray-700 font-medium text-base group-hover:text-gray-900">Continue with Google</span>
                                    </button>

                                    {/* Continue with Email/Username */}
                                    <button
                                        onClick={handleEmailContinue}
                                        className="w-full flex items-center justify-center gap-3 border-2 border-[#47C682] bg-[#47C682]/5 hover:bg-[#47C682]/10 rounded-xl py-3 px-4 transition-all duration-300 hover:shadow-md group"
                                    >
                                        <svg className="w-5 h-5 text-[#47C682]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-[#47C682] font-medium text-base group-hover:text-[#3CB072]">Continue with email</span>
                                    </button>

                                    {/* OR Divider */}
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-500">OR</span>
                                        </div>
                                    </div>

                                    {/* Apple */}
                                    <button className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 bg-white rounded-xl py-3 px-4 transition-all duration-300 hover:shadow-md group">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.69 3.56-1.702z" />
                                        </svg>
                                        <span className="text-gray-700 font-medium text-base group-hover:text-gray-900">Apple</span>
                                    </button>

                                    {/* Facebook */}
                                    <button className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 bg-white rounded-xl py-3 px-4 transition-all duration-300 hover:shadow-md group">
                                        <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        <span className="text-gray-700 font-medium text-base group-hover:text-gray-900">Facebook</span>
                                    </button>

                                    <p className="text-center text-xs text-gray-500 mt-6">
                                        By continuing, you agree to our{' '}
                                        <a href="#" className="text-[#47C682] hover:underline font-medium">Terms</a>{' '}
                                        and{' '}
                                        <a href="#" className="text-[#47C682] hover:underline font-medium">Privacy Policy</a>
                                    </p>
                                </div>
                            ) : (
                                /* Email Login Form */
                                <div className="flex flex-col flex-grow">
                                    <button
                                        onClick={() => setShowEmailForm(false)}
                                        className="flex items-center text-gray-600 hover:text-[#47C682] mb-6 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back to all login options
                                    </button>

                                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                                        <div>
                                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="login-email"
                                                name="email"
                                                value={loginData.email}
                                                onChange={handleLoginChange}
                                                onBlur={handleLoginBlur}
                                                className={`w-full px-4 py-3 rounded-lg border ${getInputBorderClass('email', loginErrors.email, true)} focus:outline-none transition duration-200 text-base`}
                                                placeholder="Enter your email"
                                                disabled={loading}
                                            />
                                            {loginErrors.email && (
                                                <p className="mt-1.5 text-sm text-red-600">{loginErrors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                id="login-password"
                                                name="password"
                                                value={loginData.password}
                                                onChange={handleLoginChange}
                                                onBlur={handleLoginBlur}
                                                className={`w-full px-4 py-3 rounded-lg border ${getInputBorderClass('password', loginErrors.password, true)} focus:outline-none transition duration-200 text-base`}
                                                placeholder="Enter your password"
                                                disabled={loading}
                                            />
                                            {loginErrors.password && (
                                                <p className="mt-1.5 text-sm text-red-600">{loginErrors.password}</p>
                                            )}
                                        </div>

                                        {loginError && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                                {loginError}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="remember-me"
                                                    className="h-4 w-4 text-[#47C682] focus:ring-[#47C682] border-gray-300 rounded"
                                                />
                                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                                    Remember me
                                                </label>
                                            </div>
                                            <a href="#" className="text-sm text-[#47C682] hover:text-[#3CB072] font-medium">
                                                Forgot password?
                                            </a>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-[#47C682] to-[#86D245] text-white font-semibold py-3 px-4 rounded-lg hover:from-[#3CB072] hover:to-[#78C23D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#47C682] transition-all duration-300 hover:shadow-lg hover:shadow-[#47C682]/30 text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Logging in...' : 'Log In'}
                                        </button>

                                        <div className="text-center mt-4">
                                            <p className="text-sm text-gray-600">
                                                Don't have an account?{' '}
                                                <a
                                                    href="#"
                                                    className="text-[#47C682] hover:text-[#3CB072] font-medium"
                                                    onClick={handleSwitchToSignup}
                                                >
                                                    Sign up
                                                </a>
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;