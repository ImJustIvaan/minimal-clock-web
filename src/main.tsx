import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import DownloadPage from './DownloadPage.tsx';
import PrivacyPage from './PrivacyPage.tsx';
import SupportPage from './SupportPage.tsx';
import './index.css';

// Minimal Clock moved from time.ivaan.cc to clock.gominimal.app. Send
// anyone still hitting the old domain straight to the same page on the
// new one, tagged so the app can tell them about the move.
const OLD_HOST = 'time.ivaan.cc';
const NEW_HOST = 'clock.gominimal.app';

if (window.location.hostname === OLD_HOST || window.location.hostname === `www.${OLD_HOST}`) {
  const url = new URL(window.location.href);
  url.protocol = 'https:';
  url.hostname = NEW_HOST;
  url.port = '';
  url.searchParams.set('coming-from-old-domain', '1');
  window.location.replace(url.toString());
} else {
  const path = window.location.pathname;
  const Page = path === '/download' ? DownloadPage : path === '/privacy' ? PrivacyPage : path === '/support' ? SupportPage : App;

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Page />
    </StrictMode>,
  );
}

