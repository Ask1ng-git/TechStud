import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Important : le style du calendrier
import { format, parseISO } from 'date-fns'; // Pour bien formater les dates

const EditData = () => {
  const { country } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: new Date(), // Date choisie
    total_cases: '',
    total_deaths: '',
    total_recoveries: '',
    total_active_cases: '',
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    fetch(`http://localhost:3005/api/data/${country}/dates`) // 💬 Nouvelle route API pour récupérer toutes les dates existantes
      .then(res => res.json())
      .then(data => {
        const dates = data.map(d => parseISO(d.date)); // Adapter selon ta BDD
        setAvailableDates(dates);
      })
      .catch(err => {
        console.error("❌ Erreur lors du chargement des dates:", err);
      });
  }, [country]);

  const handleDateChange = async (date) => {
    setFormData({ ...formData, date });

    try {
      const dateFormatted = format(date, 'yyyy-MM-dd');
      const response = await fetch(`http://localhost:3005/api/data/${country}/${dateFormatted}`);
      const data = await response.json();
      if (response.ok && data.length > 0) {
        setFormData({
          date,
          total_cases: data[0].totalcas || '',
          total_deaths: data[0].totaldeces || '',
          total_recoveries: data[0].totalrecuperes || '',
          total_active_cases: data[0].casactifs || '',
        });
        toast.info('ℹ️ Données existantes chargées.');
      } else {
        setFormData(prev => ({
          ...prev,
          total_cases: '',
          total_deaths: '',
          total_recoveries: '',
          total_active_cases: '',
        }));
        toast.info('ℹ️ Aucune donnée pour cette date, vous pouvez en ajouter.');
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des données:", error);
      toast.error("Erreur lors de la récupération.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("🚫 Vous devez être connecté.");
      return;
    }

    const token = localStorage.getItem('token');

    const payload = {
      nomPays: country,
      date: format(formData.date, 'yyyy-MM-dd'),
      total_cases: formData.total_cases,
      total_deaths: formData.total_deaths,
      total_recoveries: formData.total_recoveries,
      total_active_cases: formData.total_active_cases,
    };

    try {
      const response = await fetch(`http://localhost:3005/api/data/${country}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("✅ Données mises à jour !");
        navigate('/');
      } else {
        toast.error("❌ Échec de la mise à jour.");
      }
    } catch (error) {
      console.error("❌ Erreur serveur:", error);
      toast.error("Erreur serveur.");
    }
  };

  const isDayHighlighted = (date) => {
    return availableDates.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Modifier / Ajouter les données pour {country}</h2>
      <form onSubmit={handleSubmit}>
        <label>Date :</label>
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          includeDates={availableDates}  // ✅ Seules les dates valides sont cliquables
          highlightDates={[
            {
              "react-datepicker__day--highlighted-custom-1": availableDates
            }
          ]}
          dayClassName={date => isDayHighlighted(date) ? "highlighted" : undefined}
          dateFormat="yyyy-MM-dd"
          placeholderText="Sélectionnez une date disponible"
        />


        <label>Total Cases:</label>
        <input type="number" name="total_cases" value={formData.total_cases} onChange={e => setFormData({...formData, total_cases: e.target.value})} required />

        <label>Total Deaths:</label>
        <input type="number" name="total_deaths" value={formData.total_deaths} onChange={e => setFormData({...formData, total_deaths: e.target.value})} required />

        <label>Total Recoveries:</label>
        <input type="number" name="total_recoveries" value={formData.total_recoveries} onChange={e => setFormData({...formData, total_recoveries: e.target.value})} required />

        <label>Total Active Cases:</label>
        <input type="number" name="total_active_cases" value={formData.total_active_cases} onChange={e => setFormData({...formData, total_active_cases: e.target.value})} required />

        <button type="submit" style={{ marginTop: "10px", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          🔄 Enregistrer
        </button>
      </form>
    </div>
  );
};

export default EditData;
