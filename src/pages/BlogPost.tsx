import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { blogPosts as staticPosts } from '@/data/blogPosts';
import Footer from '@/components/Footer';

const C = {
  pageBg: '#0F0A1E',
  border: '#2D1A4A',
  accent: '#D946EF',
  cta: '#F020B0',
  headline: '#FFFFFF',
  body: 'rgba(255,255,255,0.85)',
  supporting: 'rgba(255,255,255,0.75)',
  muted: 'rgba(255,255,255,0.60)',
  amber: '#F59E0B',
};

interface Post {
  title: string;
  slug: string;
  date: string;
  content: string;
  published?: boolean;
}

function wordCount(text: string): number {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function readTime(text: string): string {
  const minutes = Math.max(1, Math.round(wordCount(text) / 200));
  return `${minutes} min read`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  // Valid slugs are lowercase alphanumerics and hyphens only.
  // This rejects literal ":slug", encoded ":" / "%3A", and any other malformed value
  // synchronously so we never hit Supabase or flash a loader for bogus URLs.
  const isValidSlug = !!slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

  useEffect(() => {
    if (!isValidSlug) { setPost(null); return; }

    supabase
      .from('blog_posts')
      .select('title, slug, date, content, published')
      .eq('slug', slug as string)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPost(data as unknown as Post);
        } else {
          const staticPost = staticPosts.find((p) => p.slug === slug);
          setPost(staticPost || null);
        }
      });
  }, [slug, isValidSlug]);

  if (!isValidSlug) return <Navigate to="/blog" replace />;



  if (post === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: C.pageBg }}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: C.accent, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!post) return <Navigate to="/blog" replace />;

  const isDraft = post.published === false;

  // Redirect draft posts — don't render content publicly
  if (isDraft) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.pageBg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav className="bg-[#0F0A1E]/95 backdrop-blur-md border-b border-[#2D1A4A]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold" style={{ color: C.headline }}>
            Preta<span style={{ color: C.accent }}>Quiz</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/blog" className="text-sm font-medium" style={{ color: C.accent }}>Blog</Link>
            <Link to="/login" className="text-sm font-medium" style={{ color: C.supporting }}>Login</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[720px] mx-auto px-5 py-16 w-full">
        <Link to="/blog" className="text-sm font-medium mb-8 inline-block transition-colors hover:underline" style={{ color: C.accent }}>
          ← Back to Blog
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: C.headline }}>
          {post.title}
        </h1>
        <p className="text-sm mb-10" style={{ color: C.muted }}>
          {formatDate(post.date)} · {readTime(post.content || '')}
        </p>

        <article className="prose prose-invert prose-lg max-w-none" style={{ color: C.body }}>
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-10 mb-4" style={{ color: C.headline }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: C.headline }}>{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-5 leading-relaxed" style={{ color: C.body }}>{children}</p>
              ),
              a: ({ href, children }) => (
                <a href={href} className="underline underline-offset-2 font-medium" style={{ color: C.accent }} target="_blank" rel="noopener noreferrer">{children}</a>
              ),
              ul: ({ children }) => (
                <ul className="list-none pl-0 mb-5 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-none pl-0 mb-5 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-3 leading-relaxed" style={{ color: C.body }}>
                  <span
                    className="inline-block rounded-full flex-shrink-0"
                    style={{ backgroundColor: C.accent, width: '6px', height: '6px', marginTop: '0.65em' }}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{children}</span>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold" style={{ color: C.headline }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic" style={{ color: C.supporting }}>{children}</em>
              ),
              hr: () => (
                <hr className="my-12 border-0 border-t" style={{ borderColor: C.border }} />
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className="my-6 pl-5 italic"
                  style={{ borderLeft: `3px solid ${C.accent}`, color: C.supporting }}
                >
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code
                  className="px-1.5 py-0.5 rounded font-mono text-[0.9em]"
                  style={{ backgroundColor: 'rgba(217,70,239,0.12)', color: C.accent }}
                >
                  {children}
                </code>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        <div className="mt-16 pt-10 border-t border-[#2D1A4A] text-center">
          <p className="text-xl font-semibold mb-5" style={{ color: C.headline }}>
            Ready to get your quiz live?
          </p>
          <Link
            to="/#pricing"
            className="inline-block text-sm font-semibold text-white px-7 py-3 rounded-lg transition-all hover:shadow-lg active:scale-[0.98]"
            style={{ backgroundColor: C.cta }}
          >
            Get started — $97
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
