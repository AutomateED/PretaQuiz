import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_CONFIG, type QuizConfig } from '@/hooks/useConfig';
import {
  LayoutDashboard, Palette, HelpCircle, Trophy,
  MousePointerClick, Plug, Eye, Share2, LogOut, ArrowLeft,
  Users, Sun, Moon, Sparkles,
} from 'lucide-react';

import MyQuizzes from './dashboard/MyQuizzes';
import Overview from './dashboard/Overview';
import Branding from './dashboard/Branding';
import Questions from './dashboard/Questions';
import Results from './dashboard/Results';
import CtaSettings from './dashboard/CtaSettings';
import Integrations from './dashboard/Integrations';
import QuizPreview from './dashboard/QuizPreview';
import ShareQuiz from './dashboard/ShareQuiz';
import Leads from './dashboard/Leads';
import AiGuide from './dashboard/AiGuide';

const NAV_ITEMS = [
  { label: 'Overview', path: 'overview', icon: LayoutDashboard },
  { label: 'Branding', path: 'branding', icon: Palette },
  { label: 'Questions', path: 'questions', icon: HelpCircle },
  { label: 'Results', path: 'results', icon: Trophy },
  { label: 'CTA Settings', path: 'cta', icon: MousePointerClick },
  { label: 'Preview', path: 'preview', icon: Eye },
  { label: 'Share', path: 'share', icon: Share2 },
  { label: 'Connect your CRM', path: 'integrations', icon: Plug },
  { label: 'AI Content Guide', path: 'ai-guide', icon: Sparkles },
  { label: 'Leads', path: 'leads', icon: Users, dividerBefore: true },
];

