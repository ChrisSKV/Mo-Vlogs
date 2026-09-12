import type { Metadata } from "next";
import { Clause, LegalPage, Todo } from "@/components/legal-page";
import {
  CLOSE_DATE,
  EXCLUDED_TERRITORIES,
  FINAL_DATE,
  JUDGES,
  LEGAL_ADDRESS,
  LEGAL_ENTITY,
  PRIZE,
  PRIZE_EQUITY,
  PRIZE_RING_FENCED,
  RUBRIC,
  SHORTLIST_DATE,
  SUPPORT_EMAIL,
} from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Competition rules | The Build Challenge",
  description:
    "Full terms for the Build Challenge: who can enter, how entries are scored, what the investment is, and who decides.",
  robots: { index: true, follow: true },
};

/* ---------------------------------------------------------------------------
   DRAFTING FRAMEWORK — NOT LEGAL ADVICE. Counsel must review before entries
   open, and a UAE-qualified adviser must confirm the DET promotion permit and
   the advertiser permit separately.

   The structure exists to defeat one specific problem: prize + chance +
   consideration = lottery. Clause 5 removes CHANCE with a published, weighted,
   objective rubric. Clause 3 removes CONSIDERATION with genuinely free entry,
   stated unconditionally. Both have to be real in operation, not just on
   this page — if a closer ever says buying the training improves your odds,
   the defence collapses.
   ------------------------------------------------------------------------- */

