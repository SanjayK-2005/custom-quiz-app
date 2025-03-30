'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header } from './components/Header';
import CustomCursor from './components/CustomCursor';
import BubbleSpotlight from './components/BubbleSpotlight';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95 relative">
      <CustomCursor />
      <BubbleSpotlight />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full min-h-[80vh] relative flex items-center justify-center overflow-hidden">
          <motion.div 
            className="absolute inset-0 z-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2 }}
          >
            <Image
              src="https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg"
              alt="Quiz Background"
              fill
              className="object-cover brightness-[0.4] dark:brightness-50"
              priority
            />
          </motion.div>
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              AI-Powered Custom Quiz Platform
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Create personalized quizzes with instant AI explanations, flexible timing options, and detailed feedback
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                href="/login" 
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                <span className="relative">Get Started</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 px-4 bg-white/50 dark:bg-background/50 backdrop-blur-sm">
          <motion.div 
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <FeatureCard
              title="Customizable Quizzes"
              description="Configure topic, difficulty, timing, and feedback options to match your learning style"
              imageUrl="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg"
              delay={0}
            />
            <FeatureCard
              title="AI Explanations"
              description="Get detailed explanations powered by AI for every question"
              imageUrl="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"
              delay={0.2}
            />
            <FeatureCard
              title="Flexible Timing"
              description="Choose between per-question or total quiz time limits"
              imageUrl="https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg"
              delay={0.4}
            />
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 px-4 bg-gray-100/50 dark:bg-muted/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto text-center">
            <motion.h2 
              className="text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-600"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              How It Works
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <StepCard number="1" title="Sign In" description="Quick and secure login with Google" delay={0} />
              <StepCard number="2" title="Configure" description="Set your quiz parameters and preferences" delay={0.2} />
              <StepCard number="3" title="Take Quiz" description="Answer questions with optional time limits" delay={0.4} />
              <StepCard number="4" title="Review" description="Get AI-powered explanations and track progress" delay={0.6} />
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-8 px-4 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2024 AI-Powered Quiz. All rights reserved.</p>
          <nav className="flex gap-6 mt-4 sm:mt-0">
            <Link className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors" href="#">
              Terms of Service
            </Link>
            <Link className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, imageUrl, delay }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      className="group bg-white/80 dark:bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
      initial={{ y: 20, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
      </div>
    </motion.div>
  );
}

function StepCard({ number, title, description, delay }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      className="bg-white/80 dark:bg-background/50 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
      initial={{ y: 20, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <motion.div 
        className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 mx-auto"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {number}
      </motion.div>
      <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300 text-center">{description}</p>
    </motion.div>
  );
}
