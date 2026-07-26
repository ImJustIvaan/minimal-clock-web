/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Clock, Timer, Play, Pause, RotateCcw, Hourglass, Globe, Search, X, CalendarClock, Share2, Check, User, LogOut, Bell, BellOff, Download, EyeOff, Eye, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { supabase } from './lib/supabaseClient';
import { useAuth } from './lib/useAuth';
import AuthModal from './components/AuthModal';

/// Handles ?pair=<code> links from the Apple TV app's QR code. Signing in
/// here (or confirming if already signed in) writes this browser's Supabase
/// session tokens into the tv_pairing_codes row the TV is polling, so the
/// TV can pick them up and consider itself signed in.
function TvPairingPage({ code, isDarkMode }: { code: string; isDarkMode: boolean }) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!user);
  const [status, setStatus] = useState<'idle' | 'confirming' | 'done' | 'error'>('idle');

  useEffect(() => {
    setShowAuthModal(!user);
  }, [user]);

  const confirm = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    setStatus('confirming');
    const { error } = await supabase
      .from('tv_pairing_codes')
      .update({ access_token: session.access_token, refresh_token: session.refresh_token })
      .eq('code', code);
    setStatus(error ? 'error' : 'done');
  };

  const color = isDarkMode ? 'text-zinc-50' : 'text-zinc-900';

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center gap-6 px-6 text-center ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'} ${color}`}>
      <h1 className="text-2xl font-bold tracking-tight">Sign in to Apple TV</h1>
      {status === 'done' ? (
        <p className="opacity-70 max-w-sm">Your Apple TV is signed in. You can close this page.</p>
      ) : status === 'error' ? (
        <p className="text-red-500 max-w-sm">Something went wrong — the code may have expired. Try generating a new one on the TV.</p>
      ) : (
        <>
          <p className="opacity-60 max-w-sm">Confirm you want to sign in the Apple TV showing code <span className="font-mono font-bold">{code}</span>.</p>
          {user && (
            <button
              onClick={confirm}
              disabled={status === 'confirming'}
              className="px-6 py-3 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-40 cursor-pointer"
            >
              {status === 'confirming' ? 'Confirming…' : 'Confirm Sign-In'}
            </button>
          )}
        </>
      )}
      {showAuthModal && (
        <AuthModal isDarkMode={isDarkMode} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

function AnalogClock({ time, tz, showSeconds }: { time: Date, tz?: string, showSeconds: boolean }) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(time);
  let h = 0, m = 0, s = 0;
  parts.forEach(p => {
    if (p.type === 'hour') h = parseInt(p.value, 10);
    if (p.type === 'minute') m = parseInt(p.value, 10);
    if (p.type === 'second') s = parseInt(p.value, 10);
  });
  if (h === 24) h = 0;

  const ms = time.getMilliseconds();
  
  // Calculate degrees
  const sDeg = showSeconds ? (s + ms / 1000) * 6 : s * 6;
  const mDeg = (m + s / 60) * 6;
  const hDeg = (h % 12 + m / 60) * 30;

  return (
    <div className="relative w-full max-w-[min(75vw,50vh)] aspect-square flex items-center justify-center my-8">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        {/* Clock Face */}
        <circle cx="50" cy="50" r="48" className="fill-white dark:fill-zinc-900 stroke-zinc-900 dark:stroke-zinc-100" strokeWidth="4" />
        
        {/* Clock Face Markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const isMajor = i % 3 === 0;
          const rStart = isMajor ? 38 : 42;
          const rEnd = 45;
          const x1 = 50 + rStart * Math.cos(angle);
          const y1 = 50 + rStart * Math.sin(angle);
          const x2 = 50 + rEnd * Math.cos(angle);
          const y2 = 50 + rEnd * Math.sin(angle);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeLinecap="round"
              className={isMajor ? "stroke-zinc-900 dark:stroke-zinc-100" : "stroke-zinc-400 dark:stroke-zinc-600"}
              strokeWidth={isMajor ? "2" : "1.5"}
            />
          );
        })}

        {/* Hour Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="28"
          strokeLinecap="round"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3.5"
          style={{ transform: `rotate(${hDeg}deg)`, transformOrigin: '50px 50px' }}
        />

        {/* Minute Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="18"
          strokeLinecap="round"
          className="stroke-zinc-700 dark:stroke-zinc-300"
          strokeWidth="2.5"
          style={{ transform: `rotate(${mDeg}deg)`, transformOrigin: '50px 50px' }}
        />

        {/* Second Hand */}
        {showSeconds && (
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="12"
            strokeLinecap="round"
            className="stroke-red-500 transition-transform duration-100 ease-linear"
            strokeWidth="1.5"
            style={{ transform: `rotate(${sDeg}deg)`, transformOrigin: '50px 50px' }}
          />
        )}

        {/* Center Dots */}
        <circle cx="50" cy="50" r="3" className="fill-zinc-900 dark:fill-zinc-100" />
        {showSeconds && <circle cx="50" cy="50" r="1.5" className="fill-red-500" />}
      </svg>
    </div>
  );
}

function WorldClockWidget({ tz, time, is24Hour, onRemove }: { tz: string, time: Date, is24Hour: boolean, onRemove: () => void }) {
  const label = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
  const timeStr = time.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !is24Hour,
    timeZone: tz,
  });
  const dayDiff = (() => {
    const localDay = time.toLocaleDateString(undefined, { day: 'numeric' });
    const tzDay = time.toLocaleDateString(undefined, { day: 'numeric', timeZone: tz });
    return localDay === tzDay ? null : tzDay;
  })();

  return (
    <div className="group relative flex flex-col items-center px-4 py-2 rounded-xl bg-zinc-500/10 min-w-[92px]">
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        title={`Remove ${label}`}
      >
        <X size={10} />
      </button>
      <span className="text-[11px] font-mono uppercase tracking-widest opacity-50 truncate max-w-[110px]">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{timeStr}</span>
      {dayDiff && <span className="text-[10px] opacity-40">Day {dayDiff}</span>}
    </div>
  );
}

