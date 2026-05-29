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
  border: 'rgba(217,70,239,0.15)',
  accent: '#D946EF',
  cta: '#F020B0',
  headline: '#0F0A1E',
  body: '#4A4060',
  supporting: '#6B5F80',
  infoBg: 'rgba(217,70,239,0.06)',
  infoBorder: 'rgba(217,70,239,0.25)',
};

interface GuideStep {
  title: string;
  detail: string;
}

interface Guide {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  nativeWebhook: boolean;
  steps: GuideStep[];
  docsUrl: string;
  docsLabel: string;
}

const GUIDES: Guide[] = [
  {
    id: 'zapier',
    name: 'Zapier',
    logo: '⚡',
    tagline: 'Connects PretaQuiz to 6,000+ apps. Best if your tool is not listed here.',
    nativeWebhook: false,
    docsUrl: 'https://zapier.com/apps/webhook/integrations',
    docsLabel: 'Zapier Webhooks documentation',
    steps: [
      { title: 'Go to zapier.com and click Create Zap', detail: 'Log in to your Zapier account and click the orange Create Zap button in the top left.' },
      { title: 'Choose Webhooks by Zapier as the trigger', detail: 'Search for Webhooks by Zapier in the trigger search box. Select it, then choose Catch Hook as the trigger event. Click Continue.' },
      { title: 'Copy your webhook URL', detail: 'Zapier will generate a unique webhook URL. It looks like: https://hooks.zapier.com/hooks/catch/123456/abcdef/ — copy this URL. This is what you paste into PretaQuiz.' },
      { title: 'Paste it into PretaQuiz and save', detail: 'Paste the URL into the webhook field above and click Save. Then complete a test run of your quiz so Zapier can see a real data sample.' },
      { title: 'Come back to Zapier and click Test Trigger', detail: 'Zapier will pick up the test lead you just submitted. You will see all the fields PretaQuiz sends: first_name, last_name, email, result_type, result_copy, answers, quiz_name, and timestamp.' },
      { title: 'Set up your action', detail: 'Add an action — for example, Add Subscriber to List in Mailchimp, or Create Contact in HubSpot. Map the fields from PretaQuiz to the fields in your tool. Turn on your Zap.' },
    ],
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    logo: '⚙️',
    tagline: 'More powerful than Zapier for complex automations. Free tier is generous.',
    nativeWebhook: false,
    docsUrl: 'https://www.make.com/en/integrations/webhooks',
    docsLabel: 'Make Webhooks documentation',
    steps: [
      { title: 'Go to make.com and create a new scenario', detail: 'Log in and click Create a new scenario from your dashboard.' },
      { title: 'Add a Webhooks module as the trigger', detail: 'Search for Webhooks and select the Custom webhook module. Click Add to create a new webhook.' },
      { title: 'Copy your webhook URL', detail: 'Make will generate a URL like: https://hook.eu1.make.com/abc123xyz — copy this URL.' },
      { title: 'Paste it into PretaQuiz and save', detail: 'Paste the URL into the webhook field above and click Save. Run a test quiz submission so Make receives sample data.' },
      { title: 'Click OK in Make — it will detect your data structure automatically', detail: 'After your test submission, Make maps all the fields PretaQuiz sends. You will see first_name, last_name, email, result_type, result_copy, answers, and timestamp.' },
      { title: 'Add your next module and activate the scenario', detail: 'Add your action — such as adding a contact to ActiveCampaign or sending an email. Map the PretaQuiz fields to your tool and turn on the scenario.' },
    ],
  },
  {
    id: 'highlevel',
    name: 'HighLevel / GoHighLevel',
    logo: '🚀',
    tagline: 'HighLevel supports direct inbound webhooks — no Zapier needed.',
    nativeWebhook: true,
    docsUrl: 'https://help.gohighlevel.com/support/solutions/articles/48001156940',
    docsLabel: 'HighLevel Webhooks documentation',
    steps: [
      { title: 'Log in to HighLevel and go to Automation then Workflows', detail: 'From your HighLevel sub-account, click Automation in the left sidebar, then Workflows.' },
      { title: 'Create a new workflow and add a Webhook Trigger', detail: 'Click Create Workflow, give it a name like PretaQuiz Leads, and add a Webhook as the starting trigger. HighLevel will generate a unique inbound webhook URL for that workflow.' },
      { title: 'Copy the webhook URL and paste it into PretaQuiz', detail: 'Copy the URL HighLevel provides and paste it into the webhook field above. Click Save, then run a test quiz submission.' },
      { title: 'Add a Create or Update Contact action', detail: 'Back in your HighLevel workflow, add a Create or Update Contact action after the webhook trigger. Map first_name, last_name, and email from the PretaQuiz payload.' },
      { title: 'Add a tag based on result type', detail: 'Add an Add Tag action and set the tag value to the result_type field from PretaQuiz. This lets you trigger different follow-up sequences based on which result the prospect received.' },
      { title: 'Activate your workflow', detail: 'Turn the workflow on. Every new quiz completion will now create or update a contact in HighLevel and apply the correct result tag automatically.' },
    ],
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    logo: '📧',
    tagline: 'Connect via Zapier or Make — takes about 10 minutes to set up.',
    nativeWebhook: false,
    docsUrl: 'https://zapier.com/apps/activecampaign/integrations',
    docsLabel: 'ActiveCampaign on Zapier',
    steps: [
      { title: 'Follow the Zapier guide above first to get your webhook URL', detail: 'ActiveCampaign does not have a direct inbound webhook for adding contacts, so you will use Zapier as the bridge. Follow the Zapier steps above and get your webhook URL before continuing.' },
      { title: 'In Zapier, set ActiveCampaign as your action', detail: 'Search for ActiveCampaign in the action step. Choose Create or Update Contact as the action event.' },
      { title: 'Connect your ActiveCampaign account', detail: 'You will need your ActiveCampaign API URL and API Key. Find these in ActiveCampaign under Settings then Developer.' },
      { title: 'Map the PretaQuiz fields', detail: 'Map first_name to First Name, last_name to Last Name, email to Email. For result_type, map it to a custom field or use it to apply a tag.' },
      { title: 'Add a tag based on result type (recommended)', detail: 'Add a second Zapier action: Add Tag to Contact in ActiveCampaign. Set the tag value to the result_type field from PretaQuiz. This lets you trigger different automations based on which result the prospect received.' },
      { title: 'Test and activate', detail: 'Run a test quiz submission and confirm the contact appears in ActiveCampaign with the correct tag. Then turn on your Zap.' },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    logo: '🐒',
    tagline: 'Connect via Zapier or Make to add leads to your audience.',
    nativeWebhook: false,
    docsUrl: 'https://zapier.com/apps/mailchimp/integrations',
    docsLabel: 'Mailchimp on Zapier',
    steps: [
      { title: 'Follow the Zapier guide above first to get your webhook URL', detail: 'Mailchimp does not accept direct inbound webhooks for adding subscribers. Follow the Zapier steps above and get your webhook URL before continuing.' },
      { title: 'In Zapier, set Mailchimp as your action', detail: 'Search for Mailchimp and choose Add or Update Subscriber as the action event.' },
      { title: 'Connect your Mailchimp account and choose your audience', detail: 'Select the audience (list) where you want PretaQuiz leads to appear.' },
      { title: 'Map the PretaQuiz fields', detail: 'Map email to Email Address, first_name to FNAME, last_name to LNAME. Set Status to Subscribed if you want them added immediately, or Pending if you want them to confirm first.' },
      { title: 'Add a tag based on result type (recommended)', detail: 'In the Zapier action, scroll to Tags and set the value to the result_type field from PretaQuiz. This lets you send different follow-up sequences to each result type.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the subscriber appears in your Mailchimp audience with the correct tag.' },
    ],
  },
  {
    id: 'kit',
    name: 'Kit (ConvertKit)',
    logo: '✉️',
    tagline: 'Connect via Zapier to add leads to your Kit account.',
    nativeWebhook: false,
    docsUrl: 'https://zapier.com/apps/convertkit/integrations',
    docsLabel: 'Kit on Zapier',
    steps: [
      { title: 'Follow the Zapier guide above first to get your webhook URL', detail: "Kit's API requires authentication headers that PretaQuiz cannot send directly. Use Zapier as the bridge. Follow the Zapier steps above and get your webhook URL before continuing." },
      { title: 'In Zapier, set Kit as your action', detail: 'Search for Kit (or ConvertKit) in the action step. Choose Add Subscriber to Form or Tag as the action event.' },
      { title: 'Connect your Kit account', detail: 'Authorise Zapier to access your Kit account when prompted.' },
      { title: 'Map the PretaQuiz fields', detail: 'Map email to Email, first_name to First Name, last_name to Last Name.' },
      { title: 'Add a tag based on result type', detail: 'Add a second Zapier action: Add Tag to Subscriber in Kit. Set the tag name to the result_type field from PretaQuiz. This lets you trigger different sequences per result.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the subscriber appears in Kit with the correct tag.' },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    logo: '🟠',
    tagline: 'Connect via Zapier or Make to add PretaQuiz leads as HubSpot contacts.',
    nativeWebhook: false,
    docsUrl: 'https://zapier.com/apps/hubspot/integrations',
    docsLabel: 'HubSpot on Zapier',
    steps: [
      { title: 'Follow the Zapier guide above first to get your webhook URL', detail: 'HubSpot does not accept direct inbound webhooks for contact creation. Follow the Zapier steps above and get your webhook URL before continuing.' },
      { title: 'In Zapier, set HubSpot as your action', detail: 'Search for HubSpot and choose Create or Update Contact as the action event.' },
      { title: 'Connect your HubSpot account', detail: 'Authorise Zapier to access your HubSpot account when prompted.' },
      { title: 'Map the PretaQuiz fields', detail: 'Map email to Email, first_name to First Name, last_name to Last Name.' },
      { title: 'Create a custom property for quiz result (recommended)', detail: 'In HubSpot, go to Settings then Properties then Contact Properties and create a new text property called Quiz Result. Back in Zapier, map result_type to this property. This lets you build lists and trigger workflows based on quiz result.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the contact appears in HubSpot with the Quiz Result property populated.' },
    ],
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    logo: '📊',
    tagline: 'Connect via Zapier to add PretaQuiz leads to your Klaviyo lists.',
    nativeWebhook: false,
    docsUrl: 'https://zapier.com/apps/klaviyo/integrations',
    docsLabel: 'Klaviyo on Zapier',
    steps: [
      { title: 'Follow the Zapier guide above first to get your webhook URL', detail: 'The easiest way to connect PretaQuiz to Klaviyo is via Zapier. Follow the Zapier steps above and get your webhook URL before continuing.' },
      { title: 'In Zapier, set Klaviyo as your action', detail: 'Search for Klaviyo and choose Add Subscriber to List as the action event.' },
      { title: 'Connect your Klaviyo account and select your list', detail: 'Authorise Zapier to access Klaviyo and select the list where PretaQuiz leads should go.' },
      { title: 'Map the PretaQuiz fields', detail: 'Map email to Email, first_name to First Name, last_name to Last Name. For result_type, map it to a custom profile property.' },
      { title: 'Create a segment based on quiz result', detail: 'In Klaviyo, go to Lists and Segments then Create Segment. Filter by the custom property you mapped to result_type. This lets you trigger different flows for each quiz result.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the profile appears in Klaviyo with the correct result property.' },
    ],
  },
  {
    id: 'flodesk',
    name: 'Flodesk',
    logo: '🌸',
    tagline: 'Connect via Zapier to add leads to your Flodesk segments.',
    nativeWebhook: false,
    docsUrl: 'https://zapier.com/apps/flodesk/integrations',
    docsLabel: 'Flodesk on Zapier',
    steps: [
      { title: 'Follow the Zapier guide above first to get your webhook URL', detail: 'Flodesk does not have a direct inbound webhook. Follow the Zapier steps above and get your webhook URL before continuing.' },
      { title: 'In Zapier, set Flodesk as your action', detail: 'Search for Flodesk and choose Create or Update Subscriber as the action event.' },
      { title: 'Connect your Flodesk account', detail: 'Authorise Zapier to access Flodesk when prompted.' },
      { title: 'Map the PretaQuiz fields', detail: 'Map email to Email, first_name to First Name, last_name to Last Name.' },
      { title: 'Add the subscriber to a segment based on result type', detail: 'In Flodesk, create a segment for each of your quiz result types before setting up the Zap. In Zapier, add a second action: Add Subscriber to Segment. Use Zapier Paths to route each result_type value to the correct segment.' },
      { title: 'Test and activate', detail: 'Run a test quiz and confirm the subscriber appears in the correct Flodesk segment.' },
    ],
  },
  {
    id: 'other',
    name: 'Other tools',
    logo: '🔗',
    tagline: 'Any tool that accepts a webhook or works with Zapier will connect to PretaQuiz.',
    nativeWebhook: false,
    docsUrl: 'https://zapier.com',
    docsLabel: 'Browse all Zapier integrations',
    steps: [
      { title: 'Check if your tool has a native inbound webhook URL', detail: "Some tools give you a direct webhook URL you can paste straight into PretaQuiz. Check your tool's settings for Webhooks, Automations, or Integrations — look for an inbound webhook or trigger URL." },
      { title: 'If not, use Zapier or Make as a bridge', detail: 'Zapier and Make connect PretaQuiz to thousands of tools. Follow the Zapier or Make guide above to get a webhook URL, then set your tool as the action.' },
      { title: 'What PretaQuiz sends with every lead', detail: 'Every quiz completion sends: first_name, last_name, email, result_type (the result title your prospect received), result_copy (the full result description text), answers (which option A/B/C/D per question), quiz_name, client_name, and timestamp.' },
      { title: 'Need a specific guide?', detail: 'Email hello@pretaquiz.com and tell us which tool you use. We will write a guide for it.' },
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
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[rgba(217,70,239,0.03)]"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{guide.logo}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: C.headline }}>{guide.name}</span>
              {guide.nativeWebhook && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
                >
                  Direct — no Zapier needed
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: C.supporting }}>{guide.tagline}</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 ml-2" style={{ color: C.supporting }} />
          : <ChevronDown className="h-4 w-4 shrink-0 ml-2" style={{ color: C.supporting }} />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: C.border }}>
          <div className="pt-4 space-y-4">
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
          <a
            href={guide.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-5 text-xs font-medium"
            style={{ color: C.accent }}
          >
            <ExternalLink className="h-3 w-3" />
            {guide.docsLabel}
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
        Your leads are saved to your Leads page automatically. To also send them to your CRM or email tool the moment someone completes your quiz, follow the guide for your tool below, then paste the webhook URL here and save.
      </p>

      {/* Webhook URL input */}
      <div className="rounded-xl p-5 mb-6" style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
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
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.accent }}>
          What PretaQuiz sends with each lead
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 font-mono text-xs" style={{ color: C.body }}>
          <div><span style={{ color: C.accent }}>first_name</span> — Jane</div>
          <div><span style={{ color: C.accent }}>last_name</span> — Smith</div>
          <div><span style={{ color: C.accent }}>email</span> — jane@example.com</div>
          <div><span style={{ color: C.accent }}>result_type</span> — The Invisible Expert</div>
          <div><span style={{ color: C.accent }}>result_copy</span> — Full result description text</div>
          <div><span style={{ color: C.accent }}>quiz_name</span> — My Business Quiz</div>
          <div><span style={{ color: C.accent }}>answers</span> — {"{"}"1":"A","2":"C"...{"}"}</div>
          <div><span style={{ color: C.accent }}>timestamp</span> — 2026-05-29T12:00:00Z</div>
        </div>
      </div>

      {/* CRM guides */}
      <h2 className="text-base font-semibold mb-1" style={{ color: C.headline }}>Step-by-step guides</h2>
      <p className="text-sm mb-4" style={{ color: C.supporting }}>
        Click your tool to see exactly how to connect it. Start with Zapier if yours is not listed.
      </p>
      <div className="space-y-2">
        {GUIDES.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      <p className="text-xs mt-6" style={{ color: C.supporting }}>
        Not seeing your tool? Email{' '}
        <a href="mailto:hello@pretaquiz.com" style={{ color: C.accent }}>
          hello@pretaquiz.com
        </a>{' '}
        and we will add a guide for it.
      </p>
    </div>
  );
}
