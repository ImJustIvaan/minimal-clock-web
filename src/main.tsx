import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import DownloadPage from './DownloadPage.tsx';
import PrivacyPage from './PrivacyPage.tsx';
import SupportPage from './SupportPage.tsx';
import './index.css';

const path = window.location.pathname;
const Page = path === '/download' ? DownloadPage : path === '/privacy' ? PrivacyPage : path === '/support' ? SupportPage : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
