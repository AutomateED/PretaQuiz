import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuizConfig } from '@/hooks/useQuizConfig';
import { useQuiz } from '@/hooks/useQuiz';
import StartScreen from '@/components/quiz/StartScreen';
import QuestionScreen from '@/components/quiz/QuestionScreen';
import EmailGate from '@/components/quiz/EmailGate';
import ConfirmationScreen from '@/components/quiz/ConfirmationScreen';

import { QUESTIONS } from '@/utils/questions';
import { sendResultEmail } from '@/utils/email';
import { calculateResult } from '@/utils/scoring';
import { supabase } from '@/integrations/supabase/client';

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const { config, loading, error } = useQuizConfig(slug);
  const quiz = useQuiz();
  const [finalResult, setFinalResult] = useState<string | null>(null);

  // Dynamically load selected Google Font
  useEffect(() => {
    if (!config?.fontFamily) return;
    const family = config.fontFamily.replace(/ /g, '+');
    const id = `quiz-font-${family}`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    }
  }, [config?.fontFamily]);

  // Dynamically swap favicon to client logo
  useEffect(() => {
    if (!config?.logo) return;

    const setFavicon = (url: string) => {
      const existing = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
      existing.forEach(el => el.remove());
      const icon = document.createElement('link');
      icon.rel = 'icon';
      icon.href = url;
      document.head.appendChild(icon);
    };

    // Test that the logo URL loads before swapping
    const img = new Image();
    img.onload = () => setFavicon(config.logo);
    img.onerror = () => {}; // silently keep PretaQuiz favicon if logo fails
    img.src = config.logo;

    // Restore PretaQuiz favicon on unmount
    return () => {
      const existing = document.querySelectorAll('link[rel="icon"]');
      existing.forEach(el => el.remove());
      const icon = document.createElement('link');
      icon.rel = 'icon';
      icon.type = 'image/svg+xml';
      icon.href = '/pretaquiz-favicon.svg';
      document.head.appendChild(icon);
    };
  }, [config?.logo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Quiz not found</h1>
          <p className="text-muted-foreground">{error || "We couldn't find a quiz at this URL."}</p>
        </div>
      </div>
    );
  }

  const handleEmailSubmit = async (firstName: string, email: string, lastName: string) => {
    // Calculate result directly from answers to avoid race condition with setState
    const resultType = calculateResult(quiz.answers, config.resultTitles);
    setFinalResult(resultType);
    const resultCopy = config.resultTexts[resultType];
    quiz.submitEmail(firstName, email, lastName);

    // Fire Meta Pixel Lead event (respects cookie consent)
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted' && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'Lead');
    }

    // Insert lead into Supabase (fire-and-forget, never blocks confirmation)
    if (!config.clientId) {
      console.warn('Skipping lead insert: missing clientId for slug', slug);
} else {
      // Check lead cap before inserting - standard tier: 500/month. Founding: unlimited.
      // check_lead_cap returns true if under cap (allow), false if over cap (skip).
      // The prospect always sees their result - we never block the confirmation screen.
      supabase
        .rpc('check_lead_cap', { p_client_id: config.clientId })
        .then(({ data: underCap, error: capError }) => {
          if (capError) {
            console.warn('Lead cap check failed, inserting anyway:', capError);
          }
          if (underCap === false) {
            console.warn('Lead cap reached for client', config.clientId, '- skipping insert');
            return;
          }
          supabase
            .from('leads')
            .insert({
              client_id: config.clientId,
              quiz_slug: slug!,
              first_name: firstName,
              last_name: lastName,
              email,
              result_type: resultType,
              answers: quiz.answers,
            })
            .then(({ error: insertError }) => {
              if (insertError) {
                console.error('Lead insert failed:', insertError);
                fetch('https://sgllwxhabdhjldhpnnsg.supabase.co/functions/v1/fire-webhook', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    slug: slug!,
                    payload: {
                      lead_insert_failed: true,
                      first_name: firstName,
                      last_name: lastName,
                      email,
                      result_type: resultType,
                      result_copy: resultCopy,
                      answers: quiz.answers,
                      quiz_name: config.quizName || config.businessName,
                      client_name: config.businessName,
                      timestamp: new Date().toISOString(),
                      error_message: insertError.message,
                    },
                  }),
                }).catch(() => {});
              }
            });
        });
    }

    // Fire webhook via server-side Edge Function (keeps webhook URL secret)
    fetch('https://sgllwxhabdhjldhpnnsg.supabase.co/functions/v1/fire-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: slug!,
        payload: {
          first_name: firstName,
          last_name: lastName,
          email,
          result_type: resultType,
          result_copy: resultCopy,
          answers: quiz.answers,
          quiz_name: config.quizName || config.businessName,
          client_name: config.businessName,
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch(() => {});

    sendResultEmail(config, {
      to_email: email,
      to_name: firstName,
      result_type: resultType,
      result_copy: resultCopy,
      cta_text: config.ctaText,
      cta_url: config.ctaUrl,
      business_name: config.businessName,
      coach_tagline: config.ctaTagline,
    });
  };

  const questions = config.questions && config.questions.length > 0 ? config.questions : QUESTIONS;

  switch (quiz.screen) {
    case 'start':
      return <StartScreen config={config} onStart={quiz.startQuiz} />;
    case 'question':
      return (
        <QuestionScreen
          questionIndex={quiz.currentQuestion}
          answers={quiz.answers}
          brandColour={config.brandColour}
          direction={quiz.direction}
          questions={questions}
          onAnswer={(qi, letter) => quiz.answerQuestion(qi, letter, questions.length)}
          onBack={quiz.goBack}
        />
      );
    case 'email':
      return <EmailGate brandColour={config.brandColour} privacyPolicyUrl={config.privacyPolicyUrl} onSubmit={handleEmailSubmit} />;
    case 'confirmation': {
      const confirmResult = finalResult ?? calculateResult(quiz.answers, config.resultTitles);
      const confirmCopy = config.resultTexts[confirmResult];
      return <ConfirmationScreen config={config} email={quiz.userData.email} resultType={confirmResult} resultCopy={confirmCopy} />;
    }
  }
}
