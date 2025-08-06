import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white dark:bg-gray-900 transition-colors duration-500">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner animation */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 dark:border-blue-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-t-4 border-pink-500 dark:border-pink-400 animate-spin [animation-duration:1.2s]" />
          <div className="absolute inset-4 rounded-full border-t-4 border-yellow-500 dark:border-yellow-400 animate-spin [animation-duration:1.6s]" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-500 via-pink-500 to-yellow-500 dark:from-blue-400 dark:via-pink-400 dark:to-yellow-400 shadow-lg" />
        </div>

        {/* Loading Text */}
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
}
