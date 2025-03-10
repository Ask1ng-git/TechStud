import Papa from 'papaparse';

export const loadCSVData = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const transformCovidData = (data) => {
    return data.map(row => ({
        date: row.date,
        nouveauxCas: row.nouveaux_cas,
        deces: row.deces,
        guerisons: row.guerisons,
        casActifs: row.cas_actifs,
        testsEffectues: row.tests_effectues,
        tauxPositivite: row.taux_positivite,
        patientsReanimation: row.patients_reanimation,
        region: row.region
    }));
};

export const transformWeatherData = (data) => {
    return data.map(row => ({
        dt: row.dt,
        main: {
            temp: row.temp,
            temp_min: row.temp_min,
            temp_max: row.temp_max,
            pressure: row.pressure,
            humidity: row.humidity
        },
        weather: [{
            main: row.weather_main,
            description: row.weather_description
        }],
        wind: {
            speed: row.wind_speed,
            deg: row.wind_deg
        },
        dt_txt: row.dt_txt
    }));
}; 