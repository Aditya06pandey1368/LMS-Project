// HeroSection.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const searchHandler = (e) => {
        e.preventDefault();
        if (searchQuery.trim() !== "") {
            navigate(`/course/search?query=${searchQuery}`)
        }
        setSearchQuery("");
    }

    return (
        <motion.section
            ref={ref}
            style={{ scale, opacity }}
            className="w-full min-h-screen flex items-center justify-center px-10 bg-gradient-to-br from-indigo-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        >
            <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-12 py-16">
                {/* Left Content */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="space-y-6 text-center md:text-left"
                >
                    <h1
                        className="text-4xl sm:text-5xl font-extrabold
             bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
             bg-clip-text text-transparent
             drop-shadow-md
             leading-tight
             animate-fade-in"
                    >
                        Unlock Your Potential with LearnHub
                    </h1>

                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                        Learn something new every day. Dive into world-class courses crafted for curious minds and future leaders.
                    </p>

                    <form onSubmit={searchHandler}>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for courses..."
                                className="w-full sm:w-3/5 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button type='submit' className="flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all">
                                <Search className="w-5 h-5" />
                                <span className="hidden md:inline ml-2">Search</span>
                            </button>
                        </div>
                    </form>

                    <div>
                        <Link to={`/course/search?query`}>
                            <button className="mt-6 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow transition-all">
                                Explore Courses
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Right Image */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="hidden md:block"
                >
                    <img
                        src="https://images.vexels.com/media/users/3/242548/isolated/preview/f545bf5c145714e26b6d119438cfc3ce-studying-elements-semi-flat.png"
                        alt="Learning Illustration"
                        className="w-full h-auto max-h-[600px] drop-shadow-xl rounded-lg"
                    />
                </motion.div>
            </div>
        </motion.section>
    );
};

export default HeroSection;