export default function RulesPage() {
  return (
    <LegalPage title="Competition rules" updated={<Todo>{"{DATE}"}</Todo>}>
      <p className="rounded-2xl border border-line bg-surface p-5 text-[15px] leading-[1.65]">
        Plain English first: <span className="font-medium text-ink">it is free to enter</span>,
        you never have to buy anything, buying something does not help you win,
        and every entry is scored on the same four things, published below. If
        anything here is unclear, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-gold-deep underline underline-offset-2">
          {SUPPORT_EMAIL}
        </a>{" "}
        and we will answer.
      </p>

      <Clause n="1" title="Who is running this">
        <p>
          The promoter is {LEGAL_ENTITY}, {LEGAL_ADDRESS}{" "}
          <Todo>legal entity name and registered address required</Todo>. The
          promoter is responsible for the competition. Mo Vlogs takes part as a
          judge and as the investor.
        </p>
      </Clause>

      <Clause n="2" title="Who can enter">
        <p>
          You must be 18 or over on the closing date, and legally able to own
          and sign for a company in the country where you live.
        </p>
        <p>
          Open worldwide except {EXCLUDED_TERRITORIES}, and except any country
          where running or entering this competition would break local law.
          Employees of the promoter, the judges, and their immediate families
          cannot enter.
        </p>
        <p>
          One entry per person. If you enter more than once we will judge the
          first one.
        </p>
      </Clause>

      <Clause n="3" title="It is free to enter">
        <p className="font-medium text-ink">
          Entry is free. You do not have to buy anything to enter, to be
          shortlisted, or to win.
        </p>
        <p>
          The promoter also sells paid training. Buying it, or not buying it,
          makes no difference to your entry or to how it is scored. Nobody
          involved in judging is told who has bought anything.
        </p>
        <p>
          You will need a Base44 account to build your app. Base44 has a free
          plan. If you choose a paid Base44 plan, that money goes to Base44, not
          to us, and it does not affect your score.
        </p>
      </Clause>

      <Clause n="4" title="How to enter">
        <p>
          Put your name, email and phone number on the entry form. Build an app
          on Base44. Submit the live link before {CLOSE_DATE}{" "}
          <Todo>closing date and time, with timezone, required</Todo>.
        </p>
        <p>
          Entries received after that time are not judged. We are not
          responsible for entries that fail to reach us.
        </p>
      </Clause>

      <Clause n="5" title="How entries are scored">
        <p>
          Every entry is scored out of 100 on these four criteria, and on
          nothing else:
        </p>
        <ul className="space-y-1.5">
          {RUBRIC.map((r) => (
            <li key={r.label} className="flex justify-between gap-4 border-b border-line pb-1.5">
              <span>{r.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-gold-deep">{r.weight}%</span>
            </li>
          ))}
        </ul>
        <p>
          The named prizes are scored on the same sheet plus one published extra
          criterion each: Most Useful App on how many real people used it; Best
          First Build on how much was built from zero; Best Solution To A Local
          Problem on the problem it solves and who it solves it for.
        </p>
        <p>
          The judges are {JUDGES.join(", ")} and Mo Vlogs{" "}
          <Todo>judges must be named, with bios, and must have agreed in writing</Todo>. Their
          decision is final and no correspondence will be entered into.
        </p>
      </Clause>

      <Clause n="6" title="Dates">
        <p>
          Entries close {CLOSE_DATE}. The shortlist of 50 is published{" "}
          {SHORTLIST_DATE}, each with a live link. The final is filmed in Dubai
          on {FINAL_DATE}. The winner is announced at the final and contacted by
          phone and email within 7 days.{" "}
          <Todo>all three dates required, and every one must be operationally real</Todo>
        </p>
      </Clause>

      <Clause n="7" title="What the winner gets">
        <p>
          First place receives {PRIZE} invested into their business by Mo Vlogs
          personally, in exchange for a {PRIZE_EQUITY} stake, on the standard
          terms published at <Todo>{"{LINK TO SAFE PDF}"}</Todo>. The terms are
          the same for every entrant and are published in full before entries
          open. They will not change for this season.
        </p>
        <p className="font-medium text-ink">
          This is an investment, not a gift. You are giving up a stake in your
          company in exchange for the money.
        </p>
        {PRIZE_RING_FENCED && (
          <p>
            The {PRIZE} is held in a separate account and does not depend on you
            buying anything from the promoter, ever.
          </p>
        )}
        <p>
          Second to fifth place receive flights and hotel for the filmed final
          in Dubai. If a winner cannot travel or cannot obtain a visa, they join
          the final by video and receive an alternative agreed with them of
          equivalent value. Top 10 receive an on-camera review of their app by
          Mo or a panel member. Top 50 are listed in the public gallery.
        </p>
        <p>
          Prizes are not transferable and there is no cash alternative to the
          investment. Any tax arising on a prize is the winner&rsquo;s
          responsibility, so check your local rules.
        </p>
      </Clause>

      <Clause n="8" title="Conditions on the investment">
        <p>
          To receive the investment the winner must: be 18 or over; incorporate
          or already own a company the promoter can lawfully invest in; pass
          standard identity and anti-money-laundering checks, as with any real
          investment; and sign the published agreement.
        </p>
        <p>
          If the winner cannot meet these conditions within 30 days, or declines
          the investment, it passes to the runner-up on the same terms.
        </p>
      </Clause>

      <Clause n="9" title="If no entry is good enough">
        <p>
          The investment is still made, and Mo will say on camera why the bar
          was not cleared. The promoter will not withhold the prize silently or
          cancel the season without a public explanation.{" "}
          <Todo>
            confirm with Mo: unconditional award, or roll over and double for next season
          </Todo>
        </p>
      </Clause>

      <Clause n="10" title="Filming and publicity">
        <p>
          Shortlisted entrants agree that the promoter may show their app, its
          name and their first name publicly, including on Mo Vlogs&rsquo;
          channels. Finalists must agree to be filmed to take part in the final.
          The winner agrees to reasonable publicity about the investment.
        </p>
      </Clause>

      <Clause n="11" title="You keep what you build">
        <p className="font-medium text-ink">
          You own your app and everything in it. Entering does not transfer any
          intellectual property to the promoter, to the judges, or to Mo Vlogs.
        </p>
        <p>
          The only exception is first place, where the published investment
          agreement gives Mo the stated equity stake in the company. It does not
          cover the app itself.
        </p>
      </Clause>

      <Clause n="12" title="Your data">
        <p>
          We use your name, email and phone number to run the competition, to
          send you the Build Pack and training updates, and to call you about
          the competition and the paid training. You can tell us to stop at any
          time and we will. Full detail on the{" "}
          <a href="/privacy" className="font-medium text-gold-deep underline underline-offset-2">
            privacy page
          </a>
          .
        </p>
      </Clause>

      <Clause n="13" title="Not affiliated with Base44 or Wix">
        <p>
          The promoter is not affiliated with, endorsed by, sponsored by, or
          partnered with Base44 or Wix. Base44 is a product we teach people to
          use; the name is used only to describe it. Base44 has no official
          certification programme, and nothing here is one.
        </p>
        <p>
          Base44&rsquo;s own pricing, plans and features may change at any time
          and are outside our control.
        </p>
      </Clause>

      <Clause n="14" title="Changes and the boring parts">
        <p>
          If something outside our control makes it impossible to run the
          competition as described, we may change these rules, and we will
          publish what changed and why on this page.
        </p>
        <p>
          Nothing here excludes liability for death, personal injury or fraud.
          These rules are governed by the laws of{" "}
          <Todo>{"{JURISDICTION}"}</Todo>.
        </p>
        <p className="text-[13px] text-muted">
          This page is a drafting framework prepared by the build team and must
          be reviewed by qualified counsel before entries open. A UAE-qualified
          adviser should separately confirm whether a Dubai DET promotion permit
          and an advertiser permit are required.
        </p>
      </Clause>
    </LegalPage>
  );
}
