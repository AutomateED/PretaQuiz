import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { QuizConfig } from '@/hooks/useConfig';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface IntegrationsProps {
  config: QuizConfig;
  onConfigChange: React.Dispatch<React.SetStateAction<QuizConfig | null>>;
  userId: string;
  quizId: string;
}

const C = {
  bg: '#FFFFFF',
  pageBg: '#F8F7FF',
  border: 'rgba(217,70,239,0.15)',
  accent: '#D946EF',
  cta: '#F020B0',
  headline: '#0F0A1E',
  body: '#4A4060',
  supporting: '#6B5F80',
  infoBg: 'rgba(217,70,239,0.06)',
  infoBorder: 'rgba(217,70,239,0.25)',
  stepBg: 'rgba(217,70,239,0.04)',
};

interface Guide {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  nativeWebhook: boolean;
  steps: { title: string; detail: string }[];
  webhookFieldLabel: string;
  docsUrl: string;
}

const GUIDES: Guide[] = [
  {
    id: 'zapier',
    name: 'Zapier',
    logo: '⚡',
    tagline: 'Connects PretaQuiz to 6,000+ apps. Best if your tool is not listed here.',
    nativeWebhook: false,
    webhookFieldLabel: 'Zapier Webhook URL',
    docsUrl: 'https://zapier.com/apps/webhook/integrations',
    steps: [
      { title: 'Go to zapier.com and click Create Zap', detail: 'Log in to your Zapier account and click the orange "Create Zap" button in the top left.' },
      { title: 'Choose Webhooks by Zapier as the trigger', detail: 'Search for "Webhooks by Zapier" in the trigger search box. Select it, then choose "Catch Hook" as the trigger event. Click Continue.' },
      { title: 'Copy your webhook URL', detail: 'Zapier will generate a unique webhook URL. It looks like: https://hooks.zapier.com/hooks/catch/123456/abcdef/. Copy this URL — this is what you paste into PretaQuiz.' },
      { title: 'Paste it into PretaQuiz and save', detail: 'Paste the URL into the webhook field above and click Save. Then complete a test run of your quiz so Zapier can see a real data sample.' },
      { title: 'Come back to Zapier and click Test Trigger', detail: 'Zapier will pick up the test lead you just submitted. You will see all the fields PretaQuiz sends: first_name, last_name, email, result_type, result_copy, answers, quiz_name, timestamp.' },
      { title: 'Set up your action', detail: 'Now add an action — for example, "Add Subscriber to List" in Mailchimp, or "Create Contact" in HubSpot. Map the fields from PretaQuiz to the fields in your tool. Turn on your Zap.' },
    ],
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    logo: '⚙️',
    tagline: 'More powerful than Zapier for complex automations. Free tier is generous.',
    nativeWebhook: false,
    webhookFieldLabel: 'Make Webhook URL',
    docsUrl: 'https://www.make.com/en/integrations/webhooks',
    steps: [
      { title: 'Go to make.com and create a new scenario', detail: 'Log in and click "Create a new scenario" from your dashboard.' },
      { title: 'Add a Webhooks module as the trigger', detail: 'Search for "Webhooks" and select the "Custom webhook" module. Click "Add" to create a new webhook.' },
      { title: 'Copy your webhook URL', detail: 'Make will generate a URL like: https://hook.eu1.make.com/abc123xyz. Copy this URL.' },
      { title: 'Paste it into PretaQuiz and save', detail: 'Paste the URL into the webhook field above and click Save. Run a test quiz submission so Make receives sample data.' },
      { title: 'Click OK in Make — it will detect your data structure', detail: 'After your test submission, Make automatically maps all the fields PretaQuiz sends. You will see first_name, last_name, email, result_type, result_copy, answers, and timestamp.' },
      { title: 'Add your next module and activate the scenario', detail: 'Add your action — such as adding a contact to ActiveCampaign or sending an email via Gmail. Map the PretaQuiz fields to your tool and turn on the scenario.' },
    ],
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    logo: '📧',
    tagline: 'Use Zapier or Make to connect PretaQuiz to ActiveCampaign.',
    nativeWebhook: false,
    webhookFieldLabel: 'Zapier or Make Webhook URL',
    docsUrl: 'https://zapier.com/apps/activecampaign/integrations',
    steps: [
      { title: 'ActiveCampaign does not offer a direct inbound webhook for adding contacts', detail: 'You will need to connect via Zapier or Make. Follow the Zapier or Make guide above to get your webhook URL first.' },
      { title: 'In Zapier or Make, set ActiveCampaign as your action', detail: 'Search for ActiveCampaign in the action step. Choose "Create or Update Contact" as the action event.' },
      { title: 'Connect your ActiveCampaign account', detail: 'You will need your ActiveCampaign API URL and API Key. Find these in ActiveCampaign under Settings → Developer.' },
      { title: 'Map the PretaQuiz fields to ActiveCampaign contact fields', detail: 'Map first_name → First Name, last_name → Last Name, email → Email. For result_type, you can map it to a custom field or a tag — tags work well for segmenting by quiz result.' },
      { title: 'Add a tag based on result type (recommended)', detail: 'In Zapier, add a second action: "Add Tag to Contact" in ActiveCampaign. Set the tag value to the result_type field from PretaQuiz. This lets you trigger different automations based on which result the prospect received.' },
      { title: 'Test and activate', detail: 'Run a test quiz submission and confirm the contact appears in ActiveCampaign with the correct tag. Then turn on your Zap or Make scenario.' },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    logo: '🐒',
    tagline: 'Use Zapier or Make to add PretaQuiz leads to your Mailchimp audience.',
    nativeWebhook: false,
    webhookFieldLabel: 'Zapier or Make Webhook URL',
    docsUrl: 'https://zapier.com/apps/mailchimp/integrations',
    steps: [
      { title: 'Mailchimp does not accept direct inbound webhooks for adding subscribers', detail: 'You will connect via Zapier or Make. Follow the Zapier or Make guide above to get your webhook URL first.' },
      { title: 'In Zapier or Make, set Mailchimp as your action', detail: 'Search for Mailchimp and choose "Add/Update Subscriber" as the action event.' },
      { title: 'Connect your Mailchimp account and choose your audience', detail: 'Select the audience (list) where you want PretaQuiz leads to appear.' },
      { title: 'Map the PretaQuiz fields', detail: 'Map email → Email Address, first_name → FNAME, last_name → LNAME. Set Status to "Subscribed" if you want them added immediately, or "Pending" if you want them to confirm first.' },
      { title: 'Add a tag based on result type (recommended)', detail: 'In the same Zapier action, scroll to Tags and set the value to the result_type field from PretaQuiz. This lets you send different follow-up sequences to The Invisible Expert versus The Plateau Breaker, for example.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the subscriber appears in your Mailchimp audience with the correct tag.' },
    ],
  },
  {
    id: 'kit',
    name: 'Kit (ConvertKit)',
    logo: '✉️',
    tagline: 'Kit supports direct webhook subscriber creation — no Zapier needed.',
    nativeWebhook: true,
    webhookFieldLabel: 'Kit Form Subscribe URL',
    docsUrl: 'https://developers.kit.com/v4',
    steps: [
      { title: 'Log in to Kit and go to Grow → Subscribers', detail: 'Navigate to your Kit account. Go to Grow in the top navigation, then Subscribers.' },
      { title: 'Create a form to capture your PretaQuiz leads (optional but recommended)', detail: 'Create a form called "PretaQuiz Leads" — this helps you segment leads who came via the quiz. Under the form, click the Settings tab and find the Subscribe URL.' },
      { title: 'Get your API subscribe endpoint', detail: 'In Kit, go to Settings → Developer. Copy your API Key. Your subscribe endpoint is: https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe — replace YOUR_FORM_ID with the ID of the form you created.' },
      { title: 'Use Zapier to bridge PretaQuiz to Kit', detail: 'Kit\'s API requires authentication headers that PretaQuiz cannot send directly. The easiest path is to use Zapier: follow the Zapier guide above, then set Kit as the action and choose "Add Subscriber to Form". Map first_name, last_name, and email from PretaQuiz.' },
      { title: 'Add a tag based on result type', detail: 'In the Zapier action for Kit, add a second action: "Add Tag to Subscriber". Set the tag name to the result_type field from PretaQuiz. This lets you trigger different sequences per result.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the subscriber appears in Kit with the correct tag.' },
    ],
  },
  {
    id: 'highlevel',
    name: 'HighLevel / GoHighLevel',
    logo: '🚀',
    tagline: 'HighLevel supports direct inbound webhooks — no Zapier needed.',
    nativeWebhook: true,
    webhookFieldLabel: 'HighLevel Webhook URL',
    docsUrl: 'https://help.gohighlevel.com/support/solutions/articles/48001156940',
    steps: [
      { title: 'Log in to HighLevel and go to Settings → Integrations', detail: 'From your HighLevel sub-account, click Settings in the left sidebar, then Integrations.' },
      { title: 'Find the Webhooks section and click Add New Webhook', detail: 'Scroll to the Webhooks section. Click "Add New Webhook" or "Create Webhook".' },
      { title: 'Copy your webhook URL', detail: 'HighLevel will generate a URL for receiving inbound data. Copy it — this is what you paste into PretaQuiz.' },
      { title: 'Alternatively, use HighLevel Workflows', detail: 'In HighLevel, go to Automation → Workflows. Create a new workflow and add a Webhook Trigger as the starting step. HighLevel will give you a unique inbound webhook URL for that workflow.' },
      { title: 'Paste the URL into PretaQuiz and save', detail: 'Paste the URL into the webhook field above and click Save. Run a test quiz submission.' },
      { title: 'Map the fields in your HighLevel workflow', detail: 'In your workflow, add actions after the webhook trigger: Create or Update Contact, using first_name, last_name, and email from the PretaQuiz payload. Add a tag or custom field for result_type so you can segment contacts by quiz result and trigger the right follow-up sequence.' },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    logo: '🟠',
    tagline: 'Use Zapier or Make to add PretaQuiz leads to HubSpot as contacts.',
    nativeWebhook: false,
    webhookFieldLabel: 'Zapier or Make Webhook URL',
    docsUrl: 'https://zapier.com/apps/hubspot/integrations',
    steps: [
      { title: 'HubSpot does not accept direct inbound webhooks for contact creation', detail: 'Connect via Zapier or Make. Follow the Zapier or Make guide above to get your webhook URL first.' },
      { title: 'In Zapier or Make, set HubSpot as your action', detail: 'Search for HubSpot and choose "Create or Update Contact" as the action event.' },
      { title: 'Connect your HubSpot account', detail: 'Authorise Zapier or Make to access your HubSpot account when prompted.' },
      { title: 'Map the PretaQuiz fields to HubSpot contact properties', detail: 'Map email → Email, first_name → First Name, last_name → Last Name. For result_type, create a custom contact property in HubSpot called "Quiz Result" and map it there.' },
      { title: 'Create a custom property for quiz result (recommended)', detail: 'In HubSpot, go to Settings → Properties → Contact Properties and create a new text property called "Quiz Result". This lets you build lists and trigger workflows based on which result each contact received.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the contact appears in HubSpot with the Quiz Result property populated.' },
    ],
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    logo: '📊',
    tagline: 'Klaviyo accepts direct webhook data — connect PretaQuiz without Zapier.',
    nativeWebhook: true,
    webhookFieldLabel: 'Klaviyo Webhook or Zapier URL',
    docsUrl: 'https://developers.klaviyo.com/en/docs/webhooks',
    steps: [
      { title: 'Option A: Use Zapier (easiest)', detail: 'Follow the Zapier guide above. In the action step, search for Klaviyo and choose "Add Subscriber to List". Map email, first_name, and last_name from PretaQuiz. Add a profile property for result_type.' },
      { title: 'Option B: Use Klaviyo\'s API directly (advanced)', detail: 'Go to Klaviyo → Account → Settings → API Keys. Create a Private API Key with full access. You will need to use a middleware tool like Make to POST to Klaviyo\'s Subscribe API endpoint with your API key in the header.' },
      { title: 'Create a segment based on quiz result', detail: 'In Klaviyo, go to Lists & Segments → Create Segment. Filter by the profile property you mapped to result_type. This lets you trigger different flows for each quiz result.' },
      { title: 'Set up a flow triggered by the new segment', detail: 'In Klaviyo, go to Flows → Create Flow. Choose "Segment triggered" and select your quiz result segment. Build your follow-up email sequence from there.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the profile appears in Klaviyo with the correct result property.' },
    ],
  },
  {
    id: 'flodesk',
    name: 'Flodesk',
    logo: '🌸',
    tagline: 'Use Zapier to connect PretaQuiz leads to your Flodesk segments.',
    nativeWebhook: false,
    webhookFieldLabel: 'Zapier Webhook URL',
    docsUrl: 'https://zapier.com/apps/flodesk/integrations',
    steps: [
      { title: 'Flodesk connects via Zapier', detail: 'Flodesk does not have a direct inbound webhook. Follow the Zapier guide above to get your webhook URL first.' },
      { title: 'In Zapier, set Flodesk as your action', detail: 'Search for Flodesk and choose "Create or Update Subscriber" as the action event.' },
      { title: 'Connect your Flodesk account', detail: 'Authorise Zapier to access Flodesk when prompted.' },
      { title: 'Map the PretaQuiz fields', detail: 'Map email → Email, first_name → First Name, last_name → Last Name.' },
      { title: 'Add the subscriber to a segment based on result type', detail: 'In Flodesk, create segments for each of your quiz result types before setting up the Zap. In Zapier, add a second action: "Add Subscriber to Segment". Use the result_type field from PretaQuiz to determine which segment they go into. You may need one Zap per result type using Zapier filters, or use Zapier\'s Paths feature.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the subscriber appears in the correct Flodesk segment.' },
    ],
  },
  {
    id: 'other',
    name: 'Other tools',
    logo: '🔗',
    tagline: 'Any tool that accepts a webhook URL will work with PretaQuiz.',
    nativeWebhook: false,
    webhookFieldLabel: 'Webhook URL',
    docsUrl: 'https://zapier.com',
    steps: [
      { title: 'Does your tool have a native webhook URL?', detail: 'Some tools (like HighLevel) give you a direct webhook URL you can paste straight into PretaQuiz. Check your tool\'s settings for "Webhooks", "Automations", or "Integrations" — look for an inbound webhook or trigger URL.' },
      { title: 'If not, use Zapier or Make as a bridge', detail: 'Zapier and Make connect PretaQuiz to thousands of tools. Follow the Zapier or Make guide above to get a webhook URL, then set your tool as the action in Zapier or Make.' },
      { title: 'What PretaQuiz sends', detail: 'Every quiz completion sends a JSON payload with: first_name, last_name, email, result_type (the result title), result_copy (the full result text), answers (which option A/B/C/D was chosen per question), quiz_name, client_name, and timestamp.' },
      { title: 'Need help?', detail: 'Email hello@pretaquiz.com and tell us which tool you use. We will write a guide for it.' },
    ],
  },
];

function GuideCard({ guide }: { guide: Guide }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[rgba(217,70,239,0.03)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{guide.logo}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: C.headline }}>{guide.name}</span>
              {guide.nativeWebhook && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
                >
                  Direct connection
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: C.supporting }}>{guide.tagline}</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: C.supporting }} /> : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: C.supporting }} />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: C.border }}>
          <div className="pt-4 space-y-3">
            {guide.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ backgroundColor: C.cta }}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.headline }}>{step.title}</p>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: C.body }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
          
            href={guide.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium"
            style={{ color: C.accent }}
          >
            <ExternalLink className="h-3 w-3" />
            Official {guide.name} documentation
          </a>
        </div>
      )}
    </div>
  );
}

