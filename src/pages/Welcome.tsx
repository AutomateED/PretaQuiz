import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function Welcome() {
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted' && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'Purchase', { value: 97, currency: 'USD' });
    }
  }, []);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#0F0A1E' }}
    >
      <header className="absolute top-0 left-0 right-0" style={{ backgroundColor: '#0F0A1E' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center">
          <Link to="/" className="text-xl font-bold hover:opacity-85 transition-opacity">
            <span className="text-white">Preta</span>
            <span style={{ color: '#D946EF' }}>Quiz</span>
          </Link>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease }}
        className="w-full max-w-lg rounded-2xl border p-8 text-center md:p-10"
        style={{
          backgroundColor: '#160E28',
          borderColor: '#2D1A4A',
        }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(217,70,239,0.15)' }}
        >
          <CheckCircle2 className="h-8 w-8" style={{ color: '#D946EF' }} />
        </motion.div>

        <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
          You're in! <Sparkles className="inline h-5 w-5" style={{ color: '#D946EF' }} />
        </h1>

        <p className="mb-6 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Your quiz is being set up right now.
        </p>

        {/* Email notice */}
        <div
          className="mx-auto mb-8 flex max-w-sm items-start gap-3 rounded-xl border p-4 text-left"
          style={{
            backgroundColor: 'rgba(217,70,239,0.08)',
            borderColor: 'rgba(217,70,239,0.2)',
          }}
        >
          <Mail className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#D946EF' }} />
          <div>
            <p className="text-sm font-semibold text-white">Check your inbox</p>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              We've sent you a magic link to set your password and access your dashboard. It may take a minute to arrive.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {[
            'Open the email from PretaQuiz',
            'Click the link to set your password',
            'Start customising your quiz in the dashboard',
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.5, ease }}
              className="flex items-center gap-3"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#D946EF' }}
              >
                {i + 1}
              </span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Login link */}
        <div className="mt-8 border-t pt-6" style={{ borderColor: '#2D1A4A' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Already set your password?
          </p>
          <Link
            to="/dashboard/overview"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#D946EF' }}
          >
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Didn't receive an email? Check your spam folder or{' '}
        <Link to="/contact" className="underline hover:text-white">
          contact support
        </Link>
        .
      </p>
    </div>
  );
}