interface QuizRow {
  id: string;
  quiz_name: string;
  slug: string;
  [key: string]: any;
}

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('pq-theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('pq-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pq-theme', 'light');
    }
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, toggleDark] = useDarkMode();

  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [slug, setSlug] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  const isOnSubPage = location.pathname !== '/dashboard' && location.pathname !== '/dashboard/';

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // Fetch all quizzes for this client
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('quiz_configs')
        .select('*')
        .eq('client_id', user.id);

      if (cancelled) return;
      if (error) {
        console.error('Failed to load quizzes:', error);
        setQuizzes([]);
      } else {
        setQuizzes((data as QuizRow[]) || []);
      }
      setDataLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Auto-select first quiz when navigating to a sub-route with no selection
  useEffect(() => {
    if (!selectedQuizId && quizzes.length > 0 && isOnSubPage) {
      setSelectedQuizId(quizzes[0].id);
    }
  }, [quizzes, selectedQuizId, isOnSubPage]);

  // When a quiz is selected, derive config & slug
  useEffect(() => {
    if (!selectedQuizId) {
      setConfig(null);
      setSlug('');
      return;
    }
    const row = quizzes.find((q) => q.id === selectedQuizId);
    if (row) {
      setConfig(mapRowToConfig(row));
      setSlug(row.slug);
    }
  }, [selectedQuizId, quizzes]);

  const handleSelectQuiz = useCallback((quizId: string) => {
    setSelectedQuizId(quizId);
    navigate('/dashboard/overview');
  }, [navigate]);

  const handleBackToList = useCallback(() => {
    setSelectedQuizId(null);
    navigate('/dashboard');
  }, [navigate]);

  if (!dataLoading && !authLoading && user && isOnSubPage && quizzes.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }

  if (authLoading || !user || dataLoading || (isOnSubPage && !config && quizzes.length > 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0F0A1E]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#D946EF', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0F0A1E]">
      {/* Sidebar — only shown when a quiz is selected and on a sub-page */}
      {selectedQuizId && isOnSubPage && (
        <aside className="w-60 shrink-0 flex flex-col bg-[#F8F7FF] dark:bg-[#160E28]" style={{ borderRight: '1px solid rgba(217,70,239,0.15)' }}>
          <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(217,70,239,0.15)' }}>
            <Link to="/" className="text-[20px] font-bold tracking-tight">
              <span className="text-[#0F0A1E] dark:text-white">Preta</span><span style={{ color: '#D946EF' }}>Quiz</span>
            </Link>
            <p className="text-sm font-medium truncate mt-1 text-[#0F0A1E] dark:text-white">
              {config?.quizName || 'My Quiz'}
            </p>
          </div>

          {/* Back to list */}
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-colors hover:bg-white/50 dark:hover:bg-white/10"
            style={{ color: '#D946EF', borderBottom: '1px solid rgba(217,70,239,0.10)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            My Quizzes
          </button>

          <nav className="flex-1 py-4 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === `/dashboard/${item.path}`;
              return (
                <React.Fragment key={item.path}>
                  {item.dividerBefore && (
                    <div
                      aria-hidden="true"
                      style={{
                        height: '1px',
                        backgroundColor: 'rgba(0,0,0,0.08)',
                        marginTop: '12px',
                        marginBottom: '12px',
                      }}
                    />
                  )}
                  <Link to={`/dashboard/${item.path}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#F020B0] text-white'
                        : 'text-[#6B5F80] dark:text-[#9A8EAA] hover:bg-[rgba(217,70,239,0.08)] dark:hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>

          <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid rgba(217,70,239,0.15)' }}>
            <button
              onClick={toggleDark}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors text-[#6B5F80] dark:text-[#9A8EAA] hover:bg-[rgba(217,70,239,0.08)] dark:hover:bg-white/5"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
              {dark ? 'Light mode' : 'Dark mode'}
            </button>
            <button onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors text-[#6B5F80] dark:text-[#9A8EAA] hover:bg-[rgba(217,70,239,0.08)] dark:hover:bg-white/5"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-auto">
        <Routes>
          <Route
            index
            element={
              <>
                {/* Top bar for list page */}
                <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(217,70,239,0.10)' }}>
                  <Link to="/" className="text-[20px] font-bold tracking-tight">
                    <span className="text-[#0F0A1E] dark:text-white">Preta</span><span style={{ color: '#D946EF' }}>Quiz</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleDark}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-[#6B5F80] dark:text-[#9A8EAA] hover:bg-[rgba(217,70,239,0.08)] dark:hover:bg-white/5"
                      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-[#6B5F80] dark:text-[#9A8EAA]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
                <MyQuizzes quizzes={quizzes} onSelectQuiz={handleSelectQuiz} />
              </>
            }
          />
          {config && (
            <>
              <Route path="overview" element={<Overview config={config} slug={slug} />} />
              <Route path="branding" element={<Branding config={config} onConfigChange={setConfig} userId={user.id} quizId={config.quizId} />} />
              <Route path="questions" element={<Questions config={config} onConfigChange={setConfig} userId={user.id} quizId={config.quizId} />} />
              <Route path="results" element={<Results config={config} onConfigChange={setConfig} userId={user.id} quizId={config.quizId} />} />
              <Route path="cta" element={<CtaSettings config={config} onConfigChange={setConfig} userId={user.id} quizId={config.quizId} />} />
              <Route path="integrations" element={<Integrations config={config} onConfigChange={setConfig} userId={user.id} quizId={config.quizId} />} />
              <Route path="preview" element={<QuizPreview slug={slug} config={config} />} />
              <Route path="leads" element={<Leads />} />
              <Route path="share" element={<ShareQuiz slug={slug} />} />
              <Route path="ai-guide" element={<AiGuide />} />
            </>
          )}
        </Routes>
      </main>


    </div>
  );
}

function mapRowToConfig(row: any): QuizConfig {
  const ec = (row.email_config as any) || {};
  return {
    slug: row.slug || '', quizId: row.id || '', clientId: row.client_id || '', quizName: row.quiz_name || 'My Quiz',
    templateType: row.template_type || 'custom',
    fullName: row.full_name || '', businessName: row.business_name || '',
    email: row.email || '', logo: row.logo_url || '',
    brandColour: row.brand_colour || DEFAULT_CONFIG.brandColour,
    fontFamily: row.font_family || DEFAULT_CONFIG.fontFamily,
    questions: Array.isArray(row.questions) ? row.questions : [],
    resultTitles: (row.result_titles as any) || DEFAULT_CONFIG.resultTitles,
    resultTexts: (row.result_texts as any) || DEFAULT_CONFIG.resultTexts,
    resultCtas: (row.result_ctas as any) || DEFAULT_CONFIG.resultCtas,
    ctaText: row.cta_text || '', ctaUrl: row.cta_url || '',
    ctaTagline: row.cta_tagline || '', webhookUrl: row.webhook_url || '',
    privacyPolicyUrl: row.privacy_policy_url || '',
    emailjsServiceId: ec.serviceId || '', emailjsTemplateId: ec.templateId || '',
    emailjsPublicKey: ec.publicKey || '',
  };
}
