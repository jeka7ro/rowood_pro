import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

// BRUTAL FIX FOR SCROLL LOCKS (Radix UI / Shadcn UI bug)
setInterval(() => {
  const elements = [document.body, document.documentElement];
  elements.forEach(el => {
    if (el.hasAttribute('data-scroll-locked')) {
      el.removeAttribute('data-scroll-locked');
    }
    if (el.style.pointerEvents === 'none') {
      el.style.pointerEvents = '';
    }
    if (el.style.overflow === 'hidden' || el.style.overflowY === 'hidden') {
      el.style.overflow = '';
      el.style.overflowY = '';
    }
  });
}, 500);

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}



