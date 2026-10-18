import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Почетната страница доаѓа пред-генерирана (scripts/prerender.mjs), за пребарувачите
// да ја видат содржината без JavaScript. Ако HTML-от е таму — React само го „оживува"
// (hydrate); ако не е (npm run dev) — го црта од нула.
const container = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app)
} else {
  ReactDOM.createRoot(container).render(app)
}
