import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Samvaya Matrimony",
};

export default function TermsOfServicePage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1 className="type-heading-xl tracking-tight text-gray-900">
        Terms of Service
      </h1>
      <p className="text-sm text-gray-500">Last updated: March 2026</p>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">Eligibility</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          Samvaya Matrimony is an exclusive matchmaking service available only to
          verified medical professionals, including doctors, dentists, and allied
          healthcare practitioners. By registering, you confirm that you hold a
          valid medical qualification and are legally eligible for marriage.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">
          Service Description
        </h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          We provide a curated, human-assisted matchmaking service. Our team
          reviews profiles, verifies credentials, and facilitates introductions
          between compatible members. Samvaya Matrimony is not a self-service
          dating platform; all matches are proposed by our team based on your
          preferences and profile.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">Fees</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          The following fees apply to our service:
        </p>
        <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
          <li>
            <strong>Verification fee:</strong> &#8377;4,130 (one-time,
            non-refundable)
          </li>
          <li>
            <strong>Membership fee:</strong> &#8377;41,300 (non-refundable)
          </li>
        </ul>
        <p className="mt-2 text-gray-700 leading-relaxed">
          All fees are non-refundable once paid. Payment of the verification fee
          does not guarantee acceptance into the membership programme.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">User Conduct</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          You agree to provide truthful, accurate, and complete information in
          your profile and all communications. Any misrepresentation of personal
          details, professional qualifications, or marital status will result in
          immediate termination of your membership without refund.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">Privacy</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          Your use of Samvaya Matrimony is also governed by our{" "}
          <Link
            href="/legal/privacy"
            className="text-rose-700 underline hover:text-rose-900"
          >
            Privacy Policy
          </Link>
          , which describes how we collect, use, and protect your personal
          information.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">
          Limitation of Liability
        </h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          Samvaya Matrimony facilitates introductions but does not guarantee any
          particular outcome. We are not liable for the conduct of any member,
          the accuracy of information provided by members, or any damages
          arising from your use of the service. Our total liability shall not
          exceed the fees you have paid to us.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="type-heading-lg text-gray-900">Contact Us</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          For questions about these terms, please contact us at{" "}
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
        This terms of service document is a placeholder and will be updated with
        full legal terms before public launch.
      </p>

      <div className="mt-6">
        <Link
          href="/legal/privacy"
          className="text-sm text-rose-700 underline hover:text-rose-900"
        >
          Privacy Policy
        </Link>
      </div>
    </article>
  );
}
