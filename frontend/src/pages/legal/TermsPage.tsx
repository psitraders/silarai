import { LandingLayout } from '../../components/landing/LandingLayout';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function TermsPage() {
  return (
    <LandingLayout>
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500">Last updated: 18 May 2025</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-10 text-sm text-teal-800 leading-relaxed">
            <strong>Please read these terms carefully.</strong> By creating an account or using Silarai, you agree to these Terms of Service.
          </div>

          <Section title="1. Acceptance of terms">
            <p>
              These Terms of Service ("Terms") form a legally binding agreement between you ("User", "Seller") and Silarai ("we", "us", "our"). By accessing or using the Silarai platform at Silarai.app or any associated services, you confirm that you have read, understood, and agree to be bound by these Terms.
            </p>
            <p>If you do not agree, please do not use our services.</p>
          </Section>

          <Section title="2. Description of service">
            <p>Silarai provides a SaaS platform that enables small businesses to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create and manage a branded online storefront</li>
              <li>List and sell products online</li>
              <li>Manage orders, inventory, and customer relationships</li>
              <li>Use AI-powered chat to handle customer queries</li>
              <li>Run WhatsApp marketing campaigns</li>
              <li>Accept online payments via third-party payment gateways</li>
            </ul>
            <p>We reserve the right to modify, suspend, or discontinue any feature at any time with reasonable notice.</p>
          </Section>

          <Section title="3. Account registration">
            <p>To use Silarai, you must create an account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate, current, and complete information</li>
              <li>Keep your login credentials confidential</li>
              <li>Be responsible for all activity that occurs under your account</li>
              <li>Notify us immediately of any unauthorised use of your account</li>
            </ul>
            <p>You must be at least 18 years old to create an account.</p>
          </Section>

          <Section title="4. Acceptable use">
            <p>You agree not to use Silarai to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sell prohibited, illegal, or counterfeit goods</li>
              <li>Sell alcohol, tobacco, drugs, weapons, or adult content</li>
              <li>Engage in fraudulent transactions or misrepresent your products</li>
              <li>Spam customers or send unsolicited messages</li>
              <li>Violate any applicable Indian or international law</li>
              <li>Attempt to reverse-engineer, hack, or disrupt our platform</li>
              <li>Infringe on the intellectual property rights of others</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these terms without refund.</p>
          </Section>

          <Section title="5. Plans, billing, and payments">
            <p><strong className="text-gray-800">Free plan:</strong> Available to all users. Certain features are limited or unavailable on the free plan.</p>
            <p><strong className="text-gray-800">Paid plans:</strong> Billed monthly or annually as selected at checkout. All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.</p>
            <p><strong className="text-gray-800">Payment processing:</strong> Payments are processed by Razorpay. By making a purchase, you also agree to Razorpay's terms of service.</p>
            <p><strong className="text-gray-800">Auto-renewal:</strong> Subscriptions auto-renew at the end of each billing cycle unless you cancel before the renewal date.</p>
            <p><strong className="text-gray-800">Price changes:</strong> We will provide at least 30 days' notice before changing subscription prices.</p>
          </Section>

          <Section title="6. Refunds and cancellations">
            <p>Please refer to our <a href="/refund" className="text-teal-600 hover:underline">Refund Policy</a> for full details on refunds and cancellations.</p>
          </Section>

          <Section title="7. Your content">
            <p>You retain ownership of all content you upload to Silarai — including product images, descriptions, and customer data.</p>
            <p>By uploading content, you grant Silarai a limited, non-exclusive licence to host, display, and transmit that content solely for the purpose of operating the platform.</p>
            <p>You are solely responsible for ensuring that your content does not infringe any third-party rights and complies with all applicable laws.</p>
          </Section>

          <Section title="8. Our intellectual property">
            <p>Silarai and all associated software, design, trademarks, and content are the property of Silarai. You may not copy, reproduce, distribute, or create derivative works from any part of our platform without our express written permission.</p>
          </Section>

          <Section title="9. Third-party services">
            <p>Silarai integrates with third-party services including Razorpay, WhatsApp Business API, Cloudinary, and OpenAI. Your use of these services is subject to their respective terms and privacy policies. We are not responsible for the actions or availability of these services.</p>
          </Section>

          <Section title="10. Limitation of liability">
            <p>To the maximum extent permitted by law, Silarai shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, revenue, data, or goodwill.</p>
            <p>Our total liability to you for any claim arising out of or related to these Terms or our services shall not exceed the amount you paid to us in the 3 months preceding the claim.</p>
          </Section>

          <Section title="11. Disclaimer of warranties">
            <p>Silarai is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </Section>

          <Section title="12. Indemnification">
            <p>You agree to indemnify and hold harmless Silarai and its officers, directors, and employees from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, violation of these Terms, or infringement of any third-party rights.</p>
          </Section>

          <Section title="13. Termination">
            <p>You may terminate your account at any time by contacting us at support@Silarai.app.</p>
            <p>We may suspend or terminate your account immediately if you violate these Terms, engage in fraudulent activity, or for any other reason at our sole discretion.</p>
            <p>Upon termination, your right to use the platform ceases immediately. You may request an export of your data within 30 days of termination.</p>
          </Section>

          <Section title="14. Governing law and dispute resolution">
            <p>These Terms are governed by the laws of India. Any disputes arising from these Terms shall first be attempted to be resolved through mutual negotiation. If unresolved within 30 days, disputes shall be submitted to the exclusive jurisdiction of the courts of Gujarat, India.</p>
          </Section>

          <Section title="15. Changes to these terms">
            <p>We may update these Terms from time to time. We will notify you of material changes via email or in-app notice at least 14 days before the changes take effect. Continued use of Silarai after changes take effect constitutes acceptance of the new Terms.</p>
          </Section>

          <div className="mt-10 p-5 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
            Questions? Email us at{' '}
            <a href="mailto:support@Silarai.app" className="text-teal-600 hover:underline font-medium">
              support@Silarai.app
            </a>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

