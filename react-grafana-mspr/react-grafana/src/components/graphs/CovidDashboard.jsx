import React, { Component } from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
    padding: 20px;
    background-color: #f8f8f8;
    color: #333;
    min-height: 100vh;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 2em;
    font-weight: bold;
`;

const SelectCountry = styled.select`
    padding: 10px;
    font-size: 16px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background-color: #fff;
`;

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 20px;
`;

const StatCard = styled.div`
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const StatTitle = styled.h4`  // ✅ Ajout de StatTitle ici
    color: #8884d8;
    font-size: 1.2em;
    margin-bottom: 10px;
`;

const StatValue = styled.p`
    font-size: 2em;
    font-weight: bold;
`;

const Button = styled.button`
    padding: 10px;
    font-size: 16px;
    margin: 10px;
    background-color: ${(props) => props.color || '#007BFF'};
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background-color: ${(props) => props.hoverColor || '#0056b3'};
    }
`;

const IframeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);  
    gap: 20px;
    margin-top: 20px;
`;

const IframeContainer = styled.div`
    width: 100%;
    height: 600px;
`;

class CovidDashboard extends Component {
    state = {
        totalCases: 0,
        totalDeaths: 0,
        totalRecoveries: 0,
        totalActiveCases: 0,
        selectedCountry: 'China',
        countries: [],
        lastAvailableDate: '',
        isAuthenticated: false,
    };

    async componentDidMount() {
        this.checkAuthStatus();
        await this.fetchCountries();
        await this.fetchCovidData(this.state.selectedCountry);
        await this.fetchLastAvailableDate();
    }

    checkAuthStatus = () => {
        const token = localStorage.getItem('token');
        this.setState({ isAuthenticated: !!token });
    };

    fetchCountries = async () => {
        try {
            const response = await fetch('http://localhost:3005/api/countries');
            const countries = await response.json();
            this.setState({ countries: countries.map(country => country.nompays) });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des pays:', error);
        }
    };

    fetchCovidData = async (country) => {
        try {
            const response = await fetch(`http://localhost:3005/api/data/${country}`);
            if (!response.ok) {
                throw new Error(`❌ Aucune donnée trouvée pour ${country}`);
            }
            const data = await response.json();
            if (data.length > 0) {
                this.setState({
                    totalCases: data[0].total_cases,
                    totalDeaths: data[0].total_deaths,
                    totalRecoveries: data[0].total_recoveries,
                    totalActiveCases: data[0].total_active_cases,
                });
            }
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des données:", error);
        }
    };

    fetchLastAvailableDate = async () => {
        try {
            const response = await fetch('http://localhost:3005/api/last-date');
            if (!response.ok) {
                throw new Error("❌ Impossible de récupérer la dernière date disponible");
            }
            const data = await response.json();
            this.setState({ lastAvailableDate: data.last_date });
        } catch (error) {
            console.error("❌ Erreur lors de la récupération de la date:", error);
        }
    };

    handleCountryChange = (event) => {
        const selectedCountry = event.target.value;
        this.setState({ selectedCountry }, () => {
            this.fetchCovidData(selectedCountry);
        });
    };

    handleDeleteData = async () => {
        const { selectedCountry, isAuthenticated } = this.state;

        if (!isAuthenticated) {
            alert("🚫 Vous devez être connecté pour supprimer des données.");
            return;
        }

        const confirmDelete = window.confirm(`⚠️ Supprimer les données pour ${selectedCountry} ?`);
        if (!confirmDelete) return;

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3005/api/data/${selectedCountry}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert(`✅ Données pour ${selectedCountry} supprimées avec succès !`);
                this.fetchCountries();
            } else {
                alert("❌ Échec de la suppression.");
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
        }
    };

    render() {
        const { totalCases, totalDeaths, totalRecoveries, totalActiveCases, selectedCountry, countries, lastAvailableDate, isAuthenticated } = this.state;

        return (
            <DashboardContainer>
                <Header>
                    <div>Statistiques COVID-19</div>
                    <SelectCountry value={selectedCountry} onChange={this.handleCountryChange}>
                        {countries.map((country) => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </SelectCountry>
                </Header>

                <DashboardGrid>
                    <StatCard><StatTitle>Total Cases</StatTitle><StatValue>{totalCases || "N/A"}</StatValue></StatCard>
                    <StatCard><StatTitle>Total Deaths</StatTitle><StatValue>{totalDeaths || "N/A"}</StatValue></StatCard>
                    <StatCard><StatTitle>Total Recoveries</StatTitle><StatValue>{totalRecoveries || "N/A"}</StatValue></StatCard>
                    <StatCard><StatTitle>Total Active Cases</StatTitle><StatValue>{totalActiveCases || "N/A"}</StatValue></StatCard>
                </DashboardGrid>

                {isAuthenticated && (
                    <Button color="#FF3B30" hoverColor="#CC0000" onClick={this.handleDeleteData}>
                        🗑 Supprimer Données
                    </Button>
                )}

                {/* 📊 Les 4 iframes Grafana */}
                <IframeGrid>
                    {[1, 2, 3, 4].map(panelId => (
                        <IframeContainer key={panelId}>
                            <iframe 
                                src={`http://localhost:3001/d-solo/befkuqc7pdbeoc/new-dashboard?orgId=1&from=${lastAvailableDate}&to=${lastAvailableDate}&var-country=${encodeURIComponent(selectedCountry)}&panelId=${panelId}&kiosk=1`} 
                                width="100%" height="600px" frameBorder="0" title={`Grafana Dashboard ${panelId}`} 
                            />
                        </IframeContainer>
                    ))}
                </IframeGrid>
            </DashboardContainer>
        );
    }
}

export default CovidDashboard;
