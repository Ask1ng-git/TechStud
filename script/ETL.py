import pandas as pd
import numpy as np
import seaborn as sns
import missingno as mno
import matplotlib.pyplot as plt
import os

# 📌 Fonction principale ETL
def etl_process(csv_file, output_file="./CSV/fullgro_cleans.csv"):
    try:
        # 🟢 EXTRACTION : Lecture des données
        df = pd.read_csv(csv_file, encoding='ISO-8859-1')
        print(f"✅ Fichier {csv_file} chargé avec succès !")

        # 🟢 EXPLORATION INITIALE
        print("\n🔍 Aperçu des données :")
        print(df.head())
        print("\n🔍 Description statistique :")
        print(df.describe())

        # ✅ Correction des noms de colonnes pour correspondre au fichier réel
        column_mapping = {
            "Confirmed": "TotalCases",
            "Deaths": "TotalDeaths",
            "Recovered": "TotalRecovered",
            "Active": "ActiveCases",
            "New cases": "NewCases",
            "New deaths": "NewDeaths",
            "New recovered": "NewRecovered"
        }
        df.rename(columns=column_mapping, inplace=True)

        # 🟡 GESTION DES DONNÉES MANQUANTES
        print("\n🛠 Gestion des valeurs manquantes...")
        missing_before = df.isnull().sum()

        # ✅ Remplacement de tous les NaN par 0 AVANT tout calcul
        df.fillna(0, inplace=True)

        # ✅ Vérification et recalcul correct de ActiveCases
        df["ActiveCases"] = df["TotalCases"] - df["TotalDeaths"] - df["TotalRecovered"]

        # ✅ Vérification des valeurs manquantes après traitement
        missing_after = df.isnull().sum()
        print("\n🟢 Valeurs manquantes AVANT traitement :\n", missing_before)
        print("🟢 Valeurs manquantes APRÈS traitement :\n", missing_after)

        # 📊 Visualisation des valeurs manquantes
        mno.matrix(df, figsize=(12, 6))
        plt.title("Visualisation des valeurs manquantes")
        plt.show()

        # 🔴 GESTION DES DOUBLONS
        print("\n🔄 Suppression des doublons...")
        before_dedup = df.shape[0]
        df.drop_duplicates(inplace=True)
        after_dedup = df.shape[0]
        print(f"🟢 {before_dedup - after_dedup} doublon(s) supprimé(s).")

        # 🔍 DÉTECTION DES VALEURS ABERRANTES
        print("\n⚠️ Détection des valeurs aberrantes...")
        if "TotalCases" in df.columns:
            outliers = df[df["TotalCases"] > df["TotalCases"].quantile(0.99)]
            print(f"🔍 {len(outliers)} valeurs aberrantes détectées.")
        else:
            print("⚠️ Attention : La colonne 'TotalCases' est absente, impossible de détecter les valeurs aberrantes.")

        # ✅ VALIDATION DES DONNÉES : Création de colonnes calculées
        df["TrueConfirmed"] = df["TotalDeaths"] + df["TotalRecovered"] + df["ActiveCases"]
        df["Anomaly"] = df["TotalCases"] != df["TrueConfirmed"]

        # ✅ Vérification des anomalies restantes
        anomalies = df[df["Anomaly"]]
        if not anomalies.empty:
            print("\n⚠️ Anomalies détectées :")
            print(anomalies[["TotalCases", "TotalDeaths", "TotalRecovered", "ActiveCases", "TrueConfirmed"]])
        else:
            print("✅ Aucune anomalie détectée.")

        # 🔥 MATRICE DE CORRÉLATION
        print("\n📊 Analyse visuelle : Matrice de corrélation")
        numeric_df = df.select_dtypes(include=["number"])
        if not numeric_df.empty:
            plt.figure(figsize=(10, 8))
            sns.heatmap(numeric_df.corr(), annot=True, cmap="Blues")
            plt.title("Matrice de corrélation")
            plt.show()
        else:
            print("⚠️ Aucune donnée numérique disponible pour afficher une matrice de corrélation.")

        # 🚀 CHARGEMENT DES DONNÉES FINALES
        os.makedirs(os.path.dirname(output_file), exist_ok=True)  # Vérifier que le dossier existe
        df.to_csv(output_file, index=False)
        print(f"✅ Données nettoyées sauvegardées dans {output_file}")

        return df

    except FileNotFoundError:
        print(f"❌ Erreur : Fichier {csv_file} introuvable !")
    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")

# 🏁 Exécution du pipeline ETL
cleaned_df = etl_process("./CSV/covid_19_clean_complete.csv")