const ALL_TIMEZONES = [
  { value: 'Local', label: 'Local Time' },
  ...Intl.supportedValuesOf('timeZone').map(tz => ({
    value: tz,
    label: tz.replace(/_/g, ' ')
  }))
];

function toLocalDateTimeInputValue(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default function App() {
  // Clock States
  const [time, setTime] = useState(new Date());

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const pairingCode = new URLSearchParams(window.location.search).get('pair');

  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return localStorage.getItem('selectedTimezone') || 'Local';
  });
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [timezoneModalMode, setTimezoneModalMode] = useState<'main' | 'widget'>('main');
  const [timezoneSearch, setTimezoneSearch] = useState('');

  // World clock widgets — small tiles showing the current time in other cities
  const [worldClocks, setWorldClocks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('worldClocks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [is24Hour, setIs24Hour] = useState(() => {
    const saved = localStorage.getItem('is24Hour');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [showSeconds, setShowSeconds] = useState(() => {
    const saved = localStorage.getItem('showSeconds');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // View State — 'countdown' only entered via dedicated button or shared link
  const [viewMode, setViewMode] = useState<'digital' | 'analog' | 'timer' | 'countdown'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('c')) return 'countdown';
    const saved = localStorage.getItem('viewMode');
    if (saved === 'clock' || saved === 'countdown') return 'digital';
    return (saved as 'digital' | 'analog' | 'timer') || 'digital';
  });

  const [hideUI, setHideUI] = useState(() => localStorage.getItem('hideUI') === 'true');
  const [clockFont, setClockFont] = useState(() => localStorage.getItem('clockFont') || 'default');
  const [showFontPicker, setShowFontPicker] = useState(false);

  // Auth / Account
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Countdown States
  const [sharedCountdownId] = useState(() => new URLSearchParams(window.location.search).get('c'));
  const [isSharedCountdown] = useState(() => !!new URLSearchParams(window.location.search).get('c'));
  const [sharedCountdownData, setSharedCountdownData] = useState<{ id: string; title: string; target: string } | null>(null);

  type Countdown = { id: string; title: string; target: string; slug: string; synced?: boolean };
  const [countdowns, setCountdowns] = useState<Countdown[]>(() => {
    try {
      const saved = localStorage.getItem('countdowns');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Migrate legacy single countdown
    const title = localStorage.getItem('countdownTitle') || '';
    const target = localStorage.getItem('countdownTarget') || '';
    const slug = localStorage.getItem('countdownSlug') || '';
    if (title || target) return [{ id: crypto.randomUUID(), title, target, slug }];
    return [];
  });
  const [activeCountdownId, setActiveCountdownId] = useState<string | null>(() => {
    const saved = localStorage.getItem('activeCountdownId');
    return saved || null;
  });
  const activeCountdown = countdowns.find(c => c.id === activeCountdownId) || countdowns[0] || null;
  const countdownTitle = isSharedCountdown ? (sharedCountdownData?.title || '') : (activeCountdown?.title || '');
  const countdownTarget = isSharedCountdown ? (sharedCountdownData?.target || '') : (activeCountdown?.target || '');
  const countdownSlug = activeCountdown?.slug || '';

  const [showCountdownList, setShowCountdownList] = useState(false);

  // Countdown setup modal
  const [showCountdownSetup, setShowCountdownSetup] = useState(false);
  const [editingCountdownId, setEditingCountdownId] = useState<string | null>(null);
  const [setupTitle, setSetupTitle] = useState('');
  const [setupTarget, setSetupTarget] = useState('');
  const [setupSlug, setSetupSlug] = useState('');
  const [setupSlugTouched, setSetupSlugTouched] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [countdownNotFound, setCountdownNotFound] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const countdownWasDone = useRef(false);

  // Fetch shared countdown by ?c=<id-or-slug>
  useEffect(() => {
    if (!sharedCountdownId) return;
    (async () => {
      // Try by UUID id first, then by slug column
      let { data, error } = await supabase
        .from('countdowns')
        .select('id, title, target_date')
        .eq('id', sharedCountdownId)
        .maybeSingle();
      if (!data && !error) {
        ({ data, error } = await supabase
          .from('countdowns')
          .select('id, title, target_date')
          .eq('slug', sharedCountdownId)
          .maybeSingle());
      }
      if (error || !data) {
        setCountdownNotFound(true);
        return;
      }
      setSharedCountdownData({ id: data.id, title: data.title, target: data.target_date });
    })();
  }, [sharedCountdownId]);

  // Timer States
  const [timerDuration, setTimerDuration] = useState(() => {
    return Number(localStorage.getItem('timerDuration')) || 300;
  });
  const [timerRemaining, setTimerRemaining] = useState(() => {
    const saved = localStorage.getItem('timerRemaining');
    return saved !== null ? Number(saved) : 300;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    return localStorage.getItem('isTimerRunning') === 'true';
  });
  const [timerEndTime, setTimerEndTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('timerEndTime');
    return saved ? Number(saved) : null;
  });
  const [timerInputMode, setTimerInputMode] = useState<'duration' | 'until'>(() => {
    return (localStorage.getItem('timerInputMode') as 'duration' | 'until') || 'duration';
  });
  const [untilH, setUntilH] = useState(() => localStorage.getItem('untilH') || '12');
  const [untilM, setUntilM] = useState(() => localStorage.getItem('untilM') || '00');
  const [untilAmPm, setUntilAmPm] = useState<'AM' | 'PM'>(() => {
    return (localStorage.getItem('untilAmPm') as 'AM' | 'PM') || 'AM';
  });
  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('welcomed'));
  const [examOverMessage, setExamOverMessage] = useState<string | null>(null);
  const lastTriggeredMinute = useRef<string | null>(null);

  // Persist States
  useEffect(() => { localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode)); }, [isDarkMode]);
  useEffect(() => { localStorage.setItem('selectedTimezone', selectedTimezone); }, [selectedTimezone]);
  useEffect(() => { localStorage.setItem('worldClocks', JSON.stringify(worldClocks)); }, [worldClocks]);
  useEffect(() => { localStorage.setItem('is24Hour', JSON.stringify(is24Hour)); }, [is24Hour]);
  useEffect(() => { localStorage.setItem('showSeconds', JSON.stringify(showSeconds)); }, [showSeconds]);
  useEffect(() => { localStorage.setItem('viewMode', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('hideUI', String(hideUI)); }, [hideUI]);
  useEffect(() => { localStorage.setItem('clockFont', clockFont); }, [clockFont]);
  useEffect(() => { localStorage.setItem('timerDuration', String(timerDuration)); }, [timerDuration]);
  useEffect(() => { localStorage.setItem('timerRemaining', String(timerRemaining)); }, [timerRemaining]);
  useEffect(() => { localStorage.setItem('isTimerRunning', String(isTimerRunning)); }, [isTimerRunning]);
  useEffect(() => {
    if (timerEndTime) localStorage.setItem('timerEndTime', String(timerEndTime));
    else localStorage.removeItem('timerEndTime');
  }, [timerEndTime]);
  useEffect(() => { localStorage.setItem('timerInputMode', timerInputMode); }, [timerInputMode]);
  useEffect(() => { localStorage.setItem('untilH', untilH); }, [untilH]);
  useEffect(() => { localStorage.setItem('untilM', untilM); }, [untilM]);
  useEffect(() => { localStorage.setItem('untilAmPm', untilAmPm); }, [untilAmPm]);
  useEffect(() => {
    if (isSharedCountdown) return;
    localStorage.setItem('countdowns', JSON.stringify(countdowns));
  }, [countdowns, isSharedCountdown]);
  useEffect(() => {
    if (activeCountdownId) localStorage.setItem('activeCountdownId', activeCountdownId);
  }, [activeCountdownId]);

  // Sync: fetch personal countdowns from Supabase on login
  useEffect(() => {
    if (!user || isSharedCountdown) return;
    (async () => {
      const { data } = await supabase
        .from('countdowns')
        .select('id, title, target_date, slug')
        .eq('owner_id', user.id)
        .eq('is_personal', true);
      if (!data || data.length === 0) return;
      setCountdowns(prev => {
        const remoteIds = new Set(data.map((r: {id: string}) => r.id));
        const localOnly = prev.filter(c => !remoteIds.has(c.id));
        const remote: Countdown[] = data.map((r: {id: string; title: string; target_date: string; slug: string | null}) => ({
          id: r.id, title: r.title, target: r.target_date, slug: r.slug || '', synced: true,
        }));
        return [...remote, ...localOnly];
      });
    })();
  }, [user, isSharedCountdown]);

  // Sync: upsert countdowns to Supabase whenever they change (if logged in)
  useEffect(() => {
    if (!user || isSharedCountdown || countdowns.length === 0) return;
    const toSync = countdowns.filter(c => !c.synced);
    if (toSync.length === 0) return;
    (async () => {
      await supabase.from('countdowns').upsert(
        toSync.map(c => ({ id: c.id, owner_id: user.id, title: c.title, target_date: c.target, slug: c.slug || null, is_personal: true })),
        { onConflict: 'id' }
      );
      setCountdowns(prev => prev.map(c => toSync.some(s => s.id === c.id) ? { ...c, synced: true } : c));
    })();
  }, [user, countdowns, isSharedCountdown]);

  // Normalize untilH when 12/24 hour format changes
  useEffect(() => {
    let h = parseInt(untilH);
    if (!isNaN(h)) {
      if (!is24Hour && h > 12) {
        setUntilH((h - 12).toString().padStart(2, '0'));
        setUntilAmPm('PM');
      } else if (!is24Hour && h === 0) {
        setUntilH('12');
        setUntilAmPm('AM');
      }
    }
  }, [is24Hour]);

  // Sync timer on mount if it was running
  useEffect(() => {
    if (isTimerRunning && timerEndTime) {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
      if (left === 0) {
        setIsTimerRunning(false);
        setTimerEndTime(null);
        setTimerRemaining(0);
      } else {
        setTimerRemaining(left);
      }
    }
  }, []);

  // Main Interval
  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const systemNow = new Date();
      setTime(systemNow);

      const tz = selectedTimezone === 'Local' ? undefined : selectedTimezone;
      const tzNowStr = systemNow.toLocaleString('en-US', { timeZone: tz });
      const now = new Date(tzNowStr);

      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentS = now.getSeconds();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();
      
      const timeKey = `${currentMonth}-${currentDate}-${currentH}-${currentM}`;
      
      if (currentS === 0 && lastTriggeredMinute.current !== timeKey) {
        const is1015AM = currentH === 10 && currentM === 15;
        const isMarch17 = currentMonth === 2 && currentDate === 17;
        
        if (is1015AM) {
          if (isMarch17) {
            setExamOverMessage("The exams are now over, Happy Freedom and Enjoy!");
          } else {
            setExamOverMessage("The exam is now over, Enjoy!");
          }
          triggerConfetti();
          lastTriggeredMinute.current = timeKey;
        }
      }

      if (isTimerRunning && timerEndTime) {
        const nowMs = Date.now();
        const left = Math.max(0, Math.ceil((timerEndTime - nowMs) / 1000));
        setTimerRemaining(left);
        if (left === 0) {
          setIsTimerRunning(false);
          setTimerEndTime(null);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isTimerRunning, timerEndTime, selectedTimezone]);

  // Clock Formatting
  const tz = selectedTimezone === 'Local' ? undefined : selectedTimezone;

  const timeString = time.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    ...(showSeconds && { second: '2-digit' }),
    hour12: !is24Hour,
    timeZone: tz,
  });

  const dayOfWeek = time.toLocaleDateString(undefined, { weekday: 'long', timeZone: tz });
  const fullDate = time.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: tz });
  
  const tzDate = new Date(time.toLocaleString('en-US', { timeZone: tz }));
  const weekNumber = getWeekNumber(tzDate);

  // Timer Controls
  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setTimerEndTime(null);
    } else {
      if (isEditing && timerInputMode === 'until') {
        const now = new Date();
        const target = new Date(now);
        
        let h = parseInt(untilH) || 0;
        if (!is24Hour) {
          if (untilAmPm === 'PM' && h < 12) h += 12;
          if (untilAmPm === 'AM' && h === 12) h = 0;
        }
        
        target.setHours(h, parseInt(untilM) || 0, 0, 0);
        if (target.getTime() <= now.getTime()) {
          target.setDate(target.getDate() + 1);
        }
        const diffSeconds = Math.ceil((target.getTime() - now.getTime()) / 1000);
        setTimerDuration(diffSeconds);
        setTimerRemaining(diffSeconds);
        setIsTimerRunning(true);
        setTimerEndTime(Date.now() + diffSeconds * 1000);
      } else if (timerRemaining > 0) {
        setIsTimerRunning(true);
        setTimerEndTime(Date.now() + timerRemaining * 1000);
      }
    }
  };

  const handleUntilBlur = (type: 'h' | 'm') => {
    if (type === 'h') {
      let val = parseInt(untilH);
      if (isNaN(val) || val < 0) val = is24Hour ? 0 : 12;
      if (is24Hour) {
        if (val > 23) val = 23;
      } else {
        if (val > 12) val = 12;
        if (val < 1) val = 1;
      }
      setUntilH(val.toString().padStart(2, '0'));
    } else {
      let val = parseInt(untilM);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 59) val = 59;
      setUntilM(val.toString().padStart(2, '0'));
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerEndTime(null);
    setTimerRemaining(timerDuration);
  };

  const handleDurationChange = (type: 'h' | 'm' | 's', value: string) => {
    let num = parseInt(value) || 0;
    let h = Math.floor(timerDuration / 3600);
    let m = Math.floor((timerDuration % 3600) / 60);
    let s = timerDuration % 60;

    if (type === 'h') h = Math.min(99, Math.max(0, num));
    if (type === 'm') m = Math.min(59, Math.max(0, num));
    if (type === 's') s = Math.min(59, Math.max(0, num));

    const newDuration = h * 3600 + m * 60 + s;
    setTimerDuration(newDuration);
    setTimerRemaining(newDuration);
  };

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isEditing = !isTimerRunning && timerRemaining === timerDuration;

  // Countdown Logic
  const countdownTargetDate = countdownTarget ? new Date(countdownTarget) : null;
  const countdownValid = !!countdownTargetDate && !isNaN(countdownTargetDate.getTime());
  const countdownDiffMs = countdownValid ? countdownTargetDate!.getTime() - time.getTime() : 0;
  const countdownDone = countdownValid && countdownDiffMs <= 0;
  const countdownParts = (() => {
    const totalSeconds = Math.max(0, Math.floor(countdownDiffMs / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  })();

  // Suppress confetti on initial load if countdown is already past its target
  const confettiInitialized = useRef(false);
  if (!confettiInitialized.current) {
    confettiInitialized.current = true;
    if (countdownDone) countdownWasDone.current = true;
  }

  // Fire notification + confetti when countdown flips to done
  useEffect(() => {
    if (!countdownValid) return;
    if (countdownDone && !countdownWasDone.current) {
      countdownWasDone.current = true;
      triggerConfetti();
      if (notifyEnabled && Notification.permission === 'granted') {
        new Notification(`⏰ ${countdownTitle || 'Countdown'} is done!`, {
          body: "Time's up!",
          icon: '/favicon.ico',
        });
      }
    }
    if (!countdownDone) {
      countdownWasDone.current = false;
    }
  }, [countdownDone, countdownValid, notifyEnabled, countdownTitle]);

  const toggleNotify = async () => {
    if (notifyEnabled) {
      setNotifyEnabled(false);
      return;
    }
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      setNotifyEnabled(true);
    } else if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      if (result === 'granted') setNotifyEnabled(true);
    }
  };

  // Saves the countdown to Supabase (same table the mobile app reads/writes)
  // and shares a link keyed by its row id, so it's the same countdown
  // everywhere rather than one baked into the URL.
  const copyShareLink = async () => {
    if (!countdownValid || !countdownTargetDate) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSharing(true);
    setShareError(null);
    try {
      // Try with slug first; if that fails (column may not exist), retry without
      let result = countdownSlug
        ? await supabase.from('countdowns').insert({ owner_id: user.id, title: countdownTitle || 'Untitled Countdown', target_date: countdownTargetDate.toISOString(), slug: countdownSlug }).select('id').single()
        : { data: null as { id: string } | null, error: new Error('no slug') };
      if (!result.data) {
        result = await supabase.from('countdowns').insert({ owner_id: user.id, title: countdownTitle || 'Untitled Countdown', target_date: countdownTargetDate.toISOString() }).select('id').single();
      }
      const { data, error } = result;
      if (error || !data) throw error ?? new Error('Failed to save countdown.');

      const url = new URL(window.location.href);
      url.search = '';
      url.searchParams.set('c', data.id);
      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (e) {
      setShareError(e instanceof Error ? e.message : 'Failed to share countdown.');
    } finally {
      setSharing(false);
    }
  };

  const closeWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('welcomed', 'true');
  };

  const FONTS: { id: string; label: string; style: React.CSSProperties }[] = [
    { id: 'default', label: 'Default', style: { fontFamily: 'system-ui, sans-serif', fontWeight: 700 } },
    { id: 'mono', label: 'Mono', style: { fontFamily: '"Courier New", Courier, monospace', fontWeight: 700 } },
    { id: 'serif', label: 'Serif', style: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700 } },
    { id: 'thin', label: 'Thin', style: { fontFamily: 'system-ui, sans-serif', fontWeight: 100 } },
    { id: 'cursive', label: 'Cursive', style: { fontFamily: 'cursive', fontWeight: 400 } },
    { id: 'rounded', label: 'Rounded', style: { fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive', fontWeight: 700 } },
  ];
  const currentFontStyle = FONTS.find(f => f.id === clockFont)?.style ?? {};

  if (pairingCode) {
    return <TvPairingPage code={pairingCode} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 flex flex-col items-center justify-center relative ${isDarkMode ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'}`}>
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full p-8 rounded-3xl shadow-2xl relative ${isDarkMode ? 'bg-zinc-900 text-zinc-50' : 'bg-white text-zinc-900'}`}
            >
              <h2 className="text-2xl font-bold mb-4 tracking-tight">Note from the Developer :D</h2>
              <p className="opacity-80 leading-relaxed mb-6">
                Hello there! Thank you for visiting this website, hope you enjoy it! It took me a while to make it. I appreciate all of you support me with my projects!
              </p>
              <p className="opacity-80 text-sm">
                ~ Ivaan S (Commonly known as <span className="font-bold">ImJustIvaan</span>)
              </p>
              <div className={`mt-6 p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${isDarkMode ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-200 text-zinc-600'}`}>NEW</span>
                <p className="text-sm leading-relaxed opacity-90">
                  Minimal Clock (time.ivaan.cc) now has an app, download it using the button below!
                </p>
                <button
                  onClick={() => { window.location.href = '/download'; }}
                  className="mt-3 w-full py-2 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer text-sm"
                >
                  Download the App
                </button>
              </div>
              <button
                onClick={closeWelcome}
                className="mt-3 w-full py-3 rounded-xl font-medium hover:opacity-60 transition-opacity cursor-pointer text-sm opacity-50"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown Setup Modal */}
      <AnimatePresence>
        {showCountdownSetup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCountdownSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-sm w-full p-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-zinc-900 text-zinc-50' : 'bg-white text-zinc-900'}`}
            >
              <h2 className="text-2xl font-bold mb-6 tracking-tight">New Countdown</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium opacity-60 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={setupTitle}
                    onChange={(e) => {
                      setSetupTitle(e.target.value);
                      if (!setupSlugTouched) {
                        setSetupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                      }
                    }}
                    placeholder="e.g. My Birthday"
                    autoFocus
                    className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium opacity-60 mb-1 block">Target Date & Time</label>
                  <input
                    type="datetime-local"
                    value={setupTarget}
                    onChange={(e) => setSetupTarget(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium opacity-60 mb-1 block">Countdown ID</label>
                  <input
                    type="text"
                    value={setupSlug}
                    onChange={(e) => {
                      setSetupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                      setSetupSlugTouched(true);
                    }}
                    placeholder="e.g. my-birthday"
                    className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                  />
                  <p className="text-xs opacity-40 mt-1">Used in the share link: ?c=my-birthday</p>
                </div>
              </div>
              <button
                disabled={!setupTitle.trim() || !setupTarget}
                onClick={() => {
                  const title = setupTitle.trim();
                  const target = new Date(setupTarget).toISOString();
                  const slug = setupSlug.trim();
                  if (editingCountdownId) {
                    setCountdowns(prev => prev.map(c => c.id === editingCountdownId ? { ...c, title, target, slug, synced: false } : c));
                    setActiveCountdownId(editingCountdownId);
                  } else {
                    const newId = crypto.randomUUID();
                    setCountdowns(prev => [...prev, { id: newId, title, target, slug, synced: false }]);
                    setActiveCountdownId(newId);
                  }
                  setEditingCountdownId(null);
                  setShowCountdownSetup(false);
                  setViewMode('countdown');
                }}
                className="mt-6 w-full py-3 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
              >
                Start Countdown
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {examOverMessage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-red-600 flex items-center justify-center text-white p-8 text-center cursor-pointer"
            onClick={() => setExamOverMessage(null)}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">{examOverMessage}</h1>
            <p className="absolute bottom-8 opacity-70">Click anywhere to dismiss</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown List Picker */}
      <AnimatePresence>
        {showCountdownList && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCountdownList(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-sm w-full p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-zinc-900 text-zinc-50' : 'bg-white text-zinc-900'}`}
            >
              <h2 className="text-xl font-bold mb-4 tracking-tight">My Countdowns</h2>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                {countdowns.map(c => (
                  <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${c.id === activeCountdown?.id ? (isDarkMode ? 'bg-zinc-700' : 'bg-zinc-100') : 'hover:bg-zinc-500/10'}`}
                    onClick={() => { setActiveCountdownId(c.id); setShowCountdownList(false); }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.title || 'Untitled'}</div>
                      <div className="text-xs opacity-50 truncate">{c.target ? new Date(c.target).toLocaleDateString() : '—'}</div>
                    </div>
                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          setCountdowns(prev => prev.filter(x => x.id !== c.id));
                          if (activeCountdown?.id === c.id) setActiveCountdownId(null);
                          if (user) supabase.from('countdowns').delete().eq('id', c.id).eq('owner_id', user.id);
                        }}
                      className="opacity-30 hover:opacity-80 transition-opacity text-red-500 font-bold px-2"
                      title="Delete"
                    >✕</button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowCountdownList(false); setEditingCountdownId(null); setSetupTitle(''); setSetupTarget(''); setSetupSlug(''); setSetupSlugTouched(false); setShowCountdownSetup(true); }}
                className="mt-4 w-full py-3 rounded-xl border-2 border-current/20 font-medium hover:bg-zinc-500/10 transition-colors cursor-pointer text-sm"
              >+ New Countdown</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar (Responsive Layout) */}
      {/* Restore UI button when hidden */}
      {hideUI && (
        <button
          onClick={() => setHideUI(false)}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-zinc-900/60 dark:bg-zinc-50/20 text-zinc-50 dark:text-zinc-50 backdrop-blur-sm hover:opacity-80 transition-opacity cursor-pointer"
          title="Show UI"
        >
          <Eye size={18} />
        </button>
      )}

      {!hideUI && <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start z-10 pointer-events-none">
        
        {/* Top Left: Branding */}
        <div className="flex items-center gap-2 select-none pointer-events-auto">
          <Clock size={20} />
          <div className="flex flex-col leading-none">
            <span className="font-semibold tracking-tight text-sm">Minimal Clock</span>
            <span className="text-[10px] opacity-40 font-normal tracking-tight">aka Time.Ivaan.CC</span>
          </div>
        </div>

        {/* Top Right: Controls */}
        <div className="flex items-center gap-0.5 sm:gap-2 flex-wrap justify-end pointer-events-auto max-w-[calc(100vw-130px)] sm:max-w-[calc(100vw-180px)]">
          <div className="relative">
            <button
              onClick={() => (user ? setShowAccountMenu(!showAccountMenu) : setShowAuthModal(true))}
              className="p-1.5 sm:p-3 rounded-full hover:bg-zinc-500/10 transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0"
              title={user ? user.email ?? 'Account' : 'Sign In'}
            >
              <User size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[9px] leading-none sm:text-sm sm:leading-normal hidden sm:inline">{user ? user.email : 'Sign In'}</span>
              <span className="text-[9px] leading-none sm:hidden">{user ? 'Acct' : 'Sign In'}</span>
            </button>
            <AnimatePresence>
              {showAccountMenu && user && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`absolute right-0 mt-1 rounded-xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}
                >
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setShowAccountMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-zinc-500/10 transition-colors cursor-pointer whitespace-nowrap w-full"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => {
              setTimezoneModalMode('main');
              setShowTimezoneModal(true);
            }}
            className="p-1.5 sm:p-3 rounded-full hover:bg-zinc-500/10 transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0"
            title="Select Timezone"
          >
            <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[9px] leading-none sm:hidden">Zone</span>
            <span className="hidden sm:inline">
              {ALL_TIMEZONES.find(t => t.value === selectedTimezone)?.label || 'Timezone'}
            </span>
          </button>
          <button
            onClick={() => {
              const isAnalog = viewMode === 'analog';
              setViewMode(isAnalog ? 'digital' : 'analog');
            }}
            className={`p-1.5 sm:p-3 rounded-full transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0 ${viewMode === 'analog' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900' : 'hover:bg-zinc-500/10'}`}
            title="Toggle Analog"
          >
            <Hourglass size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[9px] leading-none sm:text-sm sm:leading-normal">Analog</span>
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'timer' ? 'digital' : 'timer')}
            className={`p-1.5 sm:p-3 rounded-full transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0 ${viewMode === 'timer' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900' : 'hover:bg-zinc-500/10'}`}
            title="Timer"
          >
            <Timer size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[9px] leading-none sm:text-sm sm:leading-normal">Timer</span>
          </button>
          <button
            onClick={() => {
              if (viewMode === 'countdown') {
                setViewMode('digital');
              } else if (countdowns.length > 0) {
                setViewMode('countdown');
              } else {
                setEditingCountdownId(null);
                setSetupTitle('');
                setSetupTarget('');
                setSetupSlug('');
                setSetupSlugTouched(false);
                setShowCountdownSetup(true);
              }
            }}
            className={`p-1.5 sm:p-3 rounded-full transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0 ${viewMode === 'countdown' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900' : 'hover:bg-zinc-500/10'}`}
            title="Countdown"
          >
            <CalendarClock size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[9px] leading-none sm:text-sm sm:leading-normal">Count</span>
          </button>

          {(viewMode === 'digital' || viewMode === 'analog') && (
            <button
              onClick={() => setShowSeconds(!showSeconds)}
              className="p-1.5 sm:p-3 rounded-full hover:bg-zinc-500/10 transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0"
              title="Toggle Seconds"
            >
              <Timer size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[9px] leading-none sm:hidden">{showSeconds ? 'Hide s' : 'Secs'}</span>
              <span className="hidden sm:inline">{showSeconds ? 'Hide Secs' : 'Show Secs'}</span>
            </button>
          )}

          {viewMode === 'digital' && (
            <button
              onClick={() => setIs24Hour(!is24Hour)}
              className="p-1.5 sm:p-3 rounded-full hover:bg-zinc-500/10 transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0"
              title="Toggle 12/24 Hour Format"
            >
              <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[9px] leading-none sm:text-sm sm:leading-normal">{is24Hour ? '24H' : '12H'}</span>
            </button>
          )}

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 sm:p-3 rounded-full hover:bg-zinc-500/10 transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0"
            title="Toggle Light/Dark Mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDarkMode ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </motion.div>
            </AnimatePresence>
            <span className="text-[9px] leading-none sm:text-sm sm:leading-normal">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          <a
            href="/download"
            className="p-1.5 sm:p-3 rounded-full hover:bg-zinc-500/10 transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0"
            title="Download App"
          >
            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[9px] leading-none sm:text-sm sm:leading-normal">App</span>
          </a>

          {/* Font Picker */}
          <div className="relative">
            <button
              onClick={() => setShowFontPicker(o => !o)}
              className="p-1.5 sm:p-3 rounded-full hover:bg-zinc-500/10 transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0"
              title="Change Clock Font"
            >
              <Type size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[9px] leading-none sm:text-sm sm:leading-normal">Font</span>
            </button>
            <AnimatePresence>
              {showFontPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`absolute right-0 mt-1 rounded-2xl shadow-2xl overflow-hidden z-20 p-3 flex flex-col gap-1 min-w-[160px] ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}
                >
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setClockFont(f.id); setShowFontPicker(false); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer w-full ${clockFont === f.id ? (isDarkMode ? 'bg-zinc-700' : 'bg-zinc-100') : 'hover:bg-zinc-500/10'}`}
                    >
                      <span style={f.style} className="text-base leading-none">12:34</span>
                      <span className="text-xs opacity-60 ml-3">{f.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hide UI */}
          <button
            onClick={() => setHideUI(true)}
            className="p-1.5 sm:p-3 rounded-full hover:bg-zinc-500/10 transition-colors flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-sm font-medium cursor-pointer min-w-[40px] sm:min-w-0"
            title="Hide UI"
          >
            <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[9px] leading-none sm:text-sm sm:leading-normal">Hide</span>
          </button>
        </div>
      </div>}

      {/* Main Display */}
      {viewMode === 'digital' ? (
        <div className="text-[12vw] tracking-tighter leading-none tabular-nums select-none flex justify-center overflow-hidden py-4" style={currentFontStyle}>
          <AnimatePresence mode="popLayout">
            {timeString.split('').map((char, i) => (
              <motion.span
                key={`${i}-${char}`}
                initial={{ opacity: 0, y: "50%" }}
                animate={{ opacity: 1, y: "0%" }}
                exit={{ opacity: 0, y: "-50%", position: "absolute" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      ) : viewMode === 'analog' ? (
        <div className="flex justify-center items-center w-full select-none py-4">
          <AnalogClock time={time} tz={tz} showSeconds={showSeconds} />
        </div>
      ) : viewMode === 'timer' ? (
        <div className="flex flex-col items-center gap-12">
          {isEditing && (
            <div className="flex items-center gap-2 bg-zinc-500/10 p-1 rounded-full absolute top-24">
              <button
                onClick={() => setTimerInputMode('duration')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${timerInputMode === 'duration' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900' : 'opacity-60 hover:opacity-100'}`}
              >
                Duration
              </button>
              <button
                onClick={() => setTimerInputMode('until')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${timerInputMode === 'until' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900' : 'opacity-60 hover:opacity-100'}`}
              >
                Until Time
              </button>
            </div>
          )}

          {isEditing ? (
            timerInputMode === 'until' ? (
              <div className="flex items-center justify-center text-[12vw] font-bold tracking-tighter leading-none tabular-nums">
                <input
                  type="number"
                  value={untilH}
                  onChange={(e) => setUntilH(e.target.value)}
                  onBlur={() => handleUntilBlur('h')}
                  className="w-[1.3em] bg-transparent text-center outline-none hover:bg-zinc-500/10 focus:bg-zinc-500/10 rounded-lg transition-colors cursor-text"
                  placeholder={is24Hour ? "12" : "12"}
                />
                <span className="opacity-50 pb-2 mx-1">:</span>
                <input
                  type="number"
                  value={untilM}
                  onChange={(e) => setUntilM(e.target.value)}
                  onBlur={() => handleUntilBlur('m')}
                  className="w-[1.3em] bg-transparent text-center outline-none hover:bg-zinc-500/10 focus:bg-zinc-500/10 rounded-lg transition-colors cursor-text"
                  placeholder="00"
                />
                {!is24Hour && (
                  <button
                    onClick={() => setUntilAmPm(untilAmPm === 'AM' ? 'PM' : 'AM')}
                    className="ml-4 text-[4vw] font-medium opacity-60 hover:opacity-100 transition-opacity bg-zinc-500/10 px-4 py-2 rounded-2xl cursor-pointer"
                  >
                    {untilAmPm}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-[12vw] font-bold tracking-tighter leading-none tabular-nums">
                <input
                  type="number"
                  value={Math.floor(timerDuration / 3600).toString().padStart(2, '0')}
                onChange={(e) => handleDurationChange('h', e.target.value)}
                className="w-[1.3em] bg-transparent text-center outline-none hover:bg-zinc-500/10 focus:bg-zinc-500/10 rounded-lg transition-colors cursor-text"
                placeholder="00"
              />
              <span className="opacity-50 pb-2 mx-1">:</span>
              <input
                type="number"
                value={Math.floor((timerDuration % 3600) / 60).toString().padStart(2, '0')}
                onChange={(e) => handleDurationChange('m', e.target.value)}
                className="w-[1.3em] bg-transparent text-center outline-none hover:bg-zinc-500/10 focus:bg-zinc-500/10 rounded-lg transition-colors cursor-text"
                placeholder="00"
              />
              <span className="opacity-50 pb-2 mx-1">:</span>
              <input
                type="number"
                value={(timerDuration % 60).toString().padStart(2, '0')}
                onChange={(e) => handleDurationChange('s', e.target.value)}
                className="w-[1.3em] bg-transparent text-center outline-none hover:bg-zinc-500/10 focus:bg-zinc-500/10 rounded-lg transition-colors cursor-text"
                placeholder="00"
              />
              </div>
            )
          ) : (
            <div className={`text-[12vw] tracking-tighter leading-none tabular-nums select-none flex justify-center overflow-hidden py-4 transition-colors duration-300 ${timerRemaining === 0 ? 'text-red-500' : ''}`} style={currentFontStyle}>
              <AnimatePresence mode="popLayout">
                {formatTimer(timerRemaining).split('').map((char, i) => (
                  <motion.span
                    key={`${i}-${char}`}
                    initial={{ opacity: 0, y: "50%" }}
                    animate={{ opacity: 1, y: "0%" }}
                    exit={{ opacity: 0, y: "-50%", position: "absolute" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Timer Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTimer}
              disabled={timerRemaining === 0 && !isTimerRunning}
              className="w-20 h-20 rounded-full flex items-center justify-center bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-lg"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isTimerRunning ? 'pause' : 'play'}
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </motion.div>
              </AnimatePresence>
            </button>
            <button
              onClick={resetTimer}
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-current/20 hover:bg-zinc-500/10 active:scale-95 transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 w-full px-4">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center px-3 select-none">
            {countdownTitle || 'Countdown'}
          </h2>

          {/* Countdown display */}
          {countdownNotFound ? (
            <div className="text-lg opacity-50">This countdown couldn't be found. The link may be wrong or it was deleted.</div>
          ) : countdownValid ? (
            countdownDone ? (
              <div className="text-[8vw] font-bold tracking-tighter leading-none text-red-500 select-none">Time's Up!</div>
            ) : (
              <div className="flex items-end justify-center gap-3 sm:gap-6 select-none tabular-nums">
                {[
                  { label: 'Days', value: countdownParts.days },
                  { label: 'Hours', value: countdownParts.hours },
                  { label: 'Min', value: countdownParts.minutes },
                  { label: 'Sec', value: countdownParts.seconds },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-[10vw] sm:text-[7vw] font-bold tracking-tighter leading-none">
                      {value.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm font-mono uppercase tracking-widest opacity-50 mt-2">{label}</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-lg opacity-50">No countdown set.</div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {isSharedCountdown && sharedCountdownData && (
              <a
                href={`minimalclock://countdown?id=${sharedCountdownData.id}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer text-sm"
              >
                <Smartphone size={18} />
                Open in App
              </a>
            )}
            {!isSharedCountdown && (
              <button
                onClick={() => {
                  setEditingCountdownId(activeCountdown?.id || null);
                  setSetupTitle(countdownTitle);
                  setSetupTarget(countdownTarget ? toLocalDateTimeInputValue(countdownTarget) : '');
                  setSetupSlug(countdownSlug);
                  setSetupSlugTouched(true);
                  setShowCountdownSetup(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium border-2 border-current/20 hover:bg-zinc-500/10 active:scale-[0.98] transition-transform cursor-pointer text-sm"
              >
                Edit
              </button>
            )}
            {!isSharedCountdown && countdowns.length > 1 && (
              <button
                onClick={() => setShowCountdownList(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium border-2 border-current/20 hover:bg-zinc-500/10 active:scale-[0.98] transition-transform cursor-pointer text-sm"
              >
                Switch
              </button>
            )}
            {!isSharedCountdown && (
              <button
                onClick={() => {
                  setEditingCountdownId(null);
                  setSetupTitle('');
                  setSetupTarget('');
                  setSetupSlug('');
                  setSetupSlugTouched(false);
                  setShowCountdownSetup(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium border-2 border-current/20 hover:bg-zinc-500/10 active:scale-[0.98] transition-transform cursor-pointer text-sm"
              >
                + New
              </button>
            )}
            {!isSharedCountdown && (
              <button
                onClick={copyShareLink}
                disabled={!countdownValid || sharing}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-40 disabled:hover:scale-100 cursor-pointer text-sm"
              >
                {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
                {sharing ? 'Sharing...' : linkCopied ? 'Copied!' : user ? 'Share' : 'Sign In to Share'}
              </button>
            )}
            {!isSharedCountdown && user && activeCountdown && (
              <a
                href={`minimalclock://countdown?id=${activeCountdown.id}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium border-2 border-current/20 hover:bg-zinc-500/10 active:scale-[0.98] transition-transform cursor-pointer text-sm"
              >
                <Smartphone size={18} />
                Open in App
              </a>
            )}
            {countdownValid && !countdownDone && 'Notification' in window && Notification.permission !== 'denied' && (
              <button
                onClick={toggleNotify}
                title={notifyEnabled ? 'Turn off notification' : 'Notify me when done'}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer border-2 text-sm ${notifyEnabled ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900' : 'border-zinc-900/20 dark:border-zinc-100/20 hover:bg-zinc-500/10'}`}
              >
                {notifyEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                {notifyEnabled ? 'Notify On' : 'Notify Me'}
              </button>
            )}
          </div>
          {shareError && <p className="text-xs text-red-500">{shareError}</p>}
        </div>
      )}

      {/* World Clock Widgets */}
      {!hideUI && (viewMode === 'digital' || viewMode === 'analog') && (
        <div className="flex flex-wrap justify-center gap-3 mt-6 px-4 max-w-full">
          {worldClocks.map(wtz => (
            <WorldClockWidget
              key={wtz}
              tz={wtz}
              time={time}
              is24Hour={is24Hour}
              onRemove={() => setWorldClocks(worldClocks.filter(t => t !== wtz))}
            />
          ))}
          <button
            onClick={() => {
              setTimezoneModalMode('widget');
              setShowTimezoneModal(true);
            }}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl border border-dashed border-current/20 hover:bg-zinc-500/10 transition-colors cursor-pointer opacity-50 hover:opacity-90"
            title="Add a world clock"
          >
            <Globe size={16} />
            <span className="text-[11px] font-mono uppercase tracking-widest">Add City</span>
          </button>
        </div>
      )}

      {/* Date & Week Info */}
      {!hideUI && <div className="absolute bottom-8 right-8 text-right flex flex-col items-end select-none">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">{dayOfWeek}</div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight opacity-90 mb-3">{fullDate}</div>
        <div className="text-xs sm:text-sm font-mono uppercase tracking-widest opacity-50 border border-current/20 px-3 py-1.5 rounded-full">
          Week {weekNumber.toString().padStart(2, '0')}
        </div>
      </div>}

      {/* Footer Branding */}
      {!hideUI && <a
        href="https://ivaan.cc"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 left-6 text-xs opacity-40 hover:opacity-70 font-medium tracking-wide transition-opacity"
      >
        Made By @ImJustIvaan (a.k.a Ivaan S) &copy; 2026 Ivaan.CC
      </a>}
      
      {/* Timezone Modal */}
      <AnimatePresence>
        {showTimezoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTimezoneModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md max-h-[80vh] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-semibold text-lg">{timezoneModalMode === 'widget' ? 'Add a World Clock' : 'Select Timezone'}</h3>
                <button
                  onClick={() => setShowTimezoneModal(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search timezones..."
                    value={timezoneSearch}
                    onChange={(e) => setTimezoneSearch(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm font-medium"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                {ALL_TIMEZONES
                  .filter(tz => tz.value !== 'Local' || timezoneModalMode === 'main')
                  .filter(tz => tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()))
                  .map(tz => (
                  <button
                    key={tz.value}
                    onClick={() => {
                      if (timezoneModalMode === 'widget') {
                        if (!worldClocks.includes(tz.value)) {
                          setWorldClocks([...worldClocks, tz.value]);
                        }
                      } else {
                        setSelectedTimezone(tz.value);
                      }
                      setShowTimezoneModal(false);
                      setTimezoneSearch('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${timezoneModalMode === 'main' && selectedTimezone === tz.value ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  >
                    {tz.label}
                  </button>
                ))}
                {ALL_TIMEZONES.filter(tz => tz.label.toLowerCase().includes(timezoneSearch.toLowerCase())).length === 0 && (
                  <div className="p-8 text-center opacity-50 text-sm">
                    No timezones found for "{timezoneSearch}"
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal isDarkMode={isDarkMode} onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
