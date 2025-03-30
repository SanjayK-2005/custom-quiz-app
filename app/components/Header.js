'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isHome = pathname === '/';

  return (
    <motion.header 
      className={`w-full py-4 px-4 md:px-6 backdrop-blur-sm ${isHome ? 'absolute top-0 z-50 bg-transparent' : 'bg-background/95 border-b border-gray-800'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-white font-bold text-xl">Q</span>
          </motion.div>
          <span className={`text-xl font-bold ${isHome ? 'text-white' : 'text-foreground'}`}>QuizAI</span>
        </Link>

        <nav className="flex items-center space-x-6">
          {session ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium ${isHome ? 'text-white hover:text-gray-300' : 'text-foreground hover:text-gray-300'} transition-colors`}
              >
                Dashboard
              </Link>
              <ThemeToggle />
              <motion.button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Out
              </motion.button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:shadow-lg transition-shadow"
                >
                  Sign In
                </Link>
              </motion.div>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
} 