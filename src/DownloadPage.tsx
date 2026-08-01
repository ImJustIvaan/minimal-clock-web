import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown, ChevronUp, Download, X } from 'lucide-react';

const APK_URL = 'https://github.com/ImJustIvaan/Minimal-Clock-Mobile/releases/download/MajorUpdates/MinimalClock.apk';
const IOS_APPSTORE_URL = 'https://apps.apple.com/app/minimal-clock/id6795197112';
const WIN_X64_URL = 'https://github.com/ImJustIvaan/Minimal-Clock-Desktop/releases/download/v1.0.0/MinimalClock-x64.exe';
const WIN_ARM_URL = 'https://github.com/ImJustIvaan/Minimal-Clock-Desktop/releases/download/v1.0.0/MinimalClock-arm64.exe';
const MAC_DMG_URL = 'https://github.com/ImJustIvaan/Minimal-Clock-Desktop/releases/download/v1.0.0/MinimalClock.dmg';
const LINUX_DEB_URL = 'https://github.com/ImJustIvaan/Minimal-Clock-Desktop/releases/download/v1.0.0/MinimalClock.deb';
const LINUX_APPIMAGE_URL = 'https://github.com/ImJustIvaan/Minimal-Clock-Desktop/releases/download/v1.0.0/MinimalClock.AppImage';

type Platform = {
  id: string;
  emoji: string;
  name: string;
  downloadUrl?: string;
  downloadNote?: string;
  steps: { text: string; bold?: string[] }[];
  note?: string;
};

const platforms: Platform[] = [
  {
    id: 'android',
    emoji: '🤖',
    name: 'Android',
    downloadUrl: APK_URL,
    downloadNote: 'Enable "Install unknown apps" in Settings if prompted.',
    steps: [
    ],
  },
  {
    id: 'ios',
    emoji: '🍎',
    name: 'iPhone & iPad (iOS)',
    downloadUrl: IOS_APPSTORE_URL,
    steps: [],
  },
  {
    id: 'windows',
    emoji: '🪟',
    name: 'Windows',
    steps: [],
  },
  {
    id: 'macos',
    emoji: '🍏',
    name: 'macOS',
    steps: [],
  },
  {
    id: 'linux',
    emoji: '🐧',
    name: 'Linux',
    steps: [],
  },
];

