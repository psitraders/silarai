import { LandingLayout } from '../../components/landing/LandingLayout';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function RefundPage() {
  return (
    <LandingLayout>
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-gray-500">Last updated: 18 May 2025</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-10 text-sm text-teal-800 leading-relaxed">
            <strong>Our goal is fair and transparent pricing.</strong> We want you to feel confident trying Silarai. If something isn't right, reach out to us and we'll do our best to help.
          </div>

          {/* Quick summary */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800 text-sm">Eligible for refund</span>
              </div>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• First payment — if requested within 7 days</li>
                <li>• Service was unavailable for extended periods</li>
                <li>• Duplicate payment charged in error</li>
                <li>• Technical issue we couldn't resolve</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-800 text-sm">Not eligible for refund</span>
              </div>
              <ul className="space-y-2 text-sm text-red-800">
                <li>• Change of mind after 7 days</li>
                <li>• Partial month usage after cancellation</li>
                <li>• Violation of our Terms of Service</li>
                <li>• Annual plans (after 7-day window)</li>
              </ul>
            </div>
          </div>

          <Section title="1. Free plan">
            <p>The free plan has no associated cost, so no refunds apply. You can use the free plan indefinitely with no obligation to upgrade.</p>
          </Section>

          <Section title="2. Monthly subscriptions">
            <p><strong className="text-gray-800">7-day refund window:</strong> If you subscribe to a paid monthly plan and are not satisfied, you may request a full refund within 7 days of your first payment. No questions asked.</p>
            <p><strong className="text-gray-800">After 7 days:</strong> Monthly subscriptions are non-refundable after the 7-day window. You may cancel at any time and your access will continue until the end of the current billing period.</p>
            <p>We do not offer partial refunds for the remaining days in a billing period after cancellation.</p>
          </Section>

          <Section title="3. Annual subscriptions">
            <p><strong className="text-gray-800">7-day refund window:</strong> Annual plan purchases are eligible for a full refund if requested within 7 days of payment.</p>
            <p><strong className="text-gray-800">After 7 days:</strong> Annual subscriptions are generally non-refundable after the 7-day window. However, we may offer a pro-rated credit at our discretion in exceptional circumstances — please contact us to discuss your situation.</p>
          </Section>

          <Section title="4. Service disruptions">
            <p>If Silarai experiences a significant outage or service disruption that materially impacts your ability to use the platform for more than 24 continuous hours, you may be eligible for a service credit.</p>
            <p>Credits are calculated as a pro-rated amount for the affected period and applied to your next billing cycle. Credits are not transferable and have no cash value.</p>
          </Section>

          <Section title="5. Billing errors">
            <p>If you were charged incorrectly — such as being billed twice or charged a wrong amount — please contact us immediately. We will investigate and, if confirmed, issue a full refund of the erroneous charge within 5–7 business days.</p>
          </Section>

          <Section title="6. How to request a refund">
            <p>To request a refund, email us at{' '}
              <a href="mailto:support@Silarai.app" className="text-teal-600 hover:underline">
                support@Silarai.app
              </a>{' '}
              with:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your registered email address</li>
              <li>The date and amount of the payment</li>
              <li>Reason for the refund request</li>
            </ul>
            <p>We aim to respond to all refund requests within 2 business days. Approved refunds are processed within 5–10 business days and returned to the original payment method via Razorpay.</p>
          </Section>

          <Section title="7. Subscription cancellation">
            <p>You can cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period — you will not be charged again after that date.</p>
            <p>Cancelling your subscription does not automatically delete your account or data. Your store data is retained for 30 days after the subscription ends, after which you may lose access to premium features.</p>
          </Section>

          <Section title="8. Changes to this policy">
            <p>We reserve the right to modify this Refund Policy at any time. Changes will be notified via email or in-app notice. The policy in effect at the time of your purchase governs that transaction.</p>
          </Section>

          <div className="mt-10 p-5 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
            <p className="mb-2">Have a billing issue or refund request?</p>
            <a href="mailto:support@Silarai.app" className="text-teal-600 hover:underline font-medium">
              support@Silarai.app
            </a>
            {' '}or{' '}
            <Link to="/contact" className="text-teal-600 hover:underline font-medium">
              visit our contact page
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

