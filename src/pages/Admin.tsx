import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw, Users, UserCheck, Target, AlertTriangle, DollarSign,
  KeyRound, Mail, Trash2, ExternalLink, ChevronDown, Shield, ArchiveRestore, Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';

const ADMIN_EMAIL = 'hello@pretaquiz.com';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const C = {
  bg: '#0F0A1E',
  card: '#201538',
  border: '#2D1A4A',
  accent: '#D946EF',
  cta: '#F020B0',
  white: '#FFFFFF',
  body: 'rgba(255,255,255,0.85)',
  muted: 'rgba(255,255,255,0.6)',
  amber: '#F59E0B',
  green: '#22C55E',
  red: '#EF4444',
};

interface Stats {
  totalClients: number;
  activeClients: number;
  totalLeads: number;
  zeroQuestionQuizzes: number;
  estRevenue: number;
}

interface ClientRow {
  id: string;
  email: string;
  business_name: string;
  subscription_status: string;
  notes: string;
  last_login: string | null;
  quiz_slug: string | null;
  template_type: string | null;
  questions_count: number;
  setup_score: number;
  lead_count: number;
}

interface LeadRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  result_type: string | null;
  quiz_slug: string;
  created_at: string;
  client_email: string | null;
  client_business: string | null;
}

interface ArchivedRow {
  id: string;
  email: string;
  business_name: string | null;
  subscription_status: string | null;
  lead_count: number | null;
  archived_at: string | null;
  archived_reason: string | null;
}
export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [archived, setArchived] = useState<ArchivedRow[]>([]);
  // Grant access form
  const [grantEmail, setGrantEmail] = useState('');
  const [grantName, setGrantName] = useState('');
  const [grantBusiness, setGrantBusiness] = useState('');
  const [granting, setGranting] = useState(false);

  // Notes state
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>({});
  const [deleteReasons, setDeleteReasons] = useState<Record<string, string>>({});

  // Redirect non-admin
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (!authLoading && user && user.email !== ADMIN_EMAIL) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const getHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');
    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-dashboard`, { headers });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setStats(data.stats);
      setClients(data.clients);
      setLeads(data.leads);
      // Init notes
      const nm: Record<string, string> = {};
      data.clients.forEach((c: ClientRow) => { nm[c.id] = c.notes || ''; });
      setNotesMap(nm);
    } catch (err: any) {
      toast({ title: 'Failed to load data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [getHeaders, toast]);

  const adminAction = useCallback(async (action: string, payload: object) => {
    const headers = await getHeaders();
    const r = await fetch(`${SUPABASE_URL}/functions/v1/admin-actions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...payload }),
    });
    return r.json();
  }, [getHeaders]);

  const loadArchived = useCallback(async () => {
    try {
      const res = await adminAction('list_archived', {});
      if (res.archived) setArchived(res.archived);
    } catch { /* silent */ }
  }, [adminAction]);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      loadData();
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL && adminAction) {
      loadArchived();
    }
  }, [user?.email, loadArchived]);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim()) return;
    setGranting(true);
    try {
      const res = await adminAction('grant_access', {
        email: grantEmail.trim(),
        full_name: grantName.trim(),
        business_name: grantBusiness.trim(),
      });
      if (res.error) throw new Error(res.error);
      toast({ title: 'Access granted', description: res.message });
      setGrantEmail(''); setGrantName(''); setGrantBusiness('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGranting(false);
    }
  };

  const handleAction = async (action: string, payload: object, successMsg: string) => {
    try {
      const res = await adminAction(action, payload);
      if (res.error) throw new Error(res.error);
      toast({ title: successMsg, description: res.message });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const saveNotes = useCallback(async (clientId: string, notes: string) => {
    try {
      await adminAction('save_notes', { client_id: clientId, notes });
      setSavedNotes((p) => ({ ...p, [clientId]: true }));
      setTimeout(() => setSavedNotes((p) => ({ ...p, [clientId]: false })), 2000);
    } catch { /* silent */ }
  }, [adminAction]);

  if (authLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: C.bg }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: C.accent, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const statusColor = (s: string) => s === 'active' ? C.green : s === 'trial' ? C.amber : C.red;

  const warningClients = clients.filter((c) => c.quiz_slug && c.questions_count === 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <div className="flex items-center justify-between px-6 py-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" style={{ color: C.accent }} />
            <h1 className="text-lg font-bold" style={{ color: C.white }}>
              <span>Preta</span><span style={{ color: C.accent }}>Quiz</span> Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/blog">
              <Button variant="outline" size="sm" style={{ borderColor: C.border, color: C.body }}>
                Manage Blog
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="sm" style={{ borderColor: C.border, color: C.body }}>
                Dashboard
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="gap-2"
              style={{ backgroundColor: C.cta, color: C.white }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: C.accent, borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Section 1 — Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Clients', value: stats?.totalClients ?? 0, icon: Users, color: C.accent },
                { label: 'Active Clients', value: stats?.activeClients ?? 0, icon: UserCheck, color: C.green },
                { label: 'Total Leads', value: stats?.totalLeads ?? 0, icon: Target, color: C.accent },
                { label: '0-Question Quizzes', value: stats?.zeroQuestionQuizzes ?? 0, icon: AlertTriangle, color: (stats?.zeroQuestionQuizzes ?? 0) > 0 ? C.amber : C.muted },
                { label: 'Est. Revenue', value: `$${stats?.estRevenue ?? 0}`, icon: DollarSign, color: C.green },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-5 border" style={{ backgroundColor: C.card, borderColor: C.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className="h-4 w-4" style={{ color: s.color }} />
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: C.muted }}>{s.label}</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: C.white }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Section 2 — Grant Access */}
            <div className="rounded-xl border p-6" style={{ backgroundColor: C.card, borderColor: C.border }}>
              <h2 className="text-base font-bold mb-4" style={{ color: C.white }}>Grant Access</h2>
              <form onSubmit={handleGrant} className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs" style={{ color: C.muted }}>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={grantEmail}
                    onChange={(e) => setGrantEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="mt-1"
                    style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
                  />
                </div>
                <div className="min-w-[160px]">
                  <Label className="text-xs" style={{ color: C.muted }}>Full name</Label>
                  <Input
                    value={grantName}
                    onChange={(e) => setGrantName(e.target.value)}
                    placeholder="Jane Smith"
                    className="mt-1"
                    style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
                  />
                </div>
                <div className="min-w-[160px]">
                  <Label className="text-xs" style={{ color: C.muted }}>Business name</Label>
                  <Input
                    value={grantBusiness}
                    onChange={(e) => setGrantBusiness(e.target.value)}
                    placeholder="Business Co"
                    className="mt-1"
                    style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
                  />
                </div>
                <Button type="submit" disabled={granting} style={{ backgroundColor: C.cta, color: C.white }}>
                  {granting ? 'Granting…' : 'Grant Access'}
                </Button>
              </form>
            </div>

            {/* Section 3 — Clients table */}
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: C.border }}>
                <h2 className="text-base font-bold" style={{ color: C.white }}>Clients ({clients.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ color: C.body }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Email', 'Business', 'Status', 'Quiz', 'Last login', 'Setup', 'Leads', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium" style={{ color: C.white }}>{c.email}</td>
                        <td className="px-4 py-3">{c.business_name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${statusColor(c.subscription_status)}20`, color: statusColor(c.subscription_status) }}>
                            {c.subscription_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.quiz_slug ? (
                            <a href={`/quiz/${c.quiz_slug}`} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: C.accent }}>
                              {c.quiz_slug}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs">{c.last_login ? new Date(c.last_login).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono" style={{ color: c.setup_score >= 4 ? C.green : c.setup_score >= 2 ? C.amber : C.muted }}>
                            {c.setup_score}/5
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono" style={{ color: c.lead_count > 0 ? '#22C55E' : 'rgba(255,255,255,0.6)' }}>
                            {c.lead_count}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAction('password_reset', { email: c.email }, 'Reset sent')}>
                                  <KeyRound className="h-3.5 w-3.5" style={{ color: C.body }} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reset password</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAction('resend_invite', { email: c.email }, 'Invite resent')}>
                                  <Mail className="h-3.5 w-3.5" style={{ color: C.body }} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Resend invite</TooltipContent>
                            </Tooltip>

                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <ChevronDown className="h-3.5 w-3.5" style={{ color: C.body }} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Change status</TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent>
                                {['active', 'trial', 'inactive'].map((s) => (
                                  <DropdownMenuItem key={s} onClick={() => handleAction('toggle_status', { client_id: c.id, status: s }, `Status → ${s}`)}>
                                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: statusColor(s) }} />
                                    {s}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open('/dashboard', '_blank')}>
                                  <ExternalLink className="h-3.5 w-3.5" style={{ color: C.body }} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View as client</TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Trash2 className="h-3.5 w-3.5" style={{ color: C.red }} />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete client</TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {c.email}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will archive the client and permanently delete their account, quiz, and all associated leads.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-2">
                                  <Label className="text-xs text-muted-foreground">Reason (optional)</Label>
                                  <Input
                                    value={deleteReasons[c.id] || ''}
                                    onChange={(e) => setDeleteReasons((p) => ({ ...p, [c.id]: e.target.value }))}
                                    placeholder="e.g. cancelled subscription, spam account…"
                                    className="mt-1"
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      handleAction('delete_client', { client_id: c.id, email: c.email, reason: deleteReasons[c.id] || 'manual_delete' }, 'Client deleted & archived');
                                      loadArchived();
                                    }}
                                    style={{ backgroundColor: C.red }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: C.muted }}>No clients yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5 — Client Notes */}
            <div className="rounded-xl border p-6" style={{ backgroundColor: C.card, borderColor: C.border }}>
              <h2 className="text-base font-bold mb-4" style={{ color: C.white }}>Client Notes</h2>
              <div className="space-y-3">
                {clients.map((c) => (
                  <Collapsible key={c.id}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors" style={{ color: C.body }}>
                      <span>{c.email}</span>
                      <div className="flex items-center gap-2">
                        {savedNotes[c.id] && <span className="text-xs" style={{ color: C.green }}>Saved</span>}
                        <ChevronDown className="h-4 w-4" style={{ color: C.muted }} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-2">
                      <Textarea
                        value={notesMap[c.id] || ''}
                        onChange={(e) => setNotesMap((p) => ({ ...p, [c.id]: e.target.value }))}
                        onBlur={() => saveNotes(c.id, notesMap[c.id] || '')}
                        placeholder="Add notes about this client…"
                        rows={3}
                        className="mt-2 resize-none text-sm"
                        style={{ backgroundColor: C.bg, borderColor: C.border, color: C.white }}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>

            {/* Section 4 — Leads table */}
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: C.border }}>
                <h2 className="text-base font-bold" style={{ color: C.white }}>Leads ({leads.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ color: C.body }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Name', 'Email', 'Result', 'Quiz', 'Client', 'Date'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">{[l.first_name, l.last_name].filter(Boolean).join(' ') || '—'}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: C.white }}>{l.email}</td>
                        <td className="px-4 py-3 text-xs">{l.result_type || '—'}</td>
                        <td className="px-4 py-3">
                          <a href={`/quiz/${l.quiz_slug}`} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 text-xs" style={{ color: C.accent }}>
                            {l.quiz_slug}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-xs">{l.client_business || l.client_email || '—'}</td>
                        <td className="px-4 py-3 text-xs">{l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: C.muted }}>No leads yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 6 — System health warnings */}
            {warningClients.length > 0 && (
              <div className="rounded-xl border p-6" style={{ backgroundColor: C.card, borderColor: C.border }}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5" style={{ color: C.amber }} />
                  <h2 className="text-base font-bold" style={{ color: C.white }}>System Warnings</h2>
                </div>
                <div className="space-y-2">
                  {warningClients.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: `${C.amber}10`, border: `1px solid ${C.amber}30` }}>
                      <div>
                        <span className="text-sm font-medium" style={{ color: C.amber }}>{c.email}</span>
                        <span className="text-xs ml-2" style={{ color: C.muted }}>has 0 questions configured</span>
                      </div>
                      <a href={`/quiz/${c.quiz_slug}`} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: C.accent }}>
                        View quiz →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 7 — Archived Clients */}
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                <Archive className="h-4 w-4" style={{ color: C.muted }} />
                <h2 className="text-base font-bold" style={{ color: C.white }}>Archived Clients ({archived.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ color: C.body }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Email', 'Business', 'Status', 'Leads', 'Archived', 'Reason', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {archived.map((a) => (
                      <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium" style={{ color: C.white }}>{a.email}</td>
                        <td className="px-4 py-3">{a.business_name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${statusColor(a.subscription_status || 'inactive')}20`, color: statusColor(a.subscription_status || 'inactive') }}>
                            {a.subscription_status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{a.lead_count ?? 0}</td>
                        <td className="px-4 py-3 text-xs">{a.archived_at ? new Date(a.archived_at).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-xs">{a.archived_reason || '—'}</td>
                        <td className="px-4 py-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-xs"
                                style={{ color: C.green }}
                                onClick={async () => {
                                  try {
                                    const res = await adminAction('restore_client', { client_id: a.id });
                                    if (res.error) throw new Error(res.error);
                                    toast({ title: 'Client restored', description: res.message });
                                    loadData();
                                    loadArchived();
                                  } catch (err: any) {
                                    toast({ title: 'Error', description: err.message, variant: 'destructive' });
                                  }
                                }}
                              >
                                <ArchiveRestore className="h-3.5 w-3.5" />
                                Restore
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Restore this client</TooltipContent>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                    {archived.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: C.muted }}>No archived clients</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
