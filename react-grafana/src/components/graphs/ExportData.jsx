import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Select from 'react-select';

const ExportContainer = styled.div`
    padding: 20px;
    background-color: #f8f8f8;
    min-height: 100vh;
    color: #333;
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

const ExportData = () => {
    const [countries, setCountries] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const allColumns = ['total_cases', 'total_deaths', 'total_recoveries', 'total_active_cases'];

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('http://localhost:3005/api/countries');
                const data = await response.json();
                const unique = [...new Set(data.map(country => country.nompays))];
                setCountries(unique);
            } catch (error) {
                console.error('❌ Erreur lors de la récupération des pays:', error);
            }
        };
        fetchCountries();
    }, []);

    const handleExport = async (format) => {
        if (selectedCountries.length === 0 || selectedColumns.length === 0) {
            alert("Veuillez sélectionner au moins un pays et une colonne.");
            return;
        }

        const url = `http://localhost:3005/api/export-multiple/${format}`;
        const payload = {
            countries: selectedCountries,
            columns: selectedColumns,
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Erreur lors de l\'export');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `export.${format === 'csv' ? 'csv' : 'json'}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('❌ Erreur export multiple :', err);
        }
    };

    const countryOptions = countries.map(c => ({ value: c, label: c }));

    return (
        <ExportContainer>
            <h1>📤 Exporter les Données COVID-19</h1>

            {/* Sélection des pays */}
            <h3>🌍 Sélectionner les pays :</h3>
            <Select
                isMulti
                options={countryOptions}
                onChange={(selected) => setSelectedCountries(selected.map(option => option.value))}
                placeholder="Rechercher un ou plusieurs pays..."
            />

            {/* Sélection des colonnes */}
            <h3 style={{ marginTop: '20px' }}>📊 Sélectionner les colonnes à exporter :</h3>
            <CheckboxContainer>
                {allColumns.map(column => (
                    <CheckboxLabel key={column}>
                        <Checkbox
                            type="checkbox"
                            checked={selectedColumns.includes(column)}
                            onChange={() => {
                                setSelectedColumns(prev =>
                                    prev.includes(column)
                                        ? prev.filter(col => col !== column)
                                        : [...prev, column]
                                );
                            }}
                        />
                        {column}
                    </CheckboxLabel>
                ))}
            </CheckboxContainer>

            {/* Boutons d'export */}
            <div style={{ marginTop: '20px' }}>
                <Button onClick={() => handleExport('csv')} disabled={selectedCountries.length === 0 || selectedColumns.length === 0}>
                    📥 Exporter CSV
                </Button>
                <Button onClick={() => handleExport('json')} disabled={selectedCountries.length === 0 || selectedColumns.length === 0}>
                    📥 Exporter JSON
                </Button>
            </div>
        </ExportContainer>
    );
};

export default ExportData;
