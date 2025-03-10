import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { loadCSVData, transformCovidData } from '../../utils/csvLoader';
import styled from 'styled-components';

const DashboardContainer = styled.div`
    padding: 20px;
    background-color: #1a1a1a;
    color: #ffffff;
`;

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 20px;
`;

const ChartCard = styled.div`
    background-color: #2c2c2c;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
    margin: 0 0 15px 0;
    color: #ffffff;
    font-size: 1.2em;
`;

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 20px;
`;

const StatCard = styled.div`
    background-color: #2c2c2c;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    
    h4 {
        margin: 0;
        color: #8884d8;
        font-size: 0.9em;
    }
    
    p {
        margin: 10px 0 0 0;
        font-size: 1.5em;
        font-weight: bold;
    }
`;

class CovidDashboard extends Component {
    state = {
        data: [],
        latestStats: null
    };

    async componentDidMount() {
        try {
            const rawData = await loadCSVData('/data/csv/covid-data.csv');
            const transformedData = transformCovidData(rawData);
            const latestStats = transformedData[transformedData.length - 1];
            this.setState({ data: transformedData, latestStats });
        } catch (error) {
            console.error('Error loading COVID data:', error);
        }
    }

    render() {
        const { data, latestStats } = this.state;
        
        return (
            <DashboardContainer>
                <h2>Dashboard COVID-19 - Île-de-France</h2>
                
                {latestStats && (
                    <StatsContainer>
                        <StatCard>
                            <h4>Nouveaux Cas</h4>
                            <p>{latestStats.nouveauxCas}</p>
                        </StatCard>
                        <StatCard>
                            <h4>Décès</h4>
                            <p>{latestStats.deces}</p>
                        </StatCard>
                        <StatCard>
                            <h4>Guérisons</h4>
                            <p>{latestStats.guerisons}</p>
                        </StatCard>
                        <StatCard>
                            <h4>Patients en Réanimation</h4>
                            <p>{latestStats.patientsReanimation}</p>
                        </StatCard>
                    </StatsContainer>
                )}

                <DashboardGrid>
                    <ChartCard>
                        <ChartTitle>Évolution des cas</ChartTitle>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                                <XAxis dataKey="date" stroke="#ffffff" />
                                <YAxis stroke="#ffffff" />
                                <Tooltip contentStyle={{ backgroundColor: '#2c2c2c', border: 'none', color: '#ffffff' }} />
                                <Legend />
                                <Area type="monotone" dataKey="nouveauxCas" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Nouveaux cas" />
                                <Area type="monotone" dataKey="casActifs" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Cas actifs" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard>
                        <ChartTitle>Taux de positivité et tests</ChartTitle>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                                <XAxis dataKey="date" stroke="#ffffff" />
                                <YAxis yAxisId="left" stroke="#ffffff" />
                                <YAxis yAxisId="right" orientation="right" stroke="#ffffff" />
                                <Tooltip contentStyle={{ backgroundColor: '#2c2c2c', border: 'none', color: '#ffffff' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="tauxPositivite" stroke="#ffc658" name="Taux de positivité (%)" />
                                <Line yAxisId="right" type="monotone" dataKey="testsEffectues" stroke="#ff8042" name="Tests effectués" />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard>
                        <ChartTitle>Réanimation et décès</ChartTitle>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                                <XAxis dataKey="date" stroke="#ffffff" />
                                <YAxis stroke="#ffffff" />
                                <Tooltip contentStyle={{ backgroundColor: '#2c2c2c', border: 'none', color: '#ffffff' }} />
                                <Legend />
                                <Bar dataKey="patientsReanimation" fill="#ff8042" name="Patients en réanimation" />
                                <Bar dataKey="deces" fill="#ff4444" name="Décès" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard>
                        <ChartTitle>Guérisons</ChartTitle>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                                <XAxis dataKey="date" stroke="#ffffff" />
                                <YAxis stroke="#ffffff" />
                                <Tooltip contentStyle={{ backgroundColor: '#2c2c2c', border: 'none', color: '#ffffff' }} />
                                <Legend />
                                <Line type="monotone" dataKey="guerisons" stroke="#4CAF50" name="Guérisons" />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </DashboardGrid>
            </DashboardContainer>
        );
    }
}

export default CovidDashboard; 