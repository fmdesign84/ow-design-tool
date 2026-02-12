import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppBrowserRouter } from './app/routerAdapter';
import App from './App';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppBrowserRouter>
      <App />
    </AppBrowserRouter>
  </React.StrictMode>
);
