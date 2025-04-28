from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
import seaborn as sns
import missingno as mno
import matplotlib.pyplot as plt
import os

def etl_process(csv_file, output_dir="./CSV"):
    try:
        df = pd.read_csv(csv_file, encoding='ISO-8859-1')
        print(f"Fichier {csv_file} chargé avec succès !")

        # Vérifier les noms des colonnes et les corriger si nécessaire
        print("Noms des colonnes dans le fichier CSV avant correction :")
        print(list(df.columns))

        if "Lat" in df.columns and "Long" in df.columns:
            df.drop(columns=["Lat", "Long"], inplace=True)
            print("Suppression des colonnes 'Lat' et 'Long' effectuée.")
        else:
            print("Attention : Les colonnes 'Lat' et 'Long' n'existent pas dans le fichier CSV.")

        # Aperçu des 10 premières et 10 dernières lignes
        print("Aperçu des 10 premières lignes des données :")
        print(df.head(10))

        print("Aperçu des 10 dernières lignes des données :")
        print(df.tail(10))

        # Description statistique
        print("\n🔍 Description statistique :")
        print(df.describe())

        # GESTION DES DONNÉES MANQUANTES
        print("Gestion des valeurs manquantes...")

        # Calcul du nombre et du pourcentage de valeurs manquantes avant traitement
        missing_before = df.isnull().sum()
        missing_percent = (df.isnull().sum() * 100 / len(df)).round(2)  # Pourcentage arrondi à 2 décimales

        # Affichage détaillé des valeurs manquantes
        missing_data = pd.DataFrame({"Valeurs Manquantes": missing_before, "Pourcentage (%)": missing_percent})
        print("Détails des valeurs manquantes AVANT traitement :")
        print(missing_data[missing_data["Valeurs Manquantes"] > 0])  # On n'affiche que les colonnes ayant des valeurs manquantes

        # Visualisation des valeurs manquantes AVANT traitement
        print("Visualisation des valeurs manquantes AVANT traitement...")
        mno.matrix(df, figsize=(12, 6))
        plt.title("Visualisation des valeurs manquantes AVANT traitement")
        plt.show()

        # Gestion des valeurs manquantes
        df.fillna(0, inplace=True)

        # Vérification et recalcul correct de Active
        if all(col in df.columns for col in ["Confirmed", "Deaths", "Recovered"]):
            df["Active"] = df["Confirmed"] - df["Deaths"] - df["Recovered"]
            print("Recalcul de 'Active' effectué avec succès.")
        else:
            print("\Attention : Certaines colonnes nécessaires au recalcul de 'Active' sont absentes.")

        # Gestion des doublons
        print("Suppression des doublons...")
        before_dedup = df.shape[0]
        df.drop_duplicates(inplace=True)
        after_dedup = df.shape[0]
        print(f" {before_dedup - after_dedup} doublon(s) supprimé(s).")

        # Vérification des valeurs manquantes après traitement
        print("Visualisation des valeurs manquantes APRÈS traitement...")
        mno.matrix(df, figsize=(12, 6))
        plt.title("Visualisation des valeurs manquantes APRÈS traitement")
        plt.show()

        # ✅ Détection des valeurs aberrantes
        print(" Détection des valeurs aberrantes...")
        if "Confirmed" in df.columns:
            outliers = df[df["Confirmed"] > df["Confirmed"].quantile(0.99)]
            print(f"⚠️ {len(outliers)} valeurs aberrantes détectées.")

            #Affichage des valeurs aberrantes détectées (optionnel)
            if not outliers.empty:
                print("Aperçu des valeurs aberrantes détectées :")
                print(outliers[["Country/Region", "Confirmed", "Deaths", "Recovered", "Active"]].head(10))  # Affiche 10 valeurs aberrantes
        else:
            print("Attention : La colonne 'Confirmed' est absente, impossible de détecter les valeurs aberrantes.")

        # Validation des données (vérification des anomalies)
        print("\ Validation des données : Vérification de la cohérence")
        if all(col in df.columns for col in ["Confirmed", "Deaths", "Recovered", "Active"]):
            df["TrueConfirmed"] = df["Deaths"] + df["Recovered"] + df["Active"]
            df["Anomaly"] = df["Confirmed"] != df["TrueConfirmed"]

            anomalies = df[df["Anomaly"]]
            if not anomalies.empty:
                print("Anomalies détectées :")
                print(anomalies[["Confirmed", "Deaths", "Recovered", "Active", "TrueConfirmed"]])
            else:
                print("Aucune anomalie détectée.")
        else:
            print("ERREUR : Impossible de valider la cohérence des données, certaines colonnes sont absentes.")

        # Affichage de la matrice de corrélation AVANT le découpage
        print("Analyse visuelle : Matrice de corrélation")
        numeric_df = df.select_dtypes(include=["number"])
        if not numeric_df.empty:
            plt.figure(figsize=(10, 8))
            sns.heatmap(numeric_df.corr(), annot=True, cmap="Blues")
            plt.title("Matrice de corrélation")
            plt.show()
        else:
            print("Aucune donnée numérique disponible pour afficher une matrice de corrélation.")

        # ✅ Découpage Train-Test-Validation
        train, test, validation = split_data(df, output_dir)

        return train, test, validation

    except FileNotFoundError:
        print(f"❌ Erreur : Fichier {csv_file} introuvable !")
        return None, None, None  # Evite un crash en cas de fichier manquant

    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")
        return None, None, None  # Evite un crash si une erreur se produit



def split_data(df, output_dir="./CSV"):
    """
    Sépare les données en ensembles d'entraînement, test et validation.
    Effectue des vérifications sur la taille et l'unicité des données.
    Enregistre chaque ensemble sous forme de fichier CSV.
    """
    # Découpage Train-Test-Validation
    train, temp = train_test_split(df, test_size=0.3, random_state=42)
    test, validation = train_test_split(temp, test_size=0.33, random_state=42)  # 20% test, 10% validation

    #  Affichage des dimensions des datasets
    print("Dimensions des ensembles :")
    print(f"Train : {train.shape}, Test : {test.shape}, Validation : {validation.shape}")

    #  Validation des proportions et des doublons
    validate_splits(train, test, validation)

    # Sauvegarde des fichiers
    os.makedirs(output_dir, exist_ok=True)
    train.to_csv(f"{output_dir}/train.csv", index=False)
    test.to_csv(f"{output_dir}/test.csv", index=False)
    validation.to_csv(f"{output_dir}/validation.csv", index=False)

    print(f"Données divisées et sauvegardées dans {output_dir} (Train: {len(train)}, Test: {len(test)}, Validation: {len(validation)})")

    return train, test, validation



def validate_splits(train, test, validation):
    """
    Vérifie la répartition et l'unicité des ensembles Train-Test-Validation.
    """
    print("Vérification des proportions :")
    total_size = len(train) + len(test) + len(validation)
    
    print(f"Taille totale des données : {total_size}")
    print(f"Taille Train : {len(train)} ({round(len(train) / total_size * 100, 2)}%)")
    print(f"Taille Test : {len(test)} ({round(len(test) / total_size * 100, 2)}%)")
    print(f"Taille Validation : {len(validation)} ({round(len(validation) / total_size * 100, 2)}%)")



# 🏁 Exécution du pipeline ETL
cleaned_df = etl_process("./CSV/covid_19_clean_complete.csv")
