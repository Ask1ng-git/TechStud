import os
os.environ['KAGGLE_CONFIG_DIR'] = os.path.abspath(".")
import kaggle
import zipfile
import pandas as pd
from ETL import etl_process
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 📌 Charger les variables d'environnement
load_dotenv()

# 📌 Paramètres
KAGGLE_DATASET = "imdevskp/corona-virus-report"
CSV_FILE_NAME = "covid_19_clean_complete.csv"
CSV_PATH = f"./CSV/{CSV_FILE_NAME}"
OUTPUT_CSV = "./CSV/fullgro_cleans.csv"

# 📌 Config PostgreSQL (depuis .env)
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# Crée le dossier CSV s'il n'existe pas
os.makedirs('./CSV', exist_ok=True)

# 📌 Fonction robuste et claire de téléchargement Kaggle
def download_kaggle_data():
    print("📥 Téléchargement depuis Kaggle...")
    kaggle.api.dataset_download_files(KAGGLE_DATASET, path='./CSV', unzip=True)
    print("✅ Téléchargement terminé.")

# 📌 Exécution ETL clairement après téléchargement
def execute_etl():
    print("⚙️ Exécution ETL...")
    cleaned_df = etl_process(CSV_PATH, OUTPUT_CSV)
    print("✅ ETL terminé.")
    return cleaned_df

# 📌 Insertion dans PostgreSQL
def insert_into_db(df):
    print("🗃️ Insertion dans PostgreSQL...")
    engine = create_engine(f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

    # Insérer dans temp_statistiques
    df.to_sql('temp_statistiques', engine, if_exists='replace', index=False)
    print("✅ Données insérées dans temp_statistiques.")

    with engine.begin() as conn:
        # ✅ Remplir pays avec who_region corrigé explicitement
        conn.execute(text("""
            INSERT INTO pays (nom_pays, who_region)
            SELECT DISTINCT "Country/Region", "WHO Region"
            FROM temp_statistiques
            ON CONFLICT (nom_pays) DO NOTHING;
        """))
        print("✅ Table 'pays' remplie.")


        # ✅ Remplir statistiques_quotidiennes corrigé (avec date et who_region)

        # ✅ Insertion correcte avec gestion complète des conflits
        conn.execute(text("""
            INSERT INTO statistiques_par_pays (id_pays, total_cases, total_deaths, total_recovered, active_cases)
            SELECT 
                id_pays, 
                SUM(total_cases), 
                SUM(total_deaths), 
                SUM(total_recovered), 
                SUM(active_cases)
            FROM statistiques_quotidiennes
            GROUP BY id_pays
            ON CONFLICT (id_pays) DO UPDATE SET
                total_cases = EXCLUDED.total_cases,
                total_deaths = EXCLUDED.total_deaths,
                total_recovered = EXCLUDED.total_recovered,
                active_cases = EXCLUDED.active_cases;
        """))
        print("✅ Table statistiques_par_pays remplie avec succès.")



        # ✅ Remplir statistiques_par_pays avec données agrégées depuis statistiques_quotidiennes
        conn.execute(text("""
            INSERT INTO statistiques_quotidiennes (
                id_pays, total_cases, total_deaths, total_recovered, active_cases, date, who_region
            )
            SELECT 
                p.id, 
                t."TotalCases", 
                t."TotalDeaths", 
                t."TotalRecovered", 
                t."ActiveCases",
                TO_DATE(t."Date", 'YYYY-MM-DD'),  -- ✅ format corrigé définitivement ici
                t."WHO Region"
            FROM temp_statistiques t
            JOIN pays p ON p.nom_pays = t."Country/Region";
        """))


        # ✅ Suppression des colonnes non nécessaires de temp_statistiques (province, lat, long, anomaly)
        conn.execute(text("""
            ALTER TABLE temp_statistiques
            DROP COLUMN IF EXISTS "Province_State",
            DROP COLUMN IF EXISTS "Lat",
            DROP COLUMN IF EXISTS "Long",
            DROP COLUMN IF EXISTS "Anomaly";
        """))
        print("✅ Colonnes inutiles supprimées de temp_statistiques.")



# 📌 Création automatique de la base de données
def create_database_if_not_exists():
    engine = create_engine(f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres")
    with engine.connect() as conn:
        conn.execute(text("commit"))
        result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{DB_NAME}'"))
        exists = result.scalar()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{DB_NAME}"'))
            print(f"✅ Base '{DB_NAME}' créée automatiquement.")
        else:
            print(f"✅ Base '{DB_NAME}' déjà existante.")

# 📌 Création automatique des tables nécessaires
def create_tables():
    engine = create_engine(f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS pays (
                id SERIAL PRIMARY KEY,
                nom_pays VARCHAR(255) UNIQUE NOT NULL,
                who_region VARCHAR(255)
            );
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS statistiques_quotidiennes (
                id SERIAL PRIMARY KEY,
                id_pays INTEGER REFERENCES pays(id),
                total_cases INTEGER,
                total_deaths INTEGER,
                total_recovered INTEGER,
                active_cases INTEGER,
                date DATE,                 -- ✅ Colonne date ajoutée
                who_region VARCHAR(255)    -- ✅ colonne ajoutée explicitement
            );
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS statistiques_par_pays (
                id SERIAL PRIMARY KEY,
                id_pays INTEGER UNIQUE REFERENCES pays(id),
                total_cases INTEGER,
                total_deaths INTEGER,
                total_recovered INTEGER,
                active_cases INTEGER
            );
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS temp_statistiques (
                Province_State VARCHAR(255),
                "Country/Region" VARCHAR(255),
                Lat FLOAT,
                Long FLOAT,
                Date DATE,
                TotalCases INTEGER,
                TotalDeaths INTEGER,
                TotalRecovered INTEGER,
                ActiveCases INTEGER,
                WHO_Region VARCHAR(255)
            );
        """))
    print("✅ Toutes les tables créées correctement avec les bonnes colonnes.")



# 🏁 Exécution du pipeline complet dans le bon ordre !
def main():
    download_kaggle_data()  # ⚠️ Téléchargement AVANT ETL
    cleaned_df = execute_etl()
    
    # Ajouts pour automatisation complète :
    create_database_if_not_exists()
    create_tables()
    
    if cleaned_df is not None:
        insert_into_db(cleaned_df)
    print("🚀 Pipeline terminé avec succès !")

if __name__ == "__main__":
    main()
