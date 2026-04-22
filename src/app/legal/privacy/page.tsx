import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Samvaya Matrimony",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1 className="type-heading-xl tracking-tight text-gray-900">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500">Last updated: March 2026</p>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">
          Information We Collect
        </h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          When you use Samvaya Matrimony, we collect information you provide
          directly, including personal details submitted through our forms,
          photographs uploaded to your profile, and conversations exchanged
          through our platform. We may also collect professional credentials and
          verification documents necessary to confirm your eligibility.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">
          How We Use Your Information
        </h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          Your information is used to facilitate curated matchmaking between
          verified medical professionals, to verify your identity and
          professional credentials, and to communicate with you about potential
          matches and service updates. We do not sell your personal information
          to third parties.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">Data Security</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          We implement industry-standard security measures to protect your
          personal data, including encryption of data in transit and at rest,
          strict access controls limiting who can view your information, and
          regular security audits of our systems and processes.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">Your Rights</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          You have the right to access, correct, or request deletion of your
          personal data at any time. To exercise any of these rights, please
          contact our team directly and we will process your request promptly.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">Contact Us</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          If you have questions or concerns about this privacy policy or your
          personal data, please reach out to us at{" "}
          <a
            href="mailto:support@samvayamatrimony.com"
            className="text-rose-700 underline hover:text-rose-900"
          >
            support@samvayamatrimony.com
          </a>
          .
        </p>
      </section>

      <hr className="my-10 border-gray-200" />

      <p className="text-sm text-gray-400 italic">
        This privacy policy is a placeholder and will be updated with full legal
        terms before public launch.
      </p>

      <div className="mt-6">
        <Link
          href="/legal/terms"
          className="text-sm text-rose-700 underline hover:text-rose-900"
        >
          Terms of Service
        </Link>
      </div>
    </article>
  );
}
