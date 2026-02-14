import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

const useReducedMotion = (): boolean => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadReduceMotionPreference = async (): Promise<void> => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) {
          setReduceMotionEnabled(isEnabled);
        }
      } catch {
        if (isMounted) {
          setReduceMotionEnabled(false);
        }
      }
    };

    loadReduceMotionPreference();

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReduceMotionEnabled,
    );

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  return reduceMotionEnabled;
};

export default useReducedMotion;
