import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './magicui/button';
import { ArrowRight } from 'lucide-react';
import { FloatingElements } from './magicui/floating-elements';

const Hero = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative triangle element */}
      <motion.div 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[60px] border-l-transparent border-t-[40px] border-t-primary border-b-[40px] border-b-transparent opacity-60"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.6 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      
      {/* Floating background elements */}
      <FloatingElements />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Main headline */}
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-8 leading-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Turn chaos into clarity
          <br />
          with smart project management
        </motion.h1>
        
        {/* Description paragraph */}
        <motion.p 
          className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Organize tasks, track progress, and collaborate seamlessly with your team. From planning to delivery, manage every aspect of your projects with powerful tools and intuitive workflows.
        </motion.p>
        
        {/* Call-to-action button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-hover hover:to-primary text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
