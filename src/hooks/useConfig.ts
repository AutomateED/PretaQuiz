import { useState, useCallback, useEffect } from 'react';

export interface QuizConfig {
  slug: string;
  quizId: string;
  clientId: string;
  quizName: string;
  templateType: string;
  fullName: string;
  businessName: string;
  email: string;
  logo: string;
  brandColour: string;
  fontFamily: string;
  questions: { id: number; text: string; options: { letter: string; text: string }[] }[];
  resultTitles: { A: string; B: string; C: string; D: string };
  resultTexts: Record<string, string>;
  resultCtas: Record<string, { cta_text: string; cta_url: string }>;
  ctaText: string;
  ctaUrl: string;
  ctaTagline: string;
  webhookUrl: string;
  privacyPolicyUrl: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
}

const DEFAULT_RESULT_TITLES = {
  A: 'The Invisible Expert',
  B: 'The Overwhelmed Operator',
  C: 'The Confident Starter',
  D: 'The Plateau Breaker',
};

const DEFAULT_RESULTS: Record<string, string> = {
  'The Invisible Expert':
    "You have real skills, deep expertise, and a genuine desire to help your clients transform. The problem isn't your ability. It's your visibility. Your ideal clients don't know you exist yet. You're the best-kept secret in your niche, and that needs to change. The good news? This is the most fixable problem in business. With the right positioning, messaging, and a consistent way to get in front of the right people, everything shifts. You don't need to shout louder. You need to show up smarter.",
  'The Overwhelmed Operator':
    "You're busy, maybe too busy. You're working hard, serving clients, wearing every hat in the business, and somehow still not getting the results that match your effort. The issue isn't your work ethic. It's the lack of systems and structure underneath everything you do. When you're doing everything yourself, there's no room to grow. What you need isn't more hustle. You need a smarter way of working: clear processes, better boundaries, and a business that works even when you step back.",
  'The Confident Starter':
    "You're at the beginning of something exciting, and the energy you're bringing is everything. But right now, the path forward feels unclear. There are too many options, too much noise, and not enough certainty about which direction to go. That's completely normal at this stage. What you need is a solid foundation: clarity on who you serve, what you offer, and how to communicate it in a way that attracts the right people. With the right support, you can avoid years of trial and error and build something that works from day one.",
  'The Plateau Breaker':
    "You've done the hard work of building a business that works, and now you're frustrated that it's not growing the way you know it should. You've hit a ceiling, and the strategies that got you here aren't getting you to the next level. This is one of the most exciting (and most common) places to be, because it means you're ready. What you need isn't more tactics. It's a strategic shift. A fresh perspective, a bolder offer, and the courage to step into the bigger version of your business that's waiting for you.",
};

const DEFAULT_RESULT_CTAS: Record<string, { cta_text: string; cta_url: string }> = {
  A: { cta_text: '', cta_url: '' },
  B: { cta_text: '', cta_url: '' },
  C: { cta_text: '', cta_url: '' },
  D: { cta_text: '', cta_url: '' },
};

export { DEFAULT_RESULT_CTAS };

export { DEFAULT_RESULT_TITLES };

export const DEFAULT_CONFIG: QuizConfig = {
  slug: '',
  quizId: '',
  clientId: '',
  quizName: 'My Quiz',
  templateType: 'business-breakthrough',
  fullName: '',
  businessName: 'Your Business Name',
  email: '',
  logo: '',
  brandColour: '#C9A96E',
  fontFamily: 'Plus Jakarta Sans',
  questions: [],
  resultTitles: DEFAULT_RESULT_TITLES,
  resultTexts: DEFAULT_RESULTS,
  resultCtas: DEFAULT_RESULT_CTAS,
  ctaText: 'Book Your Free Discovery Call',
  ctaUrl: '',
  ctaTagline: "Ready to break through? Let's talk.",
  webhookUrl: '',
  privacyPolicyUrl: '',
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: '',
};

const STORAGE_KEY = 'pretaquiz-config';

export function useConfig() {
  const [config, setConfigState] = useState<QuizConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          resultTitles: { ...DEFAULT_RESULT_TITLES, ...parsed.resultTitles },
          resultTexts: { ...DEFAULT_RESULTS, ...parsed.resultTexts },
          resultCtas: { ...DEFAULT_RESULT_CTAS, ...parsed.resultCtas },
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  const setConfig = useCallback((newConfig: QuizConfig) => {
    setConfigState(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('localStorage quota exceeded, clearing old data and retrying');
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      } catch { /* give up silently */ }
    }
  }, []);

  const updateConfig = useCallback((partial: Partial<QuizConfig>) => {
    setConfigState((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch { /* give up silently */ }
      }
      return updated;
    });
  }, []);

  // Sync with storage changes from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setConfigState({ ...DEFAULT_CONFIG, ...JSON.parse(e.newValue) });
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { config, setConfig, updateConfig };
}
