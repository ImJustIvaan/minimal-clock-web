import { useState } from 'react';

const SUPPORT_EMAIL = 'minimalclock@ivaan.cc';

export default function SupportPage() {
  const [isDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('isDarkMode');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const bg = isDarkMode ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900';
  const muted = isDarkMode ? 'text-zinc-400' : 'text-zinc-500';
  const card = isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';

  return (
    <div className={`min-h-screen w-full ${bg}`}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className={`text-sm ${muted} hover:opacity-80 transition-opacity`}>&larr; Back to Minimal Clock</a>

        <h1 className="text-3xl font-semibold mt-6 mb-2">Support</h1>
        <p className={`text-sm ${muted} mb-10`}>Get help with Minimal Clock</p>

        <div className="space-y-6">
          <div className={`border rounded-2xl p-6 ${card}`}>
            <h2 className="text-lg font-semibold mb-2">Contact Us</h2>
            <p className={`text-sm leading-relaxed ${muted} mb-4`}>
              Have a question, found a bug, or want to suggest a feature? Send us an email and we'll get back to you as soon as possible.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium text-sm hover:opacity-80 transition-opacity"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className={`border rounded-2xl p-6 ${card}`}>
            <h2 className="text-lg font-semibold mb-2">Frequently Asked Questions</h2>
            <div className="space-y-5 mt-4">
              {[
                {
                  q: 'Is Minimal Clock free?',
                  a: 'Yes, the web app at clock.gominimal.app is completely free. The desktop and mobile apps are also free to download.',
                },
                {
                  q: 'Why is my antivirus / OS flagging the app?',
                  a: 'Code signing certificates cost money. As an independent developer, the app is unsigned, which can trigger warnings. The app is open source — you can review the code on GitHub.',
                },
                {
                  q: 'Where can I find the source code?',
                  a: 'The desktop app source is available on GitHub at github.com/ImJustIvaan/Minimal-Clock-Desktop.',
                },
                {
                  q: 'How do I delete my data?',
                  a: 'If you signed in with an account, you can request data deletion by emailing us. See the Privacy Policy for details.',
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="font-medium text-sm mb-1">{q}</p>
                  <p className={`text-sm leading-relaxed ${muted}`}>{a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`border rounded-2xl p-6 ${card}`}>
            <h2 className="text-lg font-semibold mb-2">Other Resources</h2>
            <div className="flex flex-col gap-3 mt-2">
              <a href="/privacy" className={`text-sm underline underline-offset-2 ${muted} hover:opacity-80 transition-opacity`}>Privacy Policy</a>
              <a href="/download" className={`text-sm underline underline-offset-2 ${muted} hover:opacity-80 transition-opacity`}>Download the App</a>
              <a href="https://github.com/ImJustIvaan/Minimal-Clock-Desktop" target="_blank" rel="noopener noreferrer" className={`text-sm underline underline-offset-2 ${muted} hover:opacity-80 transition-opacity`}>GitHub (Desktop App)</a>
            </div>
          </div>
        </div>

        <p className={`text-xs mt-12 ${muted}`}>
          Minimal Clock &copy; 2026 Ivaan.CC &mdash; Made by <a href="https://ivaan.cc" target="_blank" rel="noopener noreferrer" className="underline">@ImJustIvaan</a>
        </p>
      </div>
    </div>
  );
}
