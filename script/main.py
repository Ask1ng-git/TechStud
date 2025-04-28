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

#  Paramètres
KAGGLE_DATASET = "imdevskp/corona-virus-report"
CSV_FILE_NAME = "covid_19_clean_complete.csv"
CSV_PATH = f"./CSV/{CSV_FILE_NAME}"
OUTPUT_CSV = "./CSV/fullgro_cleans.csv"

#  Config PostgreSQL (depuis .env)
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# Crée le dossier CSV s'il n'existe pas
os.makedirs('./CSV', exist_ok=True)

#  Téléchargement des données depuis Kaggle
def download_kaggle_data():
    print("📥 Téléchargement depuis Kaggle...")
    kaggle.api.dataset_download_files(KAGGLE_DATASET, path='./CSV', unzip=True)
    print("✅ Téléchargement terminé.")

#  Exécution de l'ETL
def execute_etl():
    print("⚙️ Exécution ETL avec validation des données Train-Test-Validation...")
    etl_process(CSV_PATH, "./CSV")  # ✅ On exécute l’ETL et la validation
    print("✅ ETL terminé.")



def execute_etl():
    print("⚙️ Exécution ETL avec division Train-Test-Validation...")
    train, test, validation = etl_process(CSV_PATH, "./CSV")
    print("✅ ETL terminé.")
    return train, test, validation



# 📌 Insertion dans PostgreSQL avec les nouveaux champs (PredictedCases & Cluster)
def insert_into_db(df):
    print("🗃️ Insertion dans PostgreSQL...")

    engine = create_engine(f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

    # ✅ Suppression et recréation de la table temporaire pour éviter les erreurs
    with engine.begin() as conn:
            conn.execute(text("DROP TABLE IF EXISTS temp_statistiques;"))
            conn.execute(text("""
                CREATE TABLE temp_statistiques (
                    "Country/Region" VARCHAR(255),
                    "WHO Region" VARCHAR(255),
                    Date DATE,
                    Confirmed INTEGER,
                    Deaths INTEGER,
                    Recovered INTEGER,
                    Active INTEGER,
                );
            """))

    
    df.to_sql('temp_statistiques', engine, if_exists='replace', index=False)
    print(" Données insérées dans temp_statistiques.")

    with engine.begin() as conn:
        # ✅ Remplir la table pays
        conn.execute(text("""
            INSERT INTO pays (nom_pays, who_region)
            SELECT DISTINCT "Country/Region", "WHO Region"
            FROM temp_statistiques
            ON CONFLICT (nom_pays) DO NOTHING;
        """))
        print("✅ Table 'pays' remplie.")

        # Insertion des données dans statistiques_quotidiennes
        conn.execute(text("""
            INSERT INTO statistiques_quotidiennes (
                id_pays, confirmed, deaths, recovered, active, date, who_region)
            SELECT 
                p.id, 
                t."Confirmed",
                t."Deaths", 
                t."Recovered", 
                t."Active",
                t."Date",
                t."WHO Region",
            FROM temp_statistiques t
            JOIN pays p ON p.nom_pays = t."Country/Region";
        """))

        print("✅ Table statistiques_quotidiennes mise à jour.")


        # ✅ Agrégation des statistiques par pays
        conn.execute(text("""
            INSERT INTO statistiques_par_pays (id_pays, confirmed, deaths, recovered, active)
            SELECT 
                id_pays, 
                SUM(confirmed), 
                SUM(deaths), 
                SUM(recovered), 
                SUM(active)
            FROM statistiques_quotidiennes
            GROUP BY id_pays
            ON CONFLICT (id_pays) DO UPDATE SET
                confirmed = EXCLUDED.confirmed,
                deaths = EXCLUDED.deaths,
                recovered = EXCLUDED.recovered,
                active = EXCLUDED.active;
        """))
        print("✅ Table statistiques_par_pays mise à jour.")

# 📌 Création de la base de données si elle n'existe pas
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

# Création des tables avec les nouveaux champs
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
                confirmed INTEGER,
                deaths INTEGER,
                recovered INTEGER,
                active INTEGER,
                date DATE,
                who_region VARCHAR(255)
            );
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS statistiques_par_pays (
                id SERIAL PRIMARY KEY,
                id_pays INTEGER UNIQUE REFERENCES pays(id),
                confirmed INTEGER,
                deaths INTEGER,
                recovered INTEGER,
                active INTEGER
            );
        """))
        # Vérifier que temp_statistiques contient les bonnes colonnes
        conn.execute(text("""
            DROP TABLE IF EXISTS temp_statistiques;
        """))
        conn.execute(text("""
            CREATE TABLE temp_statistiques (
                "Country/Region" VARCHAR(255),
                "WHO Region" VARCHAR(255),
                Date DATE,
                Confirmed INTEGER,
                Deaths INTEGER,
                Recovered INTEGER,
                Active INTEGER,
                PredictedCases INTEGER,  
                Cluster VARCHAR(20)  
            );
        """))
    print(" Toutes les tables ont été vérifiées et mises à jour.")


# 📌 Exécution complète du pipeline
def main():
    download_kaggle_data()
    execute_etl()  # ✅ On exécute l'ETL mais on ne récupère pas les données

    create_database_if_not_exists()
    create_tables()

    print("🚀 Pipeline terminé avec succès !")  # ✅ On ne fait PAS insert_into_db()


if __name__ == "__main__":
    main()