function HighlightedText({ text, bold = [] }: { text: string; bold?: string[] }) {
  if (bold.length === 0) return <span>{text}</span>;
  const regex = new RegExp(`(${bold.map(b => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        bold.includes(part) ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// Detect Windows architecture via userAgentData or UA string
async function detectWindowsArch(): Promise<'x64' | 'arm' | null> {
  try {
    // @ts-ignore
    if (navigator.userAgentData?.getHighEntropyValues) {
      // @ts-ignore
      const data = await navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness']);
      const arch: string = data.architecture || '';
      if (arch === 'arm') return 'arm';
      if (arch === 'x86' && data.bitness === '64') return 'x64';
      if (arch === 'x86') return 'x64';
    }
  } catch {}
  // Fallback: UA string
  const ua = navigator.userAgent;
  if (/ARM/i.test(ua)) return 'arm';
  if (/Win64|WOW64|x64/i.test(ua)) return 'x64';
  return null;
}

function WindowsWarningSection({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="mt-4 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
      >
        <span className="text-sm font-semibold">Why is Microsoft flagging this app?</span>
        {open ? <ChevronUp size={16} className="opacity-40 shrink-0" /> : <ChevronDown size={16} className="opacity-40 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-4">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdAAo-mVyrbFsLKDpbJZti2neQJz59tdp-ebBja-GafRb1IQCP-hcz7Oly&s=10"
            alt="Microsoft SmartScreen warning"
            className="w-full rounded-lg mb-3 border border-zinc-200 dark:border-zinc-700"
          />
          <p className="text-xs opacity-60 leading-relaxed mb-4">
            Microsoft shows this because this app was not signed by them, which costs a heavy monthly subscription. As an independent developer, I cannot afford it. Don't worry — this app is safe and open source on{' '}
            <a href="https://github.com/ImJustIvaan/Minimal-Clock-Desktop" target="_blank" rel="noopener noreferrer" className="underline font-medium">my GitHub repo</a>. Use the steps below to fix this.
          </p>
          <ol className="flex flex-col gap-2">
            {['Click "More info"', 'Click "Run"'].map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-xs font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function MacWarningSection({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="mt-4 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
      >
        <span className="text-sm font-semibold">Why is Apple flagging this app?</span>
        {open ? <ChevronUp size={16} className="opacity-40 shrink-0" /> : <ChevronDown size={16} className="opacity-40 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-4">
          <p className="text-xs opacity-60 leading-relaxed mb-3">
            Apple shows this because this app was not signed by them, which costs a heavy yearly fee. As an independent developer, I cannot afford it. Don't worry — this app is safe and open source on{' '}
            <a href="https://github.com/ImJustIvaan/Minimal-Clock-Desktop" target="_blank" rel="noopener noreferrer" className="underline font-medium">my GitHub repo</a>. Use the steps below to fix this.
          </p>
          <img
            src="https://images.guns.lol/2f4eebc99a43ced319d63126bd765c3ffd3cb5da/zw8n6Q.png"
            alt="Apple Gatekeeper warning"
            className="w-full rounded-lg mb-4 border border-zinc-200 dark:border-zinc-700"
          />
          <ol className="flex flex-col gap-5">
            <li>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <span className="text-xs font-medium">Open Settings</span>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <span className="text-xs font-medium">Open Privacy and Security</span>
              </div>
              <img src="https://images.guns.lol/2f4eebc99a43ced319d63126bd765c3ffd3cb5da/ybJyUx.png" alt="Privacy and Security settings" className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700" />
            </li>
            <li>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <span className="text-xs font-medium">Scroll down and click Open Anyway under the Minimal Clock section</span>
              </div>
              <img src="https://images.guns.lol/2f4eebc99a43ced319d63126bd765c3ffd3cb5da/KwiH17.png" alt="Open Anyway button" className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700" />
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

function WindowsArchPopup({ onClose, onDownload }: { onClose: () => void; onDownload: () => void }) {
  const [detected, setDetected] = useState<'x64' | 'arm' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    detectWindowsArch().then(setDetected);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={ref} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold tracking-tight">Choose Version</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={WIN_X64_URL}
            onClick={() => { onClose(); onDownload(); }}
            className="flex items-center justify-between p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-semibold flex items-center gap-2">
                Windows x64
                {detected === 'x64' && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Detected
                  </span>
                )}
              </div>
              <div className="text-xs opacity-50 mt-0.5">Most modern PCs (Intel / AMD)</div>
            </div>
            <Download size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href={WIN_ARM_URL}
            onClick={() => { onClose(); onDownload(); }}
            className="flex items-center justify-between p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-semibold flex items-center gap-2">
                Windows ARM
                {detected === 'arm' && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Detected
                  </span>
                )}
              </div>
              <div className="text-xs opacity-50 mt-0.5">Surface Pro X, Snapdragon PCs</div>
            </div>
            <Download size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {detected && (
          <p className="text-xs opacity-40 text-center mt-4">
            We detected your device as <strong>{detected === 'x64' ? 'x64' : 'ARM'}</strong>. Not sure? Pick x64.
          </p>
        )}
        {!detected && (
          <p className="text-xs opacity-40 text-center mt-4">Not sure which to pick? Choose x64.</p>
        )}
      </div>
    </div>
  );
}

function PackageDropdown({ label, command, onCopy }: { label: string; command: string; onCopy?: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    });
  }
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
      >
        <span className="text-sm font-semibold">{label}</span>
        {open ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40" />}
      </button>
      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-4">
          <div className="relative">
            <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 pr-20 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed font-mono">{command}</pre>
            <button
              onClick={copy}
              className="absolute top-2 right-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-80 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WindowsCard() {
  const [open, setOpen] = useState(true);
  const [showArchPopup, setShowArchPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [showWarningDropdown, setShowWarningDropdown] = useState(false);

  return (
    <>
      {showArchPopup && <WindowsArchPopup onClose={() => setShowArchPopup(false)} onDownload={() => setShowWarningPopup(true)} />}
      {showWarningPopup && <WindowsWarningPopup onClose={() => setShowWarningPopup(false)} />}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🪟</span>
            <span className="text-xl font-semibold tracking-tight">Windows</span>
          </div>
          {open ? <ChevronUp size={20} className="opacity-40" /> : <ChevronDown size={20} className="opacity-40" />}
        </button>

        {open && (
          <div className="px-6 pb-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="mt-5">
              <button
                onClick={() => setShowArchPopup(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download size={16} />
                Download for Windows
              </button>
            </div>
            <p className="text-xs opacity-40 mt-4 mb-2">or use</p>
            <div className="flex flex-col gap-2">
              <PackageDropdown label="winget" command="winget install ImJustIvaan.MinimalClock" onCopy={() => setShowWarningPopup(true)} />
              <PackageDropdown label="choco" command="choco install MinimalClock" onCopy={() => setShowWarningPopup(true)} />
            </div>
            <WindowsWarningSection open={showWarningDropdown} onToggle={() => setShowWarningDropdown(o => !o)} />
          </div>
        )}
      </div>
    </>
  );
}

function WindowsWarningPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 rounded-2xl shadow-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4 gap-3">
          <h3 className="text-base font-bold tracking-tight leading-snug">Why is Microsoft flagging this app, and how to install it</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdAAo-mVyrbFsLKDpbJZti2neQJz59tdp-ebBja-GafRb1IQCP-hcz7Oly&s=10"
          alt="Microsoft SmartScreen warning"
          className="w-full rounded-lg mb-4 border border-zinc-200 dark:border-zinc-700"
        />
        <p className="text-sm opacity-70 leading-relaxed mb-5">
          Microsoft shows this because this app was not signed by them, which costs a heavy monthly subscription. As an independent developer, I cannot afford it. Don't worry — this app is safe and open source on{' '}
          <a href="https://github.com/ImJustIvaan/Minimal-Clock-Desktop" target="_blank" rel="noopener noreferrer" className="underline font-medium">my GitHub repo</a>. Use the steps below to fix this.
        </p>
        <ol className="flex flex-col gap-3">
          {['Click "More info"', 'Click "Run"'].map((step, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-sm font-medium">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function MacWarningPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 rounded-2xl shadow-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4 gap-3">
          <h3 className="text-base font-bold tracking-tight leading-snug">Why is Apple flagging this app, and how to install it</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm opacity-70 leading-relaxed mb-4">
          Apple shows this because this app was not signed by them, which costs a heavy yearly fee. As an independent developer, I cannot afford it. Don't worry — this app is safe and open source on{' '}
          <a href="https://github.com/ImJustIvaan/Minimal-Clock-Desktop" target="_blank" rel="noopener noreferrer" className="underline font-medium">my GitHub repo</a>. Use the steps below to fix this.
        </p>
        <img
          src="https://images.guns.lol/2f4eebc99a43ced319d63126bd765c3ffd3cb5da/zw8n6Q.png"
          alt="Apple Gatekeeper warning"
          className="w-full rounded-lg mb-5 border border-zinc-200 dark:border-zinc-700"
        />
        <ol className="flex flex-col gap-5">
          <li>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <span className="text-sm font-medium">Open Settings</span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <span className="text-sm font-medium">Open Privacy and Security</span>
            </div>
            <img src="https://images.guns.lol/2f4eebc99a43ced319d63126bd765c3ffd3cb5da/ybJyUx.png" alt="Privacy and Security settings" className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700" />
          </li>
          <li>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">3</span>
              <span className="text-sm font-medium">Scroll down and click Open Anyway under the Minimal Clock section</span>
            </div>
            <img src="https://images.guns.lol/2f4eebc99a43ced319d63126bd765c3ffd3cb5da/KwiH17.png" alt="Open Anyway button" className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700" />
          </li>
        </ol>
      </div>
    </div>
  );
}

const BREW_COMMAND = `brew tap ImJustIvaan/minimalclock
brew install --cask minimal-clock`;

function MacCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">🍏</span>
          <span className="text-xl font-semibold tracking-tight">macOS</span>
        </div>
        {open ? <ChevronUp size={20} className="opacity-40" /> : <ChevronDown size={20} className="opacity-40" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="mt-5">
            <a
              href={MAC_DMG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download size={16} />
              Download for Mac (.dmg)
            </a>
            <p className="mt-2 text-xs opacity-40">Universal — works on both Apple Silicon and Intel Macs.</p>
          </div>
          <p className="text-xs opacity-40 mt-4 mb-2">or use</p>
          <PackageDropdown label="Homebrew" command={BREW_COMMAND} />
        </div>
      )}
    </div>
  );
}

const APT_COMMAND = `curl -fsSL https://imjustivaan.github.io/Minimal-Clock-Desktop/apt-public-key.asc | sudo tee /etc/apt/trusted.gpg.d/minimalclock.asc
echo "deb https://imjustivaan.github.io/Minimal-Clock-Desktop stable main" | sudo tee /etc/apt/sources.list.d/minimalclock.list
sudo apt update && sudo apt install minimal-clock`;

function LinuxCard() {
  const [open, setOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPopup) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShowPopup(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPopup]);

  return (
    <>
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPopup(false); }}
        >
          <div ref={ref} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold tracking-tight">Choose Package</h3>
              <button onClick={() => setShowPopup(false)} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={LINUX_DEB_URL}
                onClick={() => setShowPopup(false)}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-semibold">.deb</div>
                  <div className="text-xs opacity-50 mt-0.5">Ubuntu, Debian, Linux Mint, Pop!_OS</div>
                </div>
                <Download size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href={LINUX_APPIMAGE_URL}
                onClick={() => setShowPopup(false)}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-semibold">.AppImage</div>
                  <div className="text-xs opacity-50 mt-0.5">Works on most Linux distros, no install needed</div>
                </div>
                <Download size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <p className="text-xs opacity-40 text-center mt-4">Not sure? Pick .AppImage — it runs anywhere.</p>
          </div>
        </div>
      )}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🐧</span>
            <span className="text-xl font-semibold tracking-tight">Linux</span>
          </div>
          {open ? <ChevronUp size={20} className="opacity-40" /> : <ChevronDown size={20} className="opacity-40" />}
        </button>
        {open && (
          <div className="px-6 pb-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="mt-5">
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download size={16} />
                Download for Linux
              </button>
            </div>
            <p className="text-xs opacity-40 mt-4 mb-2">or use</p>
            <div>
              <PackageDropdown label="APT (Ubuntu / Debian)" command={APT_COMMAND} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{platform.emoji}</span>
          <span className="text-xl font-semibold tracking-tight">{platform.name}</span>
        </div>
        {open ? <ChevronUp size={20} className="opacity-40" /> : <ChevronDown size={20} className="opacity-40" />}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-zinc-100 dark:border-zinc-800">
          {platform.downloadUrl && (
            <div className="mt-5 mb-5">
              {platform.id === 'android' ? (
                <a href={platform.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-90 active:scale-[0.98] transition-all">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyywahLFJJ3EQg3qvdlZLAVSSBEShdKMEsoTCsZVZEIg&s=10" alt="Get it on Google Play" className="h-14 w-auto" />
                </a>
              ) : (
                <a href={platform.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-90 active:scale-[0.98] transition-all">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn2PuHKisCYgLjY9kX3aa7Db0huhOZ-Mqifvxh5rkUWeeqPeritL0sHEfA&s=10" alt="Download on the App Store" className="h-14 w-auto" />
                </a>
              )}
              {platform.downloadNote && (
                <p className="mt-2 text-xs opacity-40">{platform.downloadNote}</p>
              )}
            </div>
          )}
          {platform.steps.length > 0 && (
            <ol className="flex flex-col gap-3">
              {platform.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed opacity-70">
                    <HighlightedText text={step.text} bold={step.bold} />
                  </span>
                </li>
              ))}
            </ol>
          )}
          {platform.note && (
            <p className="mt-4 text-xs opacity-40 pl-10 leading-relaxed">{platform.note}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <nav className="sticky top-0 z-10 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <Clock size={20} />
          <div className="flex flex-col leading-none">
            <span className="font-semibold tracking-tight text-sm">Minimal Clock</span>
            <span className="text-[10px] opacity-40 font-normal tracking-tight">aka Time.Ivaan.CC</span>
          </div>
        </a>
        <a href="/" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          ← Back to app
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="text-6xl mb-6">📲</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Download the App</h1>
        <p className="text-lg opacity-50 leading-relaxed">
          Time.Ivaan.CC is available on all platforms — as a native app or installed directly from your browser.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20 flex flex-col gap-4">
        {platforms.map(p =>
          p.id === 'windows'
            ? <WindowsCard key="windows" />
            : p.id === 'macos'
            ? <MacCard key="macos" />
            : p.id === 'linux'
            ? <LinuxCard key="linux" />
            : <PlatformCard key={p.id} platform={p} />
        )}
        <p className="text-center text-xs opacity-30 mt-4">
          Once installed, Time.Ivaan.CC works offline and syncs your countdowns when you sign in.
        </p>
      </div>
    </div>
  );
}
