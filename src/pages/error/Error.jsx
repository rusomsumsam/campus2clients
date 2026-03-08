import { Link } from "react-router-dom";
import errorImage from '../../assets/error-img/error.gif';

const Error = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-white text-gray-900">

            {/* Error GIF */}
            <img
                src={errorImage}
                alt="Error"
                className="w-80 md:w-96 animate-pulse"
            />

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-800 mb-2 text-center">
                Oops! Page Not Found
            </p>

            {/* Back to Home Button */}
            <Link
                to="/"
                className="px-6 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-[#47C682] to-[#86D245] hover:from-[#86D245] hover:to-[#47C682] transition-all duration-300 shadow-lg"
            >
                Back to Home
            </Link>
        </div>
    );
};

export default Error;
