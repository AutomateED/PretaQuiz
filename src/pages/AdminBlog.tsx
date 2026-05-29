import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Trash2, ArrowLeft, Plus, Pencil, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ADMIN_EMAIL = 'hello@pretaquiz.com';

const C = {
  bg: '#0F0A1E',
  card: '#201538',
  border: '#2D1A4A',
  accent: '#D946EF',
  cta: '#F020B0',
  white: '#FFFFFF',
  body: 'rgba(255,255,255,0.85)',
  muted: 'rgba(255,255,255,0.6)',
  red: '#EF4444',
  green: '#22C55E',
  amber: '#F59E0B',
};

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  published: boolean;
  created_at: string;
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

export default function AdminBlog() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    else if (!authLoading && user && user.email !== ADMIN_EMAIL) navigate('/dashboard');
  }, [user, authLoading, navigate]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      toast({ title: 'Error loading posts', description: error.message, variant: 'destructive' });
    } else {
      setPosts((data as unknown as BlogPostRow[]) || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) loadPosts();
  }, [user?.email, loadPosts]);

  const autoSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) setSlug(autoSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setSlugManual(true);
    setSlug(val);
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setSlugManual(false);
    setDate(new Date().toISOString().split('T')[0]);
    setExcerpt('');
    setContent('');
    setPublished(true);
    setEditingId(null);
  };

  const startEdit = (p: BlogPostRow) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setSlugManual(true);
    setDate(p.date);
    setExcerpt(p.excerpt || '');
    setContent(p.content || '');
    setPublished(p.published !== false);
    setTimeout(() => {
      document.getElementById('post-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSave = async (e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();
    if (!title.trim() || !slug.trim()) return false;
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      date,
      excerpt: excerpt.trim(),
      content: content.trim(),
      published,
    };

    let success = false;
    if (editingId) {
      const { error } = await supabase
        .from('blog_posts')
        .update(payload as any)
        .eq('id', editingId);
      if (error) {
        toast({ title: 'Error updating post', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Post updated!' });
        resetForm();
        loadPosts();
        success = true;
      }
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload as any);
      if (error) {
        toast({ title: 'Error saving post', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Post saved!' });
        resetForm();
        loadPosts();
        success = true;
      }
    }
    setSaving(false);
    return success;
  };

  const handlePublishAndDeploy = async () => {
    const ok = await handleSave();
    if (!ok) return;
    setDeploying(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      await fetch('https://sgllwxhabdhjldhpnnsg.supabase.co/functions/v1/trigger-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      toast({ title: 'Deploy triggered!' });
    } catch (err: any) {
      toast({ title: 'Deploy failed', description: err?.message || 'Unknown error', variant: 'destructive' });
    }
    setTimeout(() => setDeploying(false), 5000);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting post', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Post deleted' });
      if (editingId === id) resetForm();
      loadPosts();
    }
  };

  const handleTogglePublished = async (p: BlogPostRow) => {
    const next = !(p.published !== false);
    // Optimistic update
    setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: next } : x)));
    const { error } = await supabase
      .from('blog_posts')
      .update({ published: next } as any)
      .eq('id', p.id);
    if (error) {
      // Revert
      setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: !next } : x)));
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: next ? 'Post published' : 'Post set to draft' });
    }
  };

  if (authLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: C.bg }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: C.accent, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <div className="flex items-center justify-between px-6 py-4 max-w-[1000px] mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" style={{ color: C.accent }} />
            <h1 className="text-lg font-bold" style={{ color: C.white }}>
              Blog Manager
            </h1>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-2" style={{ borderColor: C.border, color: C.body }}>
              <ArrowLeft className="h-4 w-4" /> Back to Admin
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-6 py-8 space-y-8">
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: C.border }}>
            <h2 className="text-base font-bold" style={{ color: C.white }}>Blog Posts</h2>
            <span className="text-xs flex items-center gap-1.5" style={{ color: C.green }}>
              <Eye className="h-3 w-3" /> {posts.filter((p) => p.published !== false).length} published
            </span>
            <span className="text-xs" style={{ color: C.muted }}>·</span>
            <span className="text-xs flex items-center gap-1.5" style={{ color: C.amber }}>
              <EyeOff className="h-3 w-3" /> {posts.filter((p) => p.published === false).length} draft{posts.filter((p) => p.published === false).length === 1 ? '' : 's'}
            </span>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent" style={{ borderColor: C.accent, borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <table className="w-full text-sm" style={{ color: C.body }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Title', 'Slug', 'Date', 'Read time', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => {
                  const isEditing = editingId === p.id;
                  return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      backgroundColor: isEditing ? 'rgba(217,70,239,0.08)' : undefined,
                    }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: C.white }}>
                      <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: C.white }}>
                        {p.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: C.accent }}>{p.slug}</td>
                    <td className="px-4 py-3 text-xs">{p.date}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: C.muted }}>{readTime(p.content || '')}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const isLive = p.published !== false;
                        return (
                          <button
                            type="button"
                            onClick={() => handleTogglePublished(p)}
                            title={isLive ? 'Click to set as draft' : 'Click to publish'}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                            style={{
                              backgroundColor: isLive ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                              color: isLive ? C.green : C.amber,
                            }}
                          >
                            {isLive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {isLive ? 'Live' : 'Draft'}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => startEdit(p)}
                          title="Edit post"
                        >
                          <Pencil className="h-3.5 w-3.5" style={{ color: C.accent }} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Trash2 className="h-3.5 w-3.5" style={{ color: C.red }} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{p.title}"?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently remove the blog post.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(p.id)} style={{ backgroundColor: C.red }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {posts.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: C.muted }}>No posts yet</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div id="post-form" className="rounded-xl border p-6" style={{ backgroundColor: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {editingId ? (
                <Pencil className="h-5 w-5" style={{ color: C.accent }} />
              ) : (
                <Plus className="h-5 w-5" style={{ color: C.accent }} />
              )}
              <h2 className="text-base font-bold" style={{ color: C.white }}>
                {editingId ? 'Edit Post' : 'Add New Post'}
              </h2>
            </div>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="gap-2"
                style={{ borderColor: C.border, color: C.body }}
              >
                <X className="h-4 w-4" /> Cancel edit
              </Button>
            )}
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs" style={{ color: C.muted }}>Title *</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Post title"
                  className="mt-1"
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: C.muted }}>Slug *</Label>
                <Input
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="post-slug"
                  className="mt-1 font-mono text-sm"
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label className="text-xs" style={{ color: C.muted }}>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-48"
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
                />
              </div>
              <div>
                <Label className="text-xs block" style={{ color: C.muted }}>Status</Label>
                <button
                  type="button"
                  onClick={() => setPublished((v) => !v)}
                  title={published ? 'Click to set as draft' : 'Click to publish'}
                  className="mt-1 inline-flex items-center gap-2 h-10 px-4 rounded-md border text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{
                    borderColor: C.border,
                    backgroundColor: published ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                    color: published ? C.green : C.amber,
                  }}
                >
                  {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {published ? 'Published' : 'Draft'}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs" style={{ color: C.muted }}>Excerpt</Label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="2-3 sentence summary…"
                rows={3}
                className="mt-1 resize-none"
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Label className="text-xs" style={{ color: C.muted }}>Content (Markdown)</Label>
                <span className="text-xs tabular-nums" style={{ color: C.muted }}>
                  {wordCount(content)} word{wordCount(content) === 1 ? '' : 's'} · {readTime(content)}
                </span>
              </div>
              <p className="text-[11px] mt-1 mb-2 font-mono" style={{ color: C.muted }}>
                ## Heading 2 · ### Heading 3 · **bold** · - bullet · 1. numbered · --- divider
              </p>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post in markdown…"
                rows={16}
                className="font-mono text-sm"
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button type="submit" disabled={saving || deploying} style={{ backgroundColor: C.cta, color: C.white }}>
                {saving ? 'Saving…' : editingId ? 'Update Post' : 'Save Post'}
              </Button>
              <Button
                type="button"
                onClick={handlePublishAndDeploy}
                disabled={saving || deploying}
                style={{ backgroundColor: C.green, color: C.white }}
              >
                {deploying ? 'Deploying…' : 'Publish & Deploy'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
