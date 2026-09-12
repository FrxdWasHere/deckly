import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Deckly" },
      { name: "description", content: "The terms that apply when you use Deckly for study decks, quizzes, progress tracking, and account sync." },
      { property: "og:title", content: "Terms of Service — Deckly" },
      { property: "og:description", content: "The terms governing use of Deckly and its study tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      eyebrow="A straightforward agreement"
      title="Terms of service"
      intro="These terms govern your use of Deckly. By using the service, you agree to use it responsibly and lawfully."
    >
      <section><h2>Using Deckly</h2><p>You may use Deckly to create, import, organise, and practise study materials. You are responsible for the accuracy of your content and for complying with laws, school rules, and third-party rights.</p></section>
      <section><h2>Your account</h2><p>Keep your sign-in details secure and provide accurate information. You are responsible for activity under your account. Guest data is tied to one browser and may be lost if that browser’s storage is cleared.</p></section>
      <section><h2>Your content</h2><p>You retain ownership of the material you add to Deckly. You grant Deckly the limited permission needed to store, process, display, and sync that content solely to provide the service.</p></section>
      <section><h2>Acceptable use</h2><p>Do not misuse Deckly, interfere with its operation, attempt unauthorised access, distribute malicious content, violate intellectual-property rights, or use the service for unlawful activity.</p></section>
      <section><h2>AI-generated material</h2><p>You are responsible for reviewing prompts and material produced by third-party AI services. Deckly does not guarantee that imported content is complete, accurate, or suitable for an assessment.</p></section>
      <section><h2>Service availability</h2><p>Deckly may change, suspend, or discontinue features. We work to keep the service reliable, but uninterrupted access and permanent preservation of data are not guaranteed. Keep copies of important study material.</p></section>
      <section><h2>Disclaimer and liability</h2><p>Deckly is provided on an “as is” and “as available” basis to the extent permitted by law. It is a study aid, not professional or academic advice. Liability is limited to the fullest extent permitted by applicable law.</p></section>
      <section><h2>Termination and changes</h2><p>You may stop using Deckly at any time. Access may be restricted for serious or repeated violations of these terms. Updated terms will show a revised effective date, and continued use after an update constitutes acceptance.</p></section>
    </LegalPage>
  );
}