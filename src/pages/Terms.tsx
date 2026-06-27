import { Link } from 'react-router-dom';

const Terms = () => (
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
      <h1 className="text-3xl font-bold mb-8">Terms &amp; Conditions</h1>
      <p className="text-muted-foreground text-sm mb-6">Last updated: March 24, 2026</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Agreement to Terms</h2>
      <p>By accessing or using PretaQuiz ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Service.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Description of Service</h2>
      <p>PretaQuiz provides a platform for creating, hosting, and sharing lead-generation quizzes. The Service includes quiz creation tools, lead capture, analytics, and related features.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Account Registration</h2>
      <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Payment &amp; Refunds</h2>
      <p>Certain features require a one-time payment. All payments are processed securely via Stripe. Refund requests must be submitted within 14 days of purchase. Digital products that have been fully delivered are non-refundable unless required by applicable law.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Usage Limits</h2>
      <p>Each account includes a monthly lead capture allowance based on your plan tier. The current standard allowance is 500 leads per month. Founding member accounts have unlimited lead capture. If your account reaches its monthly limit, new quiz submissions will be paused until the following month. We may adjust plan allowances with 30 days' email notice.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Acceptable Use</h2>
      <p>You agree not to use the Service to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Violate any applicable laws or regulations</li>
        <li>Distribute spam, malware, or harmful content</li>
        <li>Infringe on the intellectual property rights of others</li>
        <li>Collect personal data without proper consent</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Intellectual Property</h2>
      <p>All content, branding, and code associated with PretaQuiz remain the property of PretaQuiz. Quiz content you create remains yours, but you grant us a licence to host and display it as part of the Service.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Limitation of Liability</h2>
      <p>The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, PretaQuiz shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Termination</h2>
      <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time by contacting support.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Service Continuity &amp; Discontinuation</h2>
      <p>PretaQuiz is provided as a hosted service. Your one-time payment covers access to the platform, quiz hosting, and lead capture for as long as the Service remains operational.</p>
      <p>If we decide to discontinue the Service, we will notify you by email at least 90 days before the shutdown date. During that notice period, you will be able to export your quiz configuration and lead data.</p>
      <p>In the event PretaQuiz is acquired by or transferred to another operator, your account and quiz will transfer to the new operator under the same terms. We will notify you of any such transfer by email.</p>
      <p>We do not guarantee that the Service will be available indefinitely. We will make reasonable efforts to maintain uptime and provide advance notice of any material changes to the Service, but we are not liable for interruptions or discontinuation beyond the notice period described above.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Changes to Terms</h2>
      <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Contact</h2>
      <p>For questions about these Terms, please contact us at <a href="mailto:hello@pretaquiz.com" className="text-primary hover:underline">hello@pretaquiz.com</a>.</p>

      <div className="mt-12 pt-6 border-t border-border">
        <a href="/" className="text-primary hover:underline text-sm">&larr; Back to Home</a>
      </div>
    </div>
  </div>
);

export default Terms;
