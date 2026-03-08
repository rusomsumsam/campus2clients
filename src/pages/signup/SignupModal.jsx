// components/SignupModal.jsx
import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import signupLeft from '../../assets/img/signupleft.jpg';
import OtpVerification from '../otp-verification/OtpVerification';


const SignupModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('signup'); // 'signup', 'otp-selection', 'otp-verification'
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        countryCode: '',
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
    const [otpData, setOtpData] = useState({
        userId: null,
        email: '',
        phone: '',
        otpMethod: null, // 'email' or 'phone'
    });
    const [loading, setLoading] = useState(false);

    // Reset form when modal closes
    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            countryCode: '',
        });
        setErrors({});
        setPhoneError('');
        setTouched({
            firstName: false,
            lastName: false,
            email: false,
            phone: false,
            password: false,
            confirmPassword: false,
        });
        setStep('signup');
        setOtpData({
            userId: null,
            email: '',
            phone: '',
            otpMethod: null,
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

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

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
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

    const getInputBorderClass = (fieldName, error) => {
        const isTouched = touched[fieldName];
        const hasValue = formData[fieldName].trim() !== '';
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

    const handleSignupSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        // Log the data being sent
        const requestData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            countryCode: formData.countryCode,
        };
        console.log('Sending registration data:', requestData);

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (data.success) {
                // Store registration data for OTP step
                setOtpData({
                    userId: data.data.userId,
                    email: data.data.email,
                    phone: data.data.phone,
                    otpMethod: null,
                });
                setStep('otp-selection');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpMethodSelect = (method) => {
        setOtpData(prev => ({ ...prev, otpMethod: method }));
        setStep('otp-verification');
    };

    const handleOtpBack = () => {
        setStep('otp-selection');
    };

    const handleOtpComplete = () => {
        resetForm();
        onClose();
        // Optionally redirect to login or show success message
        alert('Registration completed successfully! Please login.');
    };

    const handleModalClick = (e) => {
        // Close modal when clicking on backdrop
        if (e.target.id === 'modal-backdrop') {
            handleClose();
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
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center text-gray-800 hover:text-red-600 text-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    ×
                </button>

                {/* Signup Content */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm h-full">
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Left Side - Full Image with Overlay Text (always visible) */}
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
                                        Success starts here
                                    </h1>
                                    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 w-5 h-5 md:w-7 md:h-7 bg-green-500 rounded-full flex items-center justify-center mr-2 md:mr-3 mt-1">
                                                <span className="text-white text-xs md:text-sm font-bold">✓</span>
                                            </div>
                                            <span className="text-sm md:text-lg text-white">Over 700 categories</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 w-5 h-5 md:w-7 md:h-7 bg-blue-500 rounded-full flex items-center justify-center mr-2 md:mr-3 mt-1">
                                                <span className="text-white text-xs md:text-sm font-bold">⚡</span>
                                            </div>
                                            <span className="text-sm md:text-lg text-white">Quality work done faster</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 w-5 h-5 md:w-7 md:h-7 bg-purple-500 rounded-full flex items-center justify-center mr-2 md:mr-3 mt-1">
                                                <span className="text-white text-xs md:text-sm font-bold">🌍</span>
                                            </div>
                                            <span className="text-sm md:text-lg text-white">Access to talent and businesses across the globe</span>
                                        </li>
                                    </ul>
                                    <div className="mt-6 pt-4 md:pt-6 border-t border-white/30">
                                        <div className="bg-white/10 p-3 md:p-4 rounded-lg border border-white/20">
                                            <p className="text-white text-sm md:text-lg font-semibold">
                                                Already have an account?{' '}
                                                <a
                                                    href="/login"
                                                    className="text-white bg-gradient-to-r from-[#47C682] to-[#86D245] hover:from-[#3CB072] hover:to-[#78C23D] font-bold py-1 px-3 md:py-2 md:px-6 rounded-full inline-block transition-all duration-300 hover:shadow-lg hover:shadow-[#47C682]/30 ml-2 md:ml-3 text-sm md:text-base"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleClose();
                                                        // Navigate to login page or open login modal
                                                    }}
                                                >
                                                    Log in →
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Dynamic Content Based on Step */}
                        <div className="md:w-1/2 p-4 md:p-6 h-auto md:h-full flex flex-col">
                            {step === 'signup' && (
                                <>
                                    <div className="text-center mb-4 md:mb-6 flex-shrink-0">
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create Account</h2>
                                    </div>

                                    <form onSubmit={handleSignupSubmit} className="space-y-3 md:space-y-4 flex-grow overflow-y-auto pr-1 pl-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={`w-full px-3 py-2 rounded-lg border ${getInputBorderClass('firstName', errors.firstName)} focus:outline-none transition duration-200 text-sm`}
                                                    placeholder="Enter first name"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={`w-full px-3 py-2 rounded-lg border ${getInputBorderClass('lastName', errors.lastName)} focus:outline-none transition duration-200 text-sm`}
                                                    placeholder="Enter last name"
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={`w-full px-3 py-2 rounded-lg border ${getInputBorderClass('email', errors.email)} focus:outline-none transition duration-200 text-sm`}
                                                    placeholder="Enter your email"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <PhoneInput
                                                    country={'bd'}
                                                    value={formData.phone}
                                                    onChange={handlePhoneChange}
                                                    onBlur={handlePhoneBlur}
                                                    inputStyle={{
                                                        width: '100%',
                                                        height: '42px',
                                                        fontSize: '14px',
                                                        paddingLeft: '50px'
                                                    }}
                                                    buttonStyle={{
                                                        borderTopLeftRadius: '6px',
                                                        borderBottomLeftRadius: '6px'
                                                    }}
                                                    containerStyle={{
                                                        width: '100%'
                                                    }}
                                                    inputClass={`${getPhoneInputClass()} rounded-lg focus:outline-none transition duration-200 text-sm`}
                                                    placeholder="Enter phone number"
                                                    countryCodeEditable={false}
                                                    preferredCountries={['bd', 'us', 'gb', 'in']}
                                                />
                                                {phoneError && (
                                                    <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <div>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={`w-full px-3 py-2 rounded-lg border ${getInputBorderClass('password', errors.password)} focus:outline-none transition duration-200 text-sm`}
                                                    placeholder="Create password"
                                                />
                                                {errors.password && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={`w-full px-3 py-2 rounded-lg border ${getInputBorderClass('confirmPassword', errors.confirmPassword)} focus:outline-none transition duration-200 text-sm`}
                                                    placeholder="Confirm password"
                                                />
                                                {errors.confirmPassword && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center mt-3 md:mt-4">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                className="h-3 w-3 md:h-4 md:w-4 text-[#47C682] focus:ring-1 focus:ring-[#47C682] border-gray-300 rounded"
                                            />
                                            <label htmlFor="terms" className="ml-2 block text-xs text-gray-700">
                                                I agree to the{' '}
                                                <a href="#" className="text-[#47C682] hover:text-[#3CB072] font-medium">
                                                    Terms & Conditions
                                                </a>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-[#47C682] to-[#86D245] text-white font-semibold py-2 px-4 rounded-lg hover:from-[#3CB072] hover:to-[#78C23D] focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#47C682] transition-all duration-300 hover:shadow-lg hover:shadow-[#47C682]/30 text-sm mt-3 md:mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </button>

                                        {/* OR Divider */}
                                        <div className="relative my-3">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-200"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="px-2 bg-white text-gray-400 text-xs">OR</span>
                                            </div>
                                        </div>

                                        {/* Social Login Buttons */}
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-300 bg-white rounded-lg py-2 px-2 transition-all duration-300 hover:shadow-sm"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                <span className="text-xs text-gray-600 font-medium">Google</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-300 bg-white rounded-lg py-2 px-2 transition-all duration-300 hover:shadow-sm"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.69 3.56-1.702z" />
                                                </svg>
                                                <span className="text-xs text-gray-600 font-medium">Apple</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-300 bg-white rounded-lg py-2 px-2 transition-all duration-300 hover:shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                <span className="text-xs text-gray-600 font-medium">Facebook</span>
                                            </button>
                                        </div>

                                        {/* Terms & Privacy */}
                                        <p className="text-center text-xs text-gray-400 mt-2">
                                            By signing up, you agree to our{' '}
                                            <a href="#" className="text-[#47C682] hover:underline">Terms & Privacy</a>
                                        </p>
                                    </form>
                                </>
                            )}

                            {step === 'otp-selection' && (
                                <div className="flex flex-col items-center justify-center h-full py-8">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                                        Choose Verification Method
                                    </h2>
                                    <p className="text-gray-600 text-center mb-8">
                                        We'll send a verification code to your selected method
                                    </p>

                                    <div className="space-y-4 w-full max-w-sm">
                                        <button
                                            onClick={() => handleOtpMethodSelect('email')}
                                            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#47C682] hover:bg-[#47C682]/5 transition-all duration-300 flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold text-gray-800">Email</h3>
                                                <p className="text-sm text-gray-500">{otpData.email}</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleOtpMethodSelect('phone')}
                                            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#47C682] hover:bg-[#47C682]/5 transition-all duration-300 flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold text-gray-800">Phone</h3>
                                                <p className="text-sm text-gray-500">+{otpData.phone}</p>
                                            </div>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setStep('signup')}
                                        className="mt-8 text-sm text-gray-500 hover:text-[#47C682] transition-colors"
                                    >
                                        ← Back to signup
                                    </button>
                                </div>
                            )}

                            {step === 'otp-verification' && (
                                <OtpVerification
                                    userId={otpData.userId}
                                    email={otpData.email}
                                    phone={otpData.phone}
                                    method={otpData.otpMethod}
                                    onBack={handleOtpBack}
                                    onComplete={handleOtpComplete}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupModal;