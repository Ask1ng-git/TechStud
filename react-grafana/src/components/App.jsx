import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CovidDashboard from './graphs/CovidDashboard';
import ExportData from './graphs/ExportData';
import AddData from './graphs/AddData';
import Topbar from '../components/Topbar/Topbar';
import Login from '../components/Auth/Login';
import EditData from './graphs/EditData';
import EditDataHome from './graphs/EditDataSearch';
import DeleteData from './graphs/DeleteData';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AppContainer = styled.div`
    min-height: 100vh;
    background-color: #1a1a1a;
`;

const Content = styled.div``;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    return (
        <Router>
            <AppContainer>
                <Topbar 
                    key={isAuthenticated}
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                />
                <Content>
                    <Routes>
                        <Route path="/" element={<CovidDashboard />} />
                        <Route path="/export" element={<ExportData />} />
                        <Route
                            path="/add-data"
                            element={
                                isAuthenticated ? (
                                    <AddData />
                                ) : (
                                    <Login setIsAuthenticated={setIsAuthenticated} />
                                )
                            }
                        />
                        <Route
                            path="/edit-data"
                            element={
                            isAuthenticated ? (
                                <EditDataHome />
                            ) : (
                                <Login setIsAuthenticated={setIsAuthenticated} />
                            )
                            }
                        />
                        <Route
                            path="/edit/:country"
                            element={
                            isAuthenticated ? (
                                <EditData />
                            ) : (
                                <Login setIsAuthenticated={setIsAuthenticated} />
                            )
                            }
                        />
                        <Route
                            path="/login"
                            element={<Login setIsAuthenticated={setIsAuthenticated} />}
                        />
                        <Route
                            path="/edit/:country"
                            element={
                                isAuthenticated ? (
                                    <EditData />
                                ) : (
                                    <Login setIsAuthenticated={setIsAuthenticated} />
                                )
                            }
                        />
                            <Route
                                path="/delete-data"
                                element={
                                    isAuthenticated ? (
                                        <DeleteData />
                                    ) : (
                                        <Login setIsAuthenticated={setIsAuthenticated} />
                                    )
                                }
                            />
                    </Routes>
                </Content>
                <ToastContainer position="top-right" autoClose={3000} />
            </AppContainer>
        </Router>
    );
}    

export default App;
