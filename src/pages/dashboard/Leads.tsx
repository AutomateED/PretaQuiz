import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Trash2, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  result_type: string | null;
  quiz_slug: string;
  created_at: string | null;
  answers: Record<string, string> | null;
}

type SortField = 'name' | 'email' | 'result_type' | 'date';
type SortDir = 'asc' | 'desc';

export default function Leads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSlug, setFilterSlug] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quizNames, setQuizNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load leads:', error);
        setLeads([]);
      } else {
        setLeads((data as Lead[]) || []);
        const uniqueSlugs = [...new Set((data as Lead[]).map(l => l.quiz_slug).filter(Boolean))];
        if (uniqueSlugs.length > 0) {
          const { data: configs } = await supabase
            .from('quiz_configs')
            .select('slug, quiz_name')
            .in('slug', uniqueSlugs)
            .eq('client_id', user.id);
          if (configs) {
            const nameMap: Record<string, string> = {};
            configs.forEach((c: { slug: string; quiz_name: string | null }) => {
              nameMap[c.slug] = c.quiz_name || c.slug;
            });
            setQuizNames(nameMap);
          }
        }
      }
      setLoading(false);
    })();
  }, [user]);

  const slugs = useMemo(() => {
    const set = new Set(leads.map((l) => l.quiz_slug).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  const resultTypes = useMemo(() => {
    const set = new Set(leads.map((l) => l.result_type).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [leads]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'date' ? 'desc' : 'asc');
    }
  };

  const filtered = useMemo(() => {
    let list = filterSlug === 'all' ? leads : leads.filter((l) => l.quiz_slug === filterSlug);
    if (filterResult !== 'all') list = list.filter((l) => l.result_type === filterResult);

    return [...list].sort((a, b) => {
      let aVal = '';
      let bVal = '';
      if (sortField === 'name') {
        aVal = [a.first_name, a.last_name].filter(Boolean).join(' ').toLowerCase();
        bVal = [b.first_name, b.last_name].filter(Boolean).join(' ').toLowerCase();
      } else if (sortField === 'email') {
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
      } else if (sortField === 'result_type') {
        aVal = (a.result_type || '').toLowerCase();
        bVal = (b.result_type || '').toLowerCase();
      } else {
        aVal = a.created_at || '';
        bVal = b.created_at || '';
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, filterSlug, filterResult, sortField, sortDir]);

  useEffect(() => { setSelected(new Set()); }, [filterSlug, filterResult]);

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someSelected = filtered.some((l) => selected.has(l.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!user || selected.size === 0) return;
    setDeleting(true);
    const ids = Array.from(selected);
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', ids)
      .eq('client_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete leads. Please try again.', variant: 'destructive' });
    } else {
      const count = ids.length;
      setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
      setSelected(new Set());
      toast({ title: `${count} lead${count !== 1 ? 's' : ''} deleted` });
    }
    setDeleting(false);
  };

  const downloadCSV = () => {
    const toExport = selected.size > 0
      ? filtered.filter((l) => selected.has(l.id))
      : filtered;
    const headers = ['First Name', 'Last Name', 'Email', 'Result Type', 'Quiz', 'Date', 'Answers'];
    const rows = toExport.map((lead) => [
      lead.first_name || '',
      lead.last_name || '',
      lead.email,
      lead.result_type || '',
      lead.quiz_slug,
      lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB') : '',
      lead.answers
        ? Object.entries(lead.answers).map(([q, a]) => `${q}:${a}`).join(' | ')
        : '',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pretaquiz-leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSelected(new Set());
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5" />
      : <ArrowDown className="h-3.5 w-3.5" />;
  };

  const SortTh = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left px-5 py-3 font-semibold text-[#0F0A1E] dark:text-white cursor-pointer select-none hover:text-[#D946EF] transition-colors"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        <SortIcon field={field} />
      </span>
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div
          className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent"
          style={{ borderColor: '#D946EF', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#0F0A1E] dark:text-white">Your Leads</h1>
          <span
            className="rounded-full px-3 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: 'rgba(217,70,239,0.12)', color: '#D946EF' }}
          >
            {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
          </span>
          {filtered.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              style={{ borderColor: 'rgba(217,70,239,0.25)', color: '#D946EF' }}
            >
              <Download className="h-4 w-4" />
              {selected.size > 0 ? `Download ${selected.size} selected` : 'Download all'}
            </Button>
          )}
          {selected.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deleting}>
                  <Trash2 className="h-4 w-4" />
                  Delete selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selected.size} lead{selected.size !== 1 ? 's' : ''}?</AlertDialogTitle>
                  <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="flex items-center gap-3">
          {resultTypes.length > 1 && (
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="w-[200px]" style={{ borderColor: 'rgba(217,70,239,0.25)' }}>
                <SelectValue placeholder="All results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All results</SelectItem>
                {resultTypes.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {slugs.length > 1 && (
            <Select value={filterSlug} onValueChange={setFilterSlug}>
              <SelectTrigger className="w-[220px]" style={{ borderColor: 'rgba(217,70,239,0.25)' }}>
                <SelectValue placeholder="All quizzes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All quizzes</SelectItem>
                {slugs.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {leads.length > 0 && (
          <p className="text-xs mt-1" style={{ color: '#9A8EAA' }}>
            Tip: filter by result type first, then download to get a segmented list ready to import.{' '}
            <a href="/dashboard/integrations" style={{ color: '#D946EF' }}>
              How to import into your CRM
            </a>
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center bg-white dark:bg-[#201538]"
          style={{ border: '1px solid rgba(217,70,239,0.15)' }}
        >
          <p className="text-[#6B5F80] dark:text-[#9A8EAA]">
            {leads.length === 0
              ? 'No leads yet. Share your quiz link to get started.'
              : 'No leads match this filter.'}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(217,70,239,0.15)' }}
        >
          <table className="w-full text-sm bg-white dark:bg-[#201538]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.15)' }}>
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all leads"
                    className="border-[#D946EF]/40 data-[state=checked]:bg-[#D946EF] data-[state=checked]:border-[#D946EF]"
                  />
                </th>
                <SortTh field="name">Name</SortTh>
                <SortTh field="email">Email</SortTh>
                <SortTh field="result_type">Result</SortTh>
                <th className="text-left px-5 py-3 font-semibold text-[#0F0A1E] dark:text-white">Quiz</th>
                <SortTh field="date">Date</SortTh>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const isSelected = selected.has(lead.id);
                const isExpanded = expandedId === lead.id;
                const hasAnswers = lead.answers && Object.keys(lead.answers).length > 0;
                return (
                  <React.Fragment key={lead.id}>
                    <tr
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[rgba(217,70,239,0.08)] dark:bg-[rgba(217,70,239,0.12)]'
                          : 'hover:bg-[rgba(217,70,239,0.04)]'
                      }`}
                      onClick={() => toggleOne(lead.id)}
                      style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}
                    >
                      <td className="px-4 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(lead.id)}
                          aria-label={`Select ${lead.email}`}
                          className="border-[#D946EF]/40 data-[state=checked]:bg-[#D946EF] data-[state=checked]:border-[#D946EF]"
                        />
                      </td>
                      <td className="px-5 py-3 text-[#0F0A1E] dark:text-white">
                        {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="px-5 py-3 text-[#6B5F80] dark:text-[#9A8EAA]">{lead.email}</td>
                      <td className="px-5 py-3">
                        {lead.result_type ? (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
                            style={{ backgroundColor: 'rgba(217,70,239,0.10)', color: '#D946EF' }}
                          >
                            {lead.result_type}
                          </span>
                        ) : (
                          <span className="text-[#9A8EAA]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[#6B5F80] dark:text-[#9A8EAA]">
                          {quizNames[lead.quiz_slug] || lead.quiz_slug}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#6B5F80] dark:text-[#9A8EAA] whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-3 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                        {hasAnswers && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(isExpanded ? null : lead.id);
                            }}
                            className="p-1 rounded hover:bg-[rgba(217,70,239,0.10)] transition-colors"
                            aria-label={isExpanded ? 'Hide answers' : 'Show answers'}
                          >
                            {isExpanded
                              ? <ChevronUp className="h-4 w-4 text-[#D946EF]" />
                              : <ChevronDown className="h-4 w-4 text-[#9A8EAA]" />
                            }
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && hasAnswers && (
                      <tr key={`${lead.id}-expanded`} style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}>
                        <td colSpan={7} className="px-14 pb-4 pt-1">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(lead.answers!)
                              .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                              .map(([question, answer]) => (
                                <span
                                  key={question}
                                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                                  style={{ backgroundColor: 'rgba(217,70,239,0.08)', color: '#6B5F80' }}
                                >
                                  <span className="font-medium text-[#0F0A1E] dark:text-white">{question}</span>
                                  <span>·</span>
                                  <span className="text-[#D946EF] font-semibold">{answer}</span>
                                </span>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