export default function Integrations({ config, onConfigChange, userId, quizId }: IntegrationsProps) {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('quiz_configs')
      .update({ webhook_url: webhookUrl })
      .eq('id', quizId);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      onConfigChange((prev) => prev ? { ...prev, webhookUrl } : prev);
      toast({ title: 'Changes saved', description: 'Your lead delivery settings have been updated.' });
    }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-[720px]">
      <h1 className="text-2xl font-bold mb-1" style={{ color: C.headline }}>Connect your CRM</h1>
      <p className="mb-8 leading-relaxed" style={{ color: C.supporting }}>
        Your leads are saved to your Leads page automatically. To also send them to your CRM or email tool the moment someone completes your quiz, paste your webhook URL below and follow the guide for your tool.
      </p>

      {/* Webhook URL input */}
      <div className="rounded-xl p-5 mb-8" style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
        <div className="space-y-3">
          <Label htmlFor="webhookUrl" className="text-sm font-semibold" style={{ color: C.headline }}>
            Your webhook URL
          </Label>
          <Input
            id="webhookUrl"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="font-mono text-sm"
          />
          <Button onClick={handleSave} disabled={saving} style={{ backgroundColor: C.cta, color: '#FFFFFF' }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Payload reference */}
      <div className="rounded-xl p-4 mb-8" style={{ backgroundColor: C.infoBg, border: `1px solid ${C.infoBorder}` }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.accent }}>What PretaQuiz sends with each lead</p>
        <div className="font-mono text-xs leading-relaxed" style={{ color: C.body }}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <span><span style={{ color: C.accent }}>first_name</span> — Jane</span>
            <span><span style={{ color: C.accent }}>last_name</span> — Smith</span>
            <span><span style={{ color: C.accent }}>email</span> — jane@example.com</span>
            <span><span style={{ color: C.accent }}>result_type</span> — The Invisible Expert</span>
            <span><span style={{ color: C.accent }}>result_copy</span> — Full result text</span>
            <span><span style={{ color: C.accent }}>quiz_name</span> — My Quiz</span>
            <span><span style={{ color: C.accent }}>answers</span> — {`{"1":"A","2":"C"...}`}</span>
            <span><span style={{ color: C.accent }}>timestamp</span> — 2026-05-29T12:00:00Z</span>
          </div>
        </div>
      </div>

      {/* CRM guides */}
      <h2 className="text-base font-semibold mb-3" style={{ color: C.headline }}>Step-by-step guides</h2>
      <p className="text-sm mb-4" style={{ color: C.supporting }}>
        Find your tool below and follow the steps to get your webhook URL. Paste it above when done.
      </p>
      <div className="space-y-2">
        {GUIDES.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      <p className="text-xs mt-6" style={{ color: C.supporting }}>
        Not seeing your tool? Email <a href="mailto:hello@pretaquiz.com" style={{ color: C.accent }}>hello@pretaquiz.com</a> and we will add a guide for it.
      </p>
    </div>
  );
}
