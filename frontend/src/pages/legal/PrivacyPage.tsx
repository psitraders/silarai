import { LandingLayout } from '../../components/landing/LandingLayout';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LandingLayout>
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: 18 May 2025</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-10 text-sm text-teal-800 leading-relaxed">
            <strong>Summary:</strong> We collect only the data needed to run your store and improve your experience.
            We do not sell your data to third parties. You can request deletion of your data at any time.
          </div>

          <Section title="1. Who we are">
            <p>
              Silarai ("we", "our", "us") is an e-commerce SaaS platform operated from India.
              We provide online store, order management, AI chat, and marketing tools to small businesses.
            </p>
            <p>
              For any privacy-related queries, contact us at{' '}
              <a href="mailto:support@Silarai.app" className="text-teal-600 hover:underline">
                support@Silarai.app
              </a>.
            </p>
          </Section>

          <Section title="2. Information we collect">
            <p><strong className="text-gray-800">Account information:</strong> When you register, we collect your name, email address, phone number, and business details.</p>
            <p><strong className="text-gray-800">Store data:</strong> Product listings, prices, images, orders, and customer details you add to your store.</p>
            <p><strong className="text-gray-800">Customer data:</strong> Names, phone numbers, and addresses collected from your end-customers when they place orders through your store.</p>
            <p><strong className="text-gray-800">Payment data:</strong> We do not store card numbers. Payments are processed by Razorpay. We receive a transaction reference and amount.</p>
            <p><strong className="text-gray-800">Usage data:</strong> Pages visited, features used, browser type, device type, and IP address — collected to improve the product.</p>
            <p><strong className="text-gray-800">Cookies:</strong> We use essential cookies to keep you logged in and preference cookies to remember your settings. We do not use advertising cookies.</p>
          </Section>

          <Section title="3. How we use your information">
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, operate, and maintain the Silarai platform</li>
              <li>Process your orders and payments</li>
              <li>Send transactional emails (order confirmations, password resets, etc.)</li>
              <li>Respond to support requests</li>
              <li>Send product updates and offers (you can unsubscribe at any time)</li>
              <li>Analyse usage to improve the product</li>
              <li>Comply with legal obligations under Indian law</li>
            </ul>
          </Section>

          <Section title="4. Sharing your information">
            <p>We do <strong className="text-gray-800">not</strong> sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-800">Razorpay</strong> — for payment processing</li>
              <li><strong className="text-gray-800">Cloudinary</strong> — for image storage</li>
              <li><strong className="text-gray-800">OpenAI</strong> — to power AI chat features (only product/store context is sent, never personal financial data)</li>
              <li><strong className="text-gray-800">Meta (WhatsApp)</strong> — to send messages via WhatsApp Business API if you enable that integration</li>
              <li><strong className="text-gray-800">Microsoft Azure</strong> — our cloud hosting provider</li>
              <li>Law enforcement, when required by Indian law</li>
            </ul>
            <p>All third-party providers are bound by their own privacy policies and data processing agreements.</p>
          </Section>

          <Section title="5. Data retention">
            <p>We retain your account and store data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance reasons.</p>
            <p>Customer order data may be retained for up to 7 years to comply with Indian tax and accounting regulations.</p>
          </Section>

          <Section title="6. Your rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-800">Access</strong> — request a copy of your data</li>
              <li><strong className="text-gray-800">Correction</strong> — update incorrect information</li>
              <li><strong className="text-gray-800">Deletion</strong> — request we delete your account and data</li>
              <li><strong className="text-gray-800">Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong className="text-gray-800">Opt-out</strong> — unsubscribe from marketing emails</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a href="mailto:support@Silarai.app" className="text-teal-600 hover:underline">
                support@Silarai.app
              </a>.
            </p>
          </Section>

          <Section title="7. Security">
            <p>We take security seriously. All data is encrypted in transit (TLS) and at rest. We use Microsoft Azure infrastructure with enterprise-grade security controls. Access to customer data is restricted to authorised personnel only.</p>
            <p>However, no system is 100% secure. If you discover a security issue, please report it to us immediately at support@Silarai.app.</p>
          </Section>

          <Section title="8. Children's privacy">
            <p>Silarai is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us data, we will delete it promptly.</p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or via an in-app notice. Continued use of Silarai after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Applicable law">
            <p>This Privacy Policy is governed by the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India.</p>
          </Section>

          <div className="mt-10 p-5 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
            Questions about this policy? Contact us at{' '}
            <a href="mailto:support@Silarai.app" className="text-teal-600 hover:underline font-medium">
              support@Silarai.app
            </a>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

