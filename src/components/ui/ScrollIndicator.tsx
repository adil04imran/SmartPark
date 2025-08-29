import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide the indicator after user starts scrolling
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight - 80,
              behavior: 'smooth',
            });
          }}
        >
          <span className="text-sm text-gray-500 mb-1">Scroll down</span>
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
