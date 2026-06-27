import { Link } from 'react-router-dom';

const Dpa = () => (
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
      <h1 className="text-3xl font-bold mb-8">Data Processing Agreement</h1>
      <p className="text-muted-foreground text-sm mb-6">Last updated: April 2026</p>

      <p>This Data Processing Agreement ("DPA") forms part of the PretaQuiz Terms of Service and applies to all personal data that PretaQuiz processes on behalf of clients ("data controllers") who use the PretaQuiz platform.</p>
      <p>By purchasing and using PretaQuiz, you ("the Client" or "Controller") agree to this DPA. PretaQuiz ("the Processor") agrees to process personal data only as described in this agreement.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Definitions</h2>
      <p><strong>Controller:</strong> The client who creates a quiz using PretaQuiz and determines the purposes and means of processing prospect data.</p>
      <p><strong>Processor:</strong> PretaQuiz, which processes prospect data on behalf of the Controller.</p>
      <p><strong>Data subject:</strong> A prospect (quiz taker) whose personal data is collected through a quiz.</p>
      <p><strong>Personal data:</strong> Any information relating to an identified or identifiable person, as defined by GDPR Article 4(1).</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Scope of Processing</h2>
      <p>This DPA covers the processing of prospect personal data collected through quizzes created by the Client on the PretaQuiz platform.</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Data subjects:</strong> Prospects who complete a quiz created by the Client.</li>
        <li><strong>Categories of data:</strong> First name, last name, email address, quiz answers, result type, timestamp.</li>
        <li><strong>Purpose:</strong> To display quiz results, store leads in the Client dashboard, deliver lead data to the Client via webhook, and send a result email to the prospect.</li>
        <li><strong>Duration:</strong> For as long as the Client account is active, or until the Client or data subject requests deletion.</li>
        <li><strong>Location:</strong> EU (Supabase/AWS, Frankfurt, eu-central-1).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Obligations of PretaQuiz (Processor)</h2>
      <p>PretaQuiz agrees to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Process prospect personal data only on documented instructions from the Client, defined by the Client's quiz configuration and dashboard settings</li>
        <li>Not process prospect data for any purpose other than providing the PretaQuiz service</li>
        <li>Not sell, rent, or share prospect data with any third party, except sub-processors listed in Section 5</li>
        <li>Ensure that any persons authorised to process personal data are bound by confidentiality obligations</li>
        <li>Implement appropriate technical and organisational security measures</li>
        <li>Assist the Client in responding to data subject requests (access, rectification, erasure, portability) within 30 days of notification</li>
        <li>Notify the Client without undue delay (and within 72 hours) after becoming aware of a personal data breach affecting their prospect data</li>
        <li>Delete all prospect data associated with a Client account upon termination of the account, unless retention is required by law</li>
        <li>Make available to the Client all information necessary to demonstrate compliance with this DPA</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Obligations of the Client (Controller)</h2>
      <p>The Client agrees to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Ensure they have a lawful basis for collecting prospect personal data through their quiz</li>
        <li>Provide appropriate privacy information to prospects before or at the point of data collection</li>
        <li>Not use PretaQuiz to collect special category data without explicit consent from data subjects and prior notice to PretaQuiz</li>
        <li>Promptly notify PretaQuiz of any data subject requests that require action from the Processor</li>
        <li>Ensure that any webhook URL they configure receives and stores data in compliance with applicable data protection laws</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Sub-processors</h2>
      <p>PretaQuiz uses the following sub-processors to deliver the service. Each sub-processor is bound by a data processing agreement that meets the requirements of GDPR Article 28.</p>

      <div className="my-4 overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(217,70,239,0.15)' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.15)' }}>
              <th className="text-left py-3 px-4 font-semibold">Sub-processor</th>
              <th className="text-left py-3 px-4 font-semibold">Purpose</th>
              <th className="text-left py-3 px-4 font-semibold">Location</th>
              <th className="text-left py-3 px-4 font-semibold">Transfer mechanism</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}>
              <td className="py-3 px-4">Supabase</td>
              <td className="py-3 px-4">Database, authentication, file storage</td>
              <td className="py-3 px-4">EU (AWS Frankfurt)</td>
              <td className="py-3 px-4">N/A — data stays in the EU</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}>
              <td className="py-3 px-4">Lovable</td>
              <td className="py-3 px-4">Development platform used to build and maintain PretaQuiz</td>
              <td className="py-3 px-4">United States / EU</td>
              <td className="py-3 px-4">Standard Contractual Clauses</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}>
              <td className="py-3 px-4">Vercel</td>
              <td className="py-3 px-4">Application hosting and content delivery</td>
              <td className="py-3 px-4">United States / global edge network</td>
              <td className="py-3 px-4">Standard Contractual Clauses</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}>
              <td className="py-3 px-4">Stripe</td>
              <td className="py-3 px-4">Payment processing</td>
              <td className="py-3 px-4">United States</td>
              <td className="py-3 px-4">Standard Contractual Clauses</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}>
              <td className="py-3 px-4">Resend</td>
              <td className="py-3 px-4">Transactional email delivery (account emails, lead result emails)</td>
              <td className="py-3 px-4">United States</td>
              <td className="py-3 px-4">Standard Contractual Clauses</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}>
              <td className="py-3 px-4">Anthropic</td>
              <td className="py-3 px-4">AI provider for the in-dashboard HelpChat assistant</td>
              <td className="py-3 px-4">United States</td>
              <td className="py-3 px-4">Standard Contractual Clauses</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}>
              <td className="py-3 px-4">OpenAI</td>
              <td className="py-3 px-4">AI provider for the in-dashboard HelpChat assistant</td>
              <td className="py-3 px-4">United States</td>
              <td className="py-3 px-4">Standard Contractual Clauses</td>
            </tr>
            <tr>
              <td className="py-3 px-4">Sentry</td>
              <td className="py-3 px-4">Error monitoring and crash reporting</td>
              <td className="py-3 px-4">United States</td>
              <td className="py-3 px-4">Standard Contractual Clauses</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>We will give you reasonable notice before adding or replacing a sub-processor. If you object to a new sub-processor on reasonable data protection grounds, you can terminate your subscription and receive a pro-rated refund for any unused period.</p>

      <p>For the avoidance of doubt:</p>

      <p>Anthropic and OpenAI only receive messages typed into HelpChat by you, the account holder. They do not receive any lead data, quiz answers, or end-user personal data.</p>

      <p>Stripe handles payment information directly. PretaQuiz does not store card numbers, CVCs, or full payment credentials.</p>

      <p>Resend receives the email address and content of transactional emails (account magic links, password resets, lead result emails). It does not receive lead quiz answers or other dashboard data.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Security Measures</h2>
      <p>PretaQuiz implements the following measures:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Encryption in transit via HTTPS with TLS</li>
        <li>Database security via Supabase Row Level Security ensuring clients can only access their own data</li>
        <li>Admin access restricted to a single verified email address</li>
        <li>Stripe webhook signature verification</li>
        <li>Security headers on all pages (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)</li>
        <li>Data breach notification to affected Controllers within 72 hours</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Data Subject Requests</h2>
      <p>If a prospect contacts PretaQuiz to exercise their rights, PretaQuiz will forward the request to the relevant Client within 5 business days and assist in fulfilling it within 30 days. If the Client cannot be reached, PretaQuiz will action the request directly.</p>
      <p>Prospects can submit requests by emailing <a href="mailto:hello@pretaquiz.com" className="text-primary hover:underline">hello@pretaquiz.com</a>.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Data Deletion</h2>
      <p>Upon termination of the Client's account, all prospect data, quiz configuration, and authentication records will be permanently deleted. Deletion is irreversible. Clients may also request deletion of specific leads through their dashboard or by contacting <a href="mailto:hello@pretaquiz.com" className="text-primary hover:underline">hello@pretaquiz.com</a>.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. International Data Transfers</h2>
      <p>The primary database is hosted in the EU (Frankfurt). Where data is transferred to sub-processors outside the EEA, PretaQuiz ensures appropriate safeguards are in place, including EU-US Data Privacy Framework certification or Standard Contractual Clauses.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Term and Termination</h2>
      <p>This DPA takes effect when the Client purchases access to PretaQuiz and remains in effect for the duration of the Client's use of the service. It terminates automatically when the Client's account is deleted and all associated data has been removed.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Governing Law</h2>
      <p>This DPA is governed by the laws of France and the European Union, including Regulation (EU) 2016/679 (GDPR). Any disputes will be subject to the jurisdiction of the courts of France.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Contact</h2>
      <p>For questions about this DPA, contact: <a href="mailto:hello@pretaquiz.com" className="text-primary hover:underline">hello@pretaquiz.com</a></p>

      <div className="mt-12 pt-6 border-t border-border">
        <a href="/" className="text-primary hover:underline text-sm">&larr; Back to Home</a>
      </div>
    </div>
  </div>
);

export default Dpa;
