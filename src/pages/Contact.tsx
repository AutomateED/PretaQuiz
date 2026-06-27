import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const C = {
  pageBg: '#0F0A1E',
  cardBg: '#201538',
  cardBorder: '#2D1A4A',
  accent: '#D946EF',
  cta: '#F020B0',
  headline: '#FFFFFF',
  body: 'rgba(255,255,255,0.85)',
  supporting: 'rgba(255,255,255,0.75)',
  footnote: 'rgba(255,255,255,0.70)',
};

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email is too long'),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message is too long'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('contact_submissions').insert({
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
    });

    if (error) {
      toast({ title: 'Something went wrong', description: 'Please try again or email us directly.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.pageBg }}>
      <header>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center">
          <Link to="/" className="text-xl font-bold hover:opacity-85 transition-opacity">
            <span className="text-white">Preta</span>
            <span style={{ color: '#D946EF' }}>Quiz</span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(217,70,239,0.15)' }}
            >
              <CheckCircle2 className="h-8 w-8" style={{ color: C.accent }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: C.headline }}>
              Message sent!
            </h1>
            <p className="text-sm mb-6" style={{ color: C.body }}>
              Thanks for reaching out. We'll get back to you at{' '}
              <span className="font-medium" style={{ color: C.headline }}>{form.email}</span>{' '}
              as soon as possible.
            </p>
            <Link to="/">
              <Button
                variant="outline"
                className="gap-2"
                style={{ borderColor: C.cardBorder, color: C.supporting }}
              >
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: C.headline }}>
              Get in touch
            </h1>
            <p className="text-sm mb-8" style={{ color: C.body }}>
              Have a question or need help? Fill in the form below or email us directly at{' '}
              <a
                href="mailto:hello@pretaquiz.com"
                className="underline hover:opacity-80"
                style={{ color: C.accent }}
              >
                hello@pretaquiz.com
              </a>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-sm font-medium" style={{ color: C.supporting }}>
                  Name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className="mt-1.5"
                  style={{
                    backgroundColor: C.cardBg,
                    borderColor: errors.name ? '#ef4444' : C.cardBorder,
                    color: C.headline,
                  }}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: C.supporting }}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                  className="mt-1.5"
                  style={{
                    backgroundColor: C.cardBg,
                    borderColor: errors.email ? '#ef4444' : C.cardBorder,
                    color: C.headline,
                  }}
                />
                {errors.email && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium" style={{ color: C.supporting }}>
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="How can we help?"
                  maxLength={2000}
                  rows={5}
                  className="mt-1.5 resize-none"
                  style={{
                    backgroundColor: C.cardBg,
                    borderColor: errors.message ? '#ef4444' : C.cardBorder,
                    color: C.headline,
                  }}
                />
                {errors.message && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-2 font-semibold"
                style={{ backgroundColor: C.cta, color: '#FFFFFF' }}
              >
                {submitting ? 'Sending…' : (
                  <>
                    <Send className="h-4 w-4" /> Send message
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
