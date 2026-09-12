import type { Metadata } from "next";
import { Clause, LegalPage, Todo } from "@/components/legal-page";
import { COMPANY, LEGAL_ADDRESS, LEGAL_ENTITY, SUPPORT_EMAIL } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Privacy | The Build Challenge",
  description: "What we collect, why we call you, and how to make us stop.",
  robots: { index: true, follow: true },
};

/* ---------------------------------------------------------------------------
   DRAFTING FRAMEWORK — NOT LEGAL ADVICE.

   Written to be READ, not to be survived. This audience has been warned that
   people impersonate Mo to harvest personal details, so a privacy page that
   sounds like a law firm confirms the fear. Plain sentences, and the answer to
   "how do I make this stop" is in the second paragraph rather than clause 11.
   ------------------------------------------------------------------------- */

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated={<Todo>{"{DATE}"}</Todo>}>
      <p className="rounded-2xl border border-line bg-surface p-5 text-[15px] leading-[1.65]">
        Short version: we collect your name, email and phone number. We use them
        to send you the Build Pack, to call you about the competition and our
        paid training, and nothing else. We never sell them. To make it all
        stop, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-gold-deep underline underline-offset-2">
          {SUPPORT_EMAIL}
        </a>{" "}
        and say so. That is the whole process.
      </p>

      <Clause n="1" title="Who we are">
        <p>
          {LEGAL_ENTITY}, {LEGAL_ADDRESS} <Todo>legal entity and address required</Todo>,
          trading as {COMPANY}. We decide how your information is used, which
          makes us the data controller.
        </p>
      </Clause>

      <Clause n="2" title="What we collect">
        <p>
          <span className="font-medium text-ink">What you type:</span> your first name,
          email address and phone number. Later, on the confirmation page, your
          answer to what you want to build, who you are building for, how much
          time you have, and when it suits you to be called.
        </p>
        <p>
          <span className="font-medium text-ink">What your browser sends:</span> the
          country your connection appears to be in, your device type and
          browser, and where you came from, usually a link in one of
          Mo&rsquo;s videos.
        </p>
        <p>
          We do not ask for and do not want your bank details, card number,
          passport, or any password. Nobody from our team will ever ask you for
          those. If someone does, it is not us.
        </p>
      </Clause>

      <Clause n="3" title="Why we call you">
        <p className="font-medium text-ink">
          We call you because you gave us your number and asked us to.
        </p>
        <p>
          The call covers your idea, how to enter the competition, and what our
          paid training includes. We tell you this before you give us the
          number, on the form itself, so there is no surprise call.
        </p>
        <p>
          We call during reasonable hours where you are. If we miss you we try
          once more, then email you so you can pick a better time. If you tell
          us to stop calling, we stop, and we add your number to a list so
          nobody calls it again by mistake.
        </p>
      </Clause>

      <Clause n="4" title="Who else sees it">
        <p>
          The people who run our sales calls, and the software we use to store
          entries, send email and make calls{" "}
          <Todo>name the CRM, email and telephony providers here</Todo>. They are
          only allowed to use your information to do that work for us.
        </p>
        <p>We do not sell your information. We do not share it for anyone else to advertise to you.</p>
      </Clause>

      <Clause n="5" title="How long we keep it">
        <p>
          For as long as the competition is running and for{" "}
          <Todo>{"{N}"}</Todo> months after it ends, so we can contact you about
          the next season. Then we delete it. If you ask us to delete it sooner,
          we do it within 30 days.
        </p>
      </Clause>

      <Clause n="6" title="Age">
        <p>
          This competition is for people aged 18 and over and we do not
          knowingly collect information from anyone younger. The confirmation
          page asks your age before your entry is complete. If you tell us you
          are under 18 we take you off the call list immediately and will delete
          your details on request, same day.
        </p>
        <p>
          If you are a parent and think we hold your child&rsquo;s details,
          email us and we will remove them.
        </p>
      </Clause>

      <Clause n="7" title="Your choices">
        <p>
          You can ask us for a copy of what we hold, ask us to correct it, ask
          us to delete it, or tell us to stop contacting you. One email to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-gold-deep underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>{" "}
          does any of them. We do not make you fill in a form or explain why.
        </p>
      </Clause>

      <Clause n="8" title="Cookies">
        <p>
          We use what the site needs to work, and analytics that tell us how
          many people reached each part of the page, so we can fix what is
          broken <Todo>list the analytics and any advertising pixels actually deployed</Todo>.
        </p>
      </Clause>

      <Clause n="9" title="Where your information goes">
        <p>
          We are based in the UAE and our team works there, so your information
          is handled there and in any country where our software providers keep
          their servers <Todo>counsel to confirm transfer wording for the territories in scope</Todo>.
        </p>
      </Clause>

      <p className="text-[13px] text-muted">
        This page is a drafting framework prepared by the build team and must be
        reviewed by qualified counsel before the form goes live.
      </p>
    </LegalPage>
  );
}
