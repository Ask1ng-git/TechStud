import React from 'react';
import styled from 'styled-components';
import CovidDashboard from './graphs/CovidDashboard';

const AppContainer = styled.div`
    min-height: 100vh;
    background-color: #1a1a1a;
`;

const App = () => {
    return (
        <AppContainer>
            <CovidDashboard />
        </AppContainer>
    );
};

export default App;