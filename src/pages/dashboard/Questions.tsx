import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { QuizConfig } from '@/hooks/useConfig';
import { DEFAULT_RESULT_TITLES } from '@/hooks/useConfig';
import { QUESTIONS, type Question } from '@/utils/questions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PictureInPicture2 } from 'lucide-react';

interface QuestionsProps {
  config: QuizConfig;
  onConfigChange: React.Dispatch<React.SetStateAction<QuizConfig | null>>;
  userId: string;
  quizId: string;
}

const LETTER_COLOURS: Record<string, string> = {
  A: '#6366f1',
  B: '#f59e0b',
  C: '#10b981',
  D: '#ef4444',
};

export default function Questions({ config, onConfigChange, userId, quizId }: QuestionsProps) {
  const { toast } = useToast();

  const letterMap = config.resultTitles || DEFAULT_RESULT_TITLES;

  const initial: Question[] = (() => {
    const stored = (config as any).questions;
    if (Array.isArray(stored) && stored.length > 0) return stored;
    return QUESTIONS;
  })();

  const [questions, setQuestions] = useState<Question[]>(initial);
  const [savingId, setSavingId] = useState<number | null>(null);

  const updateQuestionText = (id: number, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const updateOptionText = (qId: number, letter: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o) => (o.letter === letter ? { ...o, text } : o)) }
          : q
      )
    );
  };

  const handleSave = async (id: number) => {
    setSavingId(id);
    const { error } = await supabase
      .from('quiz_configs')
      .update({ questions: questions as any })
      .eq('id', quizId);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      onConfigChange((prev) => prev ? { ...prev, questions } : prev);
      toast({ title: `Question ${id} saved` });
    }
    setSavingId(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#0F0A1E' }}>Questions</h1>
      <p className="mb-6" style={{ color: '#6B5F80' }}>
        Edit your quiz questions and answer options. Each answer maps to a result type. The result a prospect gets most often becomes their final result.
      </p>

      <div className="rounded-lg p-4 mb-8 max-w-[800px]" style={{ backgroundColor: 'rgba(217,70,239,0.08)', borderLeft: '3px solid rgba(217,70,239,0.3)' }}>
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#9A8EAA' }}>Answer &rarr; Result mapping</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {(['A', 'B', 'C', 'D'] as const).map((letter) => (
            <div key={letter} className="flex items-center gap-2 text-sm">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold text-white" style={{ backgroundColor: LETTER_COLOURS[letter] }}>
                {letter}
              </span>
              <span style={{ color: '#6B5F80' }}>{letterMap[letter]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="rounded-lg p-5 space-y-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(217,70,239,0.15)' }}>
            <div className="flex items-start gap-3">
              <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white" style={{ backgroundColor: '#D946EF' }}>
                Q{q.id}
              </span>
              <Input value={q.text} onChange={(e) => updateQuestionText(q.id, e.target.value)} className="font-medium" />
            </div>

            <div className="space-y-2 pl-11">
              {q.options.map((opt) => (
                <div key={opt.letter} className="flex items-center gap-2">
                  <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold text-white" style={{ backgroundColor: LETTER_COLOURS[opt.letter] }}>
                    {opt.letter}
                  </span>
                  <Input value={opt.text} onChange={(e) => updateOptionText(q.id, opt.letter, e.target.value)} className="text-sm" />
                  <span className="shrink-0 text-xs whitespace-nowrap" style={{ color: '#9A8EAA' }}>
                    &rarr; {letterMap[opt.letter as keyof typeof letterMap]}
                  </span>
                </div>
              ))}
            </div>

            <div className="pl-11">
              <Button size="sm" onClick={() => handleSave(q.id)} disabled={savingId === q.id} style={{ backgroundColor: '#F020B0', color: '#FFFFFF' }}>
                {savingId === q.id ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 max-w-[800px] rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(217,70,239,0.08)' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src="https://www.youtube.com/embed/CNhaPFePdqw"
            frameBorder="0"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            title="How to add your questions and answers"
          />
        </div>
      </div>

      <button
        onClick={() => window.open('https://www.youtube.com/watch?v=CNhaPFePdqw', 'pretaquiz-video', 'width=480,height=270')}
        className="flex items-center gap-1.5 text-xs font-medium mt-2 transition-colors hover:opacity-80"
        style={{ color: '#D946EF' }}
      >
        <PictureInPicture2 className="h-3.5 w-3.5" />
        Pop out video
      </button>
    </div>
  );
}
