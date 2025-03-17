import React, { Component } from 'react';
import styled from 'styled-components';

const ExportContainer = styled.div`
    padding: 20px;
    background-color: #f8f8f8;
    min-height: 100vh;
    color: #333;
`;

const Select = styled.select`
    padding: 10px;
    font-size: 16px;
    margin-bottom: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #fff;
    width: 100%;
`;

const CheckboxContainer = styled.div`
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    font-size: 14px;
`;

const Checkbox = styled.input`
    margin-right: 5px;
`;

const Button = styled.button`
    padding: 10px;
    font-size: 16px;
    background-color: ${(props) => (props.disabled ? '#ccc' : '#007BFF')};
    color: white;
    border: none;
    border-radius: 5px;
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    margin-right: 10px;
    &:hover {
        background-color: ${(props) => (props.disabled ? '#ccc' : '#0056b3')};
    }
`;

class ExportData extends Component {
    state = {
        selectedCountry: '',
        selectedColumns: [],
        countries: [],
        allColumns: ['total_cases', 'total_deaths', 'total_recoveries', 'total_active_cases'],
    };

    componentDidMount() {
        this.fetchCountries();
    }

    fetchCountries = async () => {
        try {
            const response = await fetch('http://localhost:3005/api/countries');
            const countries = await response.json();
            this.setState({ countries: countries.map(country => country.nompays) });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des pays:', error);
        }
    };

    handleColumnChange = (column) => {
        this.setState((prevState) => {
            const { selectedColumns } = prevState;
            if (selectedColumns.includes(column)) {
                return { selectedColumns: selectedColumns.filter(col => col !== column) };
            } else {
                return { selectedColumns: [...selectedColumns, column] };
            }
        });
    };

    handleExport = (format) => {
        let { selectedCountry, selectedColumns } = this.state;
    
        console.log(`📤 Exportation demandée pour: ${selectedCountry}`);
    
        if (!selectedCountry || selectedColumns.length === 0) {
            alert("Veuillez sélectionner un pays et au moins une colonne avant d'exporter.");
            return;
        }
    
        // Correction : Si l'abréviation "US" est utilisée, la convertir en "United States"
        if (selectedCountry === "US") selectedCountry = "United States";
    
        const columns = selectedColumns.join(',');
        const url = `http://localhost:3005/api/export/${format}/${selectedCountry}/${columns}`;
        window.open(url, '_blank');
    };
    

    render() {
        const { selectedCountry, countries, selectedColumns, allColumns } = this.state;
        const isExportDisabled = !selectedCountry || selectedColumns.length === 0;

        return (
            <ExportContainer>
                <h1>📤 Exporter les Données COVID-19</h1>

                {/* Sélection du pays */}
                <Select value={selectedCountry} onChange={(e) => this.setState({ selectedCountry: e.target.value })}>
                    <option value="">-- Choisir un pays --</option>
                    {countries.map(country => <option key={country} value={country}>{country}</option>)}
                </Select>

                {/* Sélection des colonnes */}
                <h3>📊 Sélectionner les colonnes à exporter :</h3>
                <CheckboxContainer>
                    {allColumns.map(column => (
                        <CheckboxLabel key={column}>
                            <Checkbox
                                type="checkbox"
                                checked={selectedColumns.includes(column)}
                                onChange={() => this.handleColumnChange(column)}
                            />
                            {column}
                        </CheckboxLabel>
                    ))}
                </CheckboxContainer>

                {/* Boutons d'export */}
                <div style={{ marginTop: '20px' }}>
                    <Button onClick={() => this.handleExport('csv')} disabled={isExportDisabled}>
                        📥 Exporter CSV
                    </Button>
                    <Button onClick={() => this.handleExport('json')} disabled={isExportDisabled}>
                        📥 Exporter JSON
                    </Button>
                </div>
            </ExportContainer>
        );
    }
}

export default ExportData;
