import sqlite3

DB_PATH = "ai_api.db"

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table});")
    cols = [row[1] for row in cursor.fetchall()]
    return column in cols

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    if not column_exists(cur, "users", "created_at"):
        print("➡️ Ajout de la colonne users.created_at ...")
        cur.execute("ALTER TABLE users ADD COLUMN created_at DATETIME;")
        conn.commit()
        print("✅ Colonne ajoutée.")
    else:
        print("✅ La colonne created_at existe déjà.")

    # Remplir les valeurs null si nécessaire
    cur.execute("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;")
    conn.commit()
    print("✅ created_at rempli pour les lignes existantes.")

    conn.close()

if __name__ == "__main__":
    main()
