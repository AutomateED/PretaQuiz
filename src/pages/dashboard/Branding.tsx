import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { QuizConfig } from '@/hooks/useConfig';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, PictureInPicture2 } from 'lucide-react';

const FONT_OPTIONS = [
  { family: 'Playfair Display', label: 'Elegant Serif', fallback: 'serif' },
  { family: 'Lora', label: 'Warm Serif', fallback: 'serif' },
  { family: 'Cormorant Garamond', label: 'Editorial Serif', fallback: 'serif' },
  { family: 'Libre Baskerville', label: 'Classic Serif', fallback: 'serif' },
  { family: 'Montserrat', label: 'Bold Modern', fallback: 'sans-serif' },
  { family: 'Poppins', label: 'Friendly Modern', fallback: 'sans-serif' },
  { family: 'Raleway', label: 'Clean Elegant', fallback: 'sans-serif' },
  { family: 'DM Sans', label: 'Neutral Clean', fallback: 'sans-serif' },
  { family: 'Quicksand', label: 'Soft Rounded', fallback: 'sans-serif' },
  { family: 'Sacramento', label: 'Handwritten Script', fallback: 'cursive' },
] as const;

interface BrandingProps {
  config: QuizConfig;
  onConfigChange: React.Dispatch<React.SetStateAction<QuizConfig | null>>;
  userId: string;
  quizId: string;
}

export default function Branding({ config, onConfigChange, userId, quizId }: BrandingProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState(config.businessName);
  const [fullName, setFullName] = useState(config.fullName);
  const [email, setEmail] = useState(config.email);
  const [brandColour, setBrandColour] = useState(config.brandColour);
  const [logoUrl, setLogoUrl] = useState(config.logo);
  const [fontFamily, setFontFamily] = useState(config.fontFamily || 'Playfair Display');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(config.privacyPolicyUrl || '');
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    const { error } = await supabase
      .from('quiz_configs')
      .update({ privacy_policy_url: privacyPolicyUrl })
      .eq('id', quizId);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      onConfigChange((prev) => prev ? { ...prev, privacyPolicyUrl } : prev);
      toast({ title: 'Changes saved', description: 'Your privacy policy link has been updated.' });
    }
    setSavingPrivacy(false);
  };

  useEffect(() => {
    const id = 'branding-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Lora:wght@400;700&family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&family=Poppins:wght@400;700&family=Quicksand:wght@400;700&family=Raleway:wght@400;700&family=Sacramento&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a PNG, JPG, or SVG file.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}/logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
    setUploading(false);
    toast({ title: 'Logo uploaded' });
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('quiz_configs')
      .update({
        business_name: businessName,
        full_name: fullName,
        email,
        brand_colour: brandColour,
        logo_url: logoUrl || '',
        font_family: fontFamily,
      } as any)
      .eq('id', quizId);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      setSaving(false);
      return;
    }

    onConfigChange((prev) => prev ? { ...prev, businessName, fullName, email, brandColour, logo: logoUrl, fontFamily } : prev);

    toast({ title: 'Changes saved', description: 'Your branding settings have been updated.' });
    setSaving(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: '#0F0A1E' }}>Branding</h1>

      <div className="max-w-[600px] space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Elevate Coaching Co." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Your Full Name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Jane Smith" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. sarah@elevatecoaching.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandColour">Brand Colour</Label>
          <div className="flex items-center gap-3">
            <input id="brandColour" type="color" value={brandColour} onChange={(e) => setBrandColour(e.target.value)} className="h-10 w-14 rounded border cursor-pointer p-0.5" style={{ borderColor: 'rgba(217,70,239,0.15)' }} />
            <Input value={brandColour} onChange={(e) => setBrandColour(e.target.value)} className="max-w-[140px] font-mono text-sm" placeholder="#D946EF" />
            <div className="h-10 w-10 rounded-md shrink-0" style={{ backgroundColor: brandColour, border: '1px solid rgba(217,70,239,0.15)' }} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quiz Font</Label>
          <div className="grid grid-cols-2 gap-3">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.family}
                type="button"
                onClick={() => setFontFamily(opt.family)}
                className="rounded-lg border-2 p-4 text-left transition-colors"
                style={{
                  borderColor: fontFamily === opt.family ? '#D946EF' : 'rgba(217,70,239,0.15)',
                  backgroundColor: fontFamily === opt.family ? 'rgba(217,70,239,0.05)' : 'transparent',
                }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: '#9A8EAA' }}>{opt.label}</p>
                <p className="leading-snug" style={{ fontFamily: `'${opt.family}', ${opt.fallback}`, fontSize: 24, color: '#0F0A1E' }}>
                  What's Really Holding Your Business Back?
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Logo</Label>
          {logoUrl && (
            <div className="relative inline-block">
              <img src={logoUrl} alt="Logo preview" className="h-20 w-auto rounded-md object-contain bg-white p-2" style={{ border: '1px solid rgba(217,70,239,0.15)' }} />
              <button type="button" onClick={() => setLogoUrl('')} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2" style={{ borderColor: 'rgba(217,70,239,0.30)', color: '#D946EF' }}>
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload logo'}
            </Button>
            <p className="text-xs mt-1" style={{ color: '#9A8EAA' }}>PNG, JPG, or SVG. Displayed in your quiz.</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#F020B0', color: '#FFFFFF' }}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>

        <section className="space-y-3 pt-6" style={{ borderTop: '1px solid rgba(217,70,239,0.12)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#0F0A1E' }}>Privacy Policy</h2>
            <p className="text-sm mt-1" style={{ color: '#6B5F80' }}>
              Your quiz collects personal data. Adding your privacy policy URL means prospects can read it before submitting their details.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacyPolicyUrl">Your privacy policy URL</Label>
            <Input
              id="privacyPolicyUrl"
              value={privacyPolicyUrl}
              onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
              placeholder="https://yourwebsite.com/privacy"
              type="url"
            />
          </div>
          <Button onClick={handleSavePrivacy} disabled={savingPrivacy} style={{ backgroundColor: '#F020B0', color: '#FFFFFF' }}>
            {savingPrivacy ? 'Saving...' : 'Save'}
          </Button>
          <div
            className="rounded-lg px-4 py-3 text-sm leading-relaxed"
            style={{ backgroundColor: 'rgba(217,70,239,0.06)', border: '1px solid rgba(217,70,239,0.15)', color: '#6B5F80' }}
          >
            <span className="font-semibold" style={{ color: '#0F0A1E' }}>Don't have a privacy policy yet?</span>{' '}
            You'll need one before sharing your quiz with prospects.{' '}
            <a
              href="https://termly.7zqw8y.net/6kGNvE"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 font-medium"
              style={{ color: '#D946EF' }}
            >
              Termly
            </a>
            {' '}makes it straightforward — you can generate one in minutes, for free. (affiliate link)
          </div>
        </section>
      </div>
    </div>
  );
}