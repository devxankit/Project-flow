import { useEffect } from 'react';

/**
 * Custom hook to scroll to top when component mounts
 * Use this hook in any page component to ensure it starts at the top
 */
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};

export default useScrollToTop;
