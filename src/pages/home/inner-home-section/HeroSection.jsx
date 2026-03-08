import signupVideoDemo from '../../../assets/video/video.mp4';
import { useEffect, useState } from 'react';

const HeroSection = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const categories = [
        { name: 'Website Development', icon: '🌐' },
        { name: 'Architecture & Interior Design', icon: '🏛️' },
        { name: 'UGC Videos', icon: '🎬' },
        { name: 'Video Editing', icon: '✂️' },
        { name: 'Book Publishing', icon: '📚' },
    ];

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background Video with Smooth Gradient Overlay */}
            <div className="absolute inset-0">
                <video
                    src={signupVideoDemo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Smooth horizontal gradient - dark on left, lighter on right */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10 md:from-black/80 md:via-black/40 md:to-black/5"></div>

                {/* Additional vertical gradient at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex h-full items-start md:items-center">
                <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
                    <div className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                        {/* Premium Badge */}
                        <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 md:h-2 md:w-2 animate-pulse rounded-full bg-emerald-500"></span>
                            <span className="text-xs md:text-sm font-medium tracking-wider text-white/90">
                                CAMPUS. CONNECT. CLIENTS.
                            </span>
                        </div>

                        {/* Main Heading with Green Text Only */}
                        <div className="mb-4 md:mb-6 max-w-3xl">
                            <h1 className="mb-3 md:mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.1] tracking-tight text-white">
                                Our freelancers
                                <br className="hidden sm:block" />
                                <span className="inline before:content-['_']">
                                    <span className="relative">
                                        <span className="relative z-10 bg-gradient-to-r from-[#79C135] to-[#5BCA6D] bg-clip-text text-transparent">
                                            will take it from here
                                        </span>
                                        <span className="absolute -bottom-1 md:-bottom-2 left-0 h-[2px] md:h-[3px] w-full bg-gradient-to-r from-[#79C135] to-[#5BCA6D]"></span>
                                    </span>
                                </span>
                            </h1>

                            <p className="mt-4 md:mt-6 max-w-2xl text-base sm:text-lg md:text-xl font-light text-white/80 leading-tight">
                                Connect with top-tier professionals ready to transform your vision into reality.
                                From concept to completion, we deliver excellence.
                            </p>
                        </div>

                        {/* Enhanced Search Bar with Green Theme */}
                        <div className="mb-8 md:mb-12 max-w-3xl">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-white rounded-xl md:rounded-2xl group-hover:opacity-70 transition duration-500"></div>
                                <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl overflow-hidden border border-white/20">
                                    <div className="pl-3 md:pl-5">
                                        <svg className="h-4 w-4 md:h-5 md:w-5 text-[#79C135]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="What service are you looking for today?"
                                        className="w-full bg-transparent px-3 md:px-4 py-2 md:py-3 text-black placeholder-black/80 outline-none text-sm md:text-lg"
                                    />
                                    <button className="m-1.5 md:m-2 bg-gradient-to-r from-[#79C135] to-[#5BCA6D] text-white font-medium px-4 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-[#79C135]/25 transition-all duration-300 hover:scale-105 active:scale-95 text-sm md:text-base">
                                        Search
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-white/60">
                                <span>Popular:</span>
                                {['Logo Design', 'Social Media', 'Copywriting', 'SEO'].map((tag, idx) => (
                                    <button key={idx} className="hover:text-white transition-colors whitespace-nowrap">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Premium Category Cards with Green Buttons */}
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {categories.map((category, index) => (
                                <div
                                    key={index}
                                    className={`group relative overflow-hidden rounded-xl md:rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[#79C135]/50 hover:bg-white/10 hover:shadow-lg hover:shadow-[#79C135]/10 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    <div className="absolute -right-6 -top-6 md:-right-10 md:-top-10 h-16 w-16 md:h-24 md:w-24 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <button className="flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-6 md:py-4">
                                        <span className="text-lg md:text-xl">{category.icon}</span>
                                        <span className="font-medium text-white/90 text-sm md:text-base">
                                            {category.name.split(' ').map((word, i, arr) => (
                                                i === arr.length - 1 ? word : <span key={i}>{word} </span>
                                            ))}
                                        </span>
                                        <span className="ml-1 md:ml-2 text-[#5BCA6D] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            →
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2">
                <div className="animate-bounce">
                    <div className="h-6 w-[1.5px] md:h-8 md:w-[2px] rounded-full bg-gradient-to-b from-cyan-400 to-emerald-400"></div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="hidden md:block absolute top-20 right-20 h-72 w-72 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 blur-3xl"></div>
            <div className="hidden md:block absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 blur-3xl"></div>
        </section>
    );
};

export default HeroSection;