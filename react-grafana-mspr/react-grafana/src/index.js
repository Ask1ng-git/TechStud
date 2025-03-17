import React, { StrictMode, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './normalise.css';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';

// Chargement différé (Lazy Loading)
const App = lazy(() => import('./components/App'));

const store = configureStore();

ReactDOM.render(
    <Provider store={store}>
        <StrictMode>
            <Suspense fallback={<div>Chargement...</div>}>
                <App />
            </Suspense>
        </StrictMode>
    </Provider>,
    document.getElementById('root')
);
