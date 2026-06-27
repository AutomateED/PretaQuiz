import { Link } from 'react-router-dom';

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <header className="bg-background">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center">
        <Link to="/" className="text-xl font-bold hover:opacity-85 transition-opacity">
          <span className="text-white">Preta</span>
          <span style={{ color: '#D946EF' }}>Quiz</span>
        </Link>
      </div>
    </header>
    <div className="py-16 px-4">
      <div className="mx-auto max-w-3xl prose prose-sm text-foreground">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-6">Last updated: April 2026</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Who We Are</h2>
      <p>PretaQuiz is operated by Emma (sole proprietor), based in Occitanie, France.</p>
      <p>Contact: <a href="mailto:hello@pretaquiz.com" className="text-primary hover:underline">hello@pretaquiz.com</a></p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. What This Policy Covers</h2>
      <p>This policy covers two groups of people:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Clients</strong> (people who purchase and use PretaQuiz): We are the data controller for your account data.</li>
        <li><strong>Prospects / quiz takers</strong> (people who complete a quiz created by a client): The client is the data controller. We are the data processor, acting on behalf of the client under our <Link to="/dpa" className="text-primary hover:underline">Data Processing Agreement</Link>.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. What Data We Collect</h2>
      <p><strong>Client account data:</strong> Full name, email address, business name, brand assets (logo, colours, font), quiz configuration, webhook URL and integration settings.</p>
      <p><strong>Prospect quiz data</strong> (collected on behalf of clients): First name, last name, email address, quiz answers, result type, timestamp.</p>
      <p><strong>Payment data:</strong> Processed by Stripe. We do not store your card details.</p>
      <p><strong>Analytics data</strong> (only with consent): GA4 and Meta Pixel collect anonymised usage data only if you accept cookies via the cookie banner.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Why We Collect Data and Our Legal Basis</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Contract performance:</strong> We collect client account data to provide the PretaQuiz service.</li>
        <li><strong>Legitimate interest:</strong> We use basic usage data for security monitoring and bug fixes.</li>
        <li><strong>Consent:</strong> Analytics cookies (GA4, Meta Pixel) are only activated after you explicitly accept cookies via the cookie banner.</li>
        <li><strong>Data processing on behalf of clients:</strong> Prospect data is processed under the client's legal basis, as set out in our <Link to="/dpa" className="text-primary hover:underline">Data Processing Agreement</Link>.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Where Data Is Stored</h2>
      <p>Our primary database is hosted by Supabase (AWS) in the EU (Frankfurt, eu-central-1).</p>
      <p>Stripe may transfer payment data to the US. Stripe is certified under the EU-US Data Privacy Framework.</p>
      <p>Google Analytics and Meta Pixel (when consent is given) may transfer data outside the EU with Standard Contractual Clauses in place.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Who Has Access to Your Data</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>PretaQuiz admin</strong> (Emma): For support, maintenance, and security.</li>
        <li><strong>Clients:</strong> Can access their own data and their leads only.</li>
        <li><strong>Supabase:</strong> Database hosting provider.</li>
        <li><strong>Stripe:</strong> Payment processing.</li>
        <li><strong>Google and Meta:</strong> Only with your consent (analytics cookies).</li>
      </ul>
      <p>We do not sell, rent, or share your data with any other third party.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. How Long We Keep Data</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Active accounts:</strong> Data is retained while your account is active.</li>
        <li><strong>Deleted accounts:</strong> All data is permanently deleted.</li>
        <li><strong>Payment records:</strong> Retained by Stripe in accordance with their data retention policy.</li>
        <li><strong>Analytics:</strong> GA4 retains data for 14 months.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. AI features</h2>
      <p>PretaQuiz includes an in-dashboard help assistant (HelpChat) that uses third-party AI providers to answer your questions about the product.</p>
      <p>When you send a message in HelpChat, your message text is sent to Anthropic (Claude) and may also be processed by OpenAI. These providers process your message only to generate a response and return it to you.</p>
      <p>What this means in practice:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Your HelpChat messages are not used to train AI models.</li>
        <li>Lead data is never sent to AI providers. HelpChat only sees the message you type and general context about the PretaQuiz product — not your leads, your quiz answers, or your customers' personal data.</li>
        <li>HelpChat is only available inside the logged-in dashboard. It is not part of the public quiz experience your leads see.</li>
        <li>The AI providers we use act as sub-processors. See our <Link to="/dpa" className="text-primary hover:underline">Data Processing Agreement</Link> for the full list.</li>
        <li>You can choose not to use HelpChat at any time. The rest of PretaQuiz works exactly the same without it.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Your Rights Under GDPR</h2>
      <p>You have the right to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Access your personal data</li>
        <li>Rectify inaccurate data</li>
        <li>Request erasure of your data</li>
        <li>Restrict processing</li>
        <li>Data portability</li>
        <li>Object to processing</li>
        <li>Withdraw consent at any time</li>
      </ul>
      <p>To exercise any of these rights, contact <a href="mailto:hello@pretaquiz.com" className="text-primary hover:underline">hello@pretaquiz.com</a>. We will respond within 30 days.</p>
      <p><strong>For prospects:</strong> Please contact the quiz creator directly. Alternatively, email us and we will forward or action the request on your behalf.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Cookies</h2>
      <p><strong>Essential cookies</strong> (session management, consent preference) do not require consent and are always active.</p>
      <p><strong>Analytics cookies</strong> (GA4, Meta Pixel) are only loaded after you click "Accept" on the cookie banner. Clicking "Decline" means no tracking scripts are loaded. You can clear your cookies at any time to reset your preference.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Data Security</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>All data transmitted via HTTPS with TLS encryption</li>
        <li>Database secured with Supabase Row Level Security (RLS)</li>
        <li>Security headers enforced on all pages (HSTS, X-Frame-Options, CSP, X-Content-Type-Options)</li>
        <li>Stripe webhook signature verification</li>
        <li>Admin access restricted to a single verified email</li>
      </ul>
      <p>In the event of a data breach, we will notify affected users within 72 hours.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Children</h2>
      <p>PretaQuiz is not intended for use by anyone under the age of 16. We do not knowingly collect personal data from children.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">13. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Material changes will be notified by email to registered clients.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">14. Contact and Complaints</h2>
      <p>For any questions or concerns about this policy, contact: <a href="mailto:hello@pretaquiz.com" className="text-primary hover:underline">hello@pretaquiz.com</a></p>
      <p>You also have the right to lodge a complaint with the French data protection authority, CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>).</p>

      <div className="mt-12 pt-6 border-t border-border">
        <a href="/" className="text-primary hover:underline text-sm">&larr; Back to Home</a>
      </div>
    </div>
    </div>
  </div>
);

export default Privacy;
