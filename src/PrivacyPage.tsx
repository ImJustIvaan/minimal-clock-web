import { useEffect, useState } from 'react';

const EFFECTIVE_DATE = 'July 26, 2026';
const CONTACT_EMAIL = 'minimalclock@ivaan.cc';

export default function PrivacyPage() {
  const [isDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('isDarkMode');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // The browser tries to jump to the URL's #hash before React has rendered
  // any content, so a direct link like /privacy#deleting-your-data lands
  // at the top of the page instead. Scroll to it ourselves once mounted.
  useEffect(() => {
    if (!window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    el?.scrollIntoView();
  }, []);

  const bg = isDarkMode ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900';
  const muted = isDarkMode ? 'text-zinc-400' : 'text-zinc-500';
  const heading = isDarkMode ? 'text-zinc-100' : 'text-zinc-800';
  const link = isDarkMode ? 'text-zinc-100 underline' : 'text-zinc-900 underline';

  return (
    <div className={`min-h-screen w-full ${bg}`}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className={`text-sm ${muted} hover:${heading}`}>&larr; Back to Minimal Clock</a>

        <h1 className="text-3xl font-semibold mt-6 mb-2">Privacy Policy</h1>
        <p className={`text-sm ${muted} mb-10`}>Effective {EFFECTIVE_DATE}</p>

        <div className="space-y-8 leading-relaxed">
          <p>
            This policy covers Minimal Clock on every platform it's available on: iPhone/iPad,
            Android, macOS, Windows, Linux, Apple Watch, Apple TV, Android TV, and this website
            (time.ivaan.cc). They're built and maintained by one person (Ivaan S / @ImJustIvaan),
            not a company, and all of them share the same backend described below.
          </p>

          <section>
            <h2 className={`text-lg font-medium mb-2 ${heading}`}>What Minimal Clock does with your data</h2>
            <p>
              Minimal Clock is a clock app. Most of it — the time, date, timer, and every display
              setting (theme, font, 24-hour format, timezone, world clock cities, and so on) —
              works entirely on your own device and is never sent anywhere. Notifications (timer
              finished, hourly chime, a countdown ending) are scheduled locally by your device's
              own operating system, not through any push notification or analytics service.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-medium mb-2 ${heading}`}>If you create an account</h2>
            <p className="mb-3">
              Countdowns are the one feature that needs an account, so you can create a countdown
              on one device and see it on another. If you sign in, we collect:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your email address (for email/password or magic-link sign-in)</li>
              <li>Your name and email if you choose "Continue with Google" instead</li>
              <li>The countdowns you create (a title and a target date/time) and which countdowns you follow, including whether you've asked to be notified when one ends</li>
            </ul>
            <p className="mt-3">
              That's it — no other profile data, no contacts, no location, no camera or microphone
              access, and no advertising or analytics tracking of any kind, in any version of the
              app or on this website.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-medium mb-2 ${heading}`}>Signing in on a Watch or TV</h2>
            <p>
              The Apple Watch app receives your session from your iPhone directly, over Apple's
              own on-device sync — it never talks to our servers on its own. The Apple TV and
              Android TV apps sign in via a QR code: scanning it on your phone (while already
              signed in) hands the TV a session token through a short-lived database row that's
              deleted immediately after the TV picks it up. That row is only ever readable by
              whoever has the exact one-time code shown on the TV screen.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-medium mb-2 ${heading}`}>Who else sees this data</h2>
            <p>
              Account and countdown data is stored with{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" className={link}>
                Supabase
              </a>
              , which hosts the database and handles sign-in on our behalf. If you sign in with
              Google, Google processes your sign-in the same way it does for any "Sign in with
              Google" button, under Google's own privacy policy. We don't sell, rent, or share
              your data with anyone else, and we don't run ads.
            </p>
          </section>

          <section id="deleting-your-data">
            <h2 className={`text-lg font-medium mb-2 ${heading}`}>Deleting your data</h2>
            <p>
              You can delete any countdown you own at any time from within the app. On the phone
              and desktop apps, Settings has a "Delete Account" button that immediately and
              permanently deletes your account along with every countdown you created and
              everything you follow — this can't be undone. If you'd rather have it removed by
              email instead, contact{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-medium mb-2 ${heading}`}>Children's privacy</h2>
            <p>
              Minimal Clock isn't directed at children under 13, and we don't knowingly collect
              information from anyone in that age group.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-medium mb-2 ${heading}`}>Changes to this policy</h2>
            <p>
              If this policy changes, the updated version will be posted here with a new effective
              date at the top.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-medium mb-2 ${heading}`}>Contact</h2>
            <p>
              Questions about this policy or your data: {' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
