import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  color: #333;
`;

const Select = styled.select`
  width: 250px;
  padding: 10px;
  margin-right: 10px;
  font-size: 16px;
  border-radius: 5px;
`;

const Input = styled.input`
  width: 250px;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const EditDataHome = () => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3005/api/countries')
      .then(res => res.json())
      .then(data => {
        const countryList = data.map(item => item.nompays);
        setCountries(countryList);
        setFilteredCountries(countryList);
      })
      .catch(err => {
        console.error("❌ Erreur lors de la récupération des pays:", err);
        toast.error("Erreur lors du chargement des pays");
      });
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredCountries(countries.filter(c => c.toLowerCase().includes(value)));
  };

  const handleSelect = (e) => {
    setSelectedCountry(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCountry) {
      navigate(`/edit/${selectedCountry}`);
    } else {
      toast.warn("❗ Veuillez choisir un pays avant de continuer.");
    }
  };

  return (
    <Container>
      <h2>✏️ Modifier les données d'un pays</h2>

      <Input
        type="text"
        placeholder="Rechercher un pays..."
        value={search}
        onChange={handleSearch}
      />

      <form onSubmit={handleSubmit}>
        <Select value={selectedCountry} onChange={handleSelect} required>
          <option value="">-- Sélectionner un pays --</option>
          {filteredCountries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </Select>

        <Button type="submit">Modifier</Button>
      </form>
    </Container>
  );
};

export default EditDataHome;
