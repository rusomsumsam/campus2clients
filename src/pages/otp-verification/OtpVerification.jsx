// components/OtpVerification.jsx
import { useState, useEffect } from 'react';

const OtpVerification = ({ userId, email, phone, method, onBack, onComplete }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let interval;
        if (timer > 0 && !canResend) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, canResend]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return; // Prevent pasting multiple digits

        const newOtp = [...otp];
        newOtp[index] = value.replace(/[^0-9]/g, ''); // Only allow numbers
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const pastedOtp = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

        if (pastedOtp.length === 6) {
            const newOtp = pastedOtp.split('');
            setOtp(newOtp);

            // Focus last input
            const lastInput = document.getElementById('otp-5');
            if (lastInput) lastInput.focus();
        }
    };

    // components/OtpVerification.jsx - Update handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: method === 'email' ? email : undefined,
                    phone: method === 'phone' ? phone : undefined,
                    otp: otpString,
                    type: method,
                }),
            });

            const data = await response.json();
            console.log('OTP verification response:', data);

            if (data.success) {
                if (data.data.isEmailVerified && data.data.isPhoneVerified) {
                    // Both verified - registration complete
                    alert('Verification successful! Your account is now active.');
                    onComplete();
                } else {
                    // Only one verified - ask to verify the other
                    alert(`${method} verified successfully! Please verify your ${method === 'email' ? 'phone' : 'email'} as well.`);
                    onBack(); // Go back to method selection
                }
            } else {
                setError(data.message || 'Invalid OTP');
                // Clear OTP inputs on error
                setOtp(['', '', '', '', '', '']);
                // Focus first input
                document.getElementById('otp-0')?.focus();
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError('An error occurred during verification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: method === 'email' ? email : undefined,
                    phone: method === 'phone' ? phone : undefined,
                    type: method,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setTimer(60);
                setCanResend(false);
                alert(`OTP resent to your ${method}`);
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setError('An error occurred');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full py-8">
            <button
                onClick={onBack}
                className="self-start mb-4 text-sm text-gray-500 hover:text-[#47C682] transition-colors"
            >
                ← Back to method selection
            </button>

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Verify Your {method === 'email' ? 'Email' : 'Phone'}
            </h2>

            <p className="text-gray-600 text-center mb-2">
                We've sent a 6-digit verification code to
            </p>
            <p className="font-semibold text-[#47C682] mb-8">
                {method === 'email' ? email : `+${phone}`}
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-[#47C682] focus:outline-none focus:ring-1 focus:ring-[#47C682] transition-all duration-200"
                            maxLength="1"
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-red-600 text-sm text-center mb-4">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full bg-gradient-to-r from-[#47C682] to-[#86D245] text-white font-semibold py-3 px-4 rounded-lg hover:from-[#3CB072] hover:to-[#78C23D] focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#47C682] transition-all duration-300 hover:shadow-lg hover:shadow-[#47C682]/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="text-center mt-4">
                    {canResend ? (
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resendLoading}
                            className="text-[#47C682] hover:text-[#3CB072] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Resend OTP in {timer} seconds
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default OtpVerification;