import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { registerMicroApps, start } from "./lib";

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <App />
  // </StrictMode>,
)


registerMicroApps([
  {
    name: "classinSpace",
    entry: "//localhost:8092/",
    container: "#container",
    activeRule: "/client/cloud/cs",
  },
]);

start({
  prefetch: false,
});