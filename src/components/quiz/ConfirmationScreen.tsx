import { motion } from 'framer-motion';
import type { QuizConfig } from '@/hooks/useConfig';

interface ConfirmationScreenProps {
  config: QuizConfig;
  email: string;
  resultType: string;
  resultCopy: string;
}

export default function ConfirmationScreen({ config, email, resultType, resultCopy }: ConfirmationScreenProps) {
  const brandColour = config.brandColour;

  const resultLetter = (Object.entries(config.resultTitles).find(
    ([, title]) => title === resultType
  )?.[0]) as 'A' | 'B' | 'C' | 'D' | undefined;

  const perResultCta = resultLetter ? config.resultCtas?.[resultLetter] : undefined;
  const ctaText = perResultCta?.cta_text?.trim() || config.ctaText;
  const ctaUrl  = perResultCta?.cta_url?.trim()  || config.ctaUrl;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6 py-12" style={{ backgroundColor: '#FFFFFF' }}>
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated checkmark */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          <svg className="h-20 w-20" viewBox="0 0 52 52" role="img" aria-label="Success checkmark">
            <circle
              className="checkmark-circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
              stroke={brandColour}
              strokeWidth="2"
            />
            <path
              className="checkmark-check"
              fill="none"
              stroke={brandColour}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>

        <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: '#0F0A1E' }}>
          Your result: {resultType}
        </h2>
        <p className="mt-6 text-base leading-relaxed" style={{ color: '#4A4060' }}>
          {resultCopy}
        </p>

        {/* Divider */}
        <div className="my-10 h-px" style={{ backgroundColor: `${brandColour}26` }} />

        {/* CTA section */}
        <div className="flex flex-col items-center gap-4">
          {config.logo && (
            <img
              src={config.logo}
              alt={config.businessName}
              className="h-10 w-auto object-contain"
            />
          )}

          {config.ctaTagline && (
            <p className="text-lg italic" style={{ color: '#6B5F80' }}>
              {config.ctaTagline}
            </p>
          )}

          {ctaUrl && ctaText && (
            <motion.a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${ctaText} (opens in new tab)`}
              className="mt-2 inline-block rounded-full px-10 py-4 text-lg font-semibold tracking-wide transition-all duration-300 hover:shadow-lift active:scale-95"
              style={{ backgroundColor: brandColour || '#F020B0', color: '#FFFFFF' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              {ctaText}
            </motion.a>
          )}
        </div>

        <p className="mt-12 text-xs" style={{ color: '#9A8EAA' }}>
          Powered by <span className="font-semibold">PretaQuiz.com</span>
        </p>
      </motion.div>
    </div>
  );
}