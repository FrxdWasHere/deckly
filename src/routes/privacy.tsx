import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Deckly" },
      { name: "description", content: "Learn what Deckly stores, how account sync works, and the choices available to guests and account holders." },
      { property: "og:title", content: "Privacy Policy — Deckly" },
      { property: "og:description", content: "How Deckly handles account data, study content, progress, and guest information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Your data, clearly explained"
      title="Privacy policy"
      intro="Deckly is designed to keep your study materials useful across sessions and devices without obscuring what is stored."
    >
      <section><h2>Information Deckly handles</h2><p>When you create an account, Deckly stores your account identifier, profile preferences, decks, questions, notes, bookmarks, quiz results, study history, XP, streaks, achievements, and settings. Uploaded wallpapers are stored privately for your account.</p></section>
      <section><h2>Guest mode</h2><p>If you continue as a guest, your Deckly content remains in your browser on that device. It is not synced to an account unless you later sign in and choose to bring that work with you.</p></section>
      <section><h2>How information is used</h2><p>Your information is used to operate Deckly, restore your study library, calculate progress, personalise your experience, and keep signed-in devices in sync. Deckly does not sell your personal information.</p></section>
      <section><h2>AI services</h2><p>Deckly creates prompts for you to copy into an AI service of your choice. Deckly does not send those prompts or your study materials to an AI provider on your behalf. Any service you choose has its own privacy practices.</p></section>
      <section><h2>Service providers</h2><p>Deckly relies on infrastructure providers for secure hosting, account access, storage, and application delivery. They process information only as needed to provide those services and according to their own legal obligations.</p></section>
      <section><h2>Security and retention</h2><p>Reasonable technical safeguards are used to protect account data. No online service can guarantee absolute security. Information is retained while needed to provide Deckly, meet legal obligations, resolve disputes, or protect the service.</p></section>
      <section><h2>Your choices</h2><p>You can use guest mode, update your profile and settings, remove study content, or stop using the service. Account deletion requests will remove or de-identify information unless retention is legally required.</p></section>
      <section><h2>Changes</h2><p>This policy may be updated as Deckly changes. The effective date above will be revised when material updates are made.</p></section>
    </LegalPage>
  );
}