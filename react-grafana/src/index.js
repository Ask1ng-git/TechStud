import React, { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client'; // ✅ remplacé ici
import './index.css';
import './normalise.css';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';

const App = lazy(() => import('./components/App'));

const store = configureStore();

// ✅ Nouvelle API React 18
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <Provider store={store}>
        <StrictMode>
            <Suspense fallback={<div>Chargement...</div>}>
                <App />
            </Suspense>
        </StrictMode>
    </Provider>
);
