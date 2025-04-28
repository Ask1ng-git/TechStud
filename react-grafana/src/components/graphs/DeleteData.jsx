import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { parseISO } from 'date-fns';
import { format } from 'date-fns';

const DeleteData = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3005/api/countries')
      .then(res => res.json())
      .then(data => {
        const countryList = data.map(item => item.nompays);
        setCountries(countryList);
      })
      .catch(err => {
        console.error("❌ Erreur chargement pays:", err);
        toast.error("Erreur lors du chargement des pays");
      });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetch(`http://localhost:3005/api/data/${selectedCountry}/dates`)
        .then(res => res.json())
        .then(data => {
          const dates = data.map(d => parseISO(d.date));
          setAvailableDates(dates);
        })
        .catch(err => {
          console.error("❌ Erreur chargement dates:", err);
          toast.error("Erreur lors du chargement des dates");
        });
    }
  }, [selectedCountry]);

const handleDelete = async () => {
    if (!selectedCountry || !selectedDate) {
      toast.warn("❗ Veuillez choisir un pays et une date !");
      return;
    }
  
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer ces données ?")) {
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("🚫 Vous devez être connecté.");
      return;
    }
  
    try {
      const dateFormatted = format(selectedDate, 'yyyy-MM-dd');
  
      const response = await fetch(`http://localhost:3005/api/data/${selectedCountry}/${dateFormatted}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        toast.success("✅ Données supprimées !");
        navigate('/');
      } else {
        const result = await response.json();
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Erreur serveur:", error);
      toast.error("Erreur lors de la suppression.");
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h2>🗑️ Supprimer des Données COVID</h2>

      <div>
        <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} required>
          <option value="">-- Sélectionner un pays --</option>
          {countries.map((country, idx) => (
            <option key={idx} value={country}>{country}</option>
          ))}
        </select>
      </div>

      {selectedCountry && (
        <div style={{ marginTop: "15px" }}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            includeDates={availableDates}
            placeholderText="Sélectionnez une date"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      )}

      <button
        onClick={handleDelete}
        style={{ marginTop: "20px", padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        🗑️ Supprimer
      </button>
    </div>
  );
};

export default DeleteData;
