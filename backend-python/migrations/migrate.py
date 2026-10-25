import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def run_migration():
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    database = os.getenv('DB_NAME', 'AI-Welfare-Copilot')
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD')

    print(f"Connecting to database '{database}' on {host}:{port} as '{user}'...")
    conn = psycopg2.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password
    )
    conn.autocommit = True
    cur = conn.cursor()

    migration_file = os.path.join(os.path.dirname(__file__), '001_add_email_verifications.sql')
    print(f"Reading migration file: {migration_file}")
    with open(migration_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    print("Applying migration...")
    cur.execute(sql)
    print("Migration SQL executed successfully.")

    # Verification queries
    cur.execute("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified';")
    col = cur.fetchone()
    print(f"Verified 'users.is_verified': {col}")

    cur.execute("SELECT count(*) FROM users WHERE is_verified = TRUE;")
    verified_count = cur.fetchone()[0]
    print(f"Total existing verified users: {verified_count}")

    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_name = 'email_verifications';")
    tbl = cur.fetchone()
    print(f"Verified 'email_verifications' table exists: {tbl is not None}")

    cur.close()
    conn.close()
    print("Migration completed successfully!")

if __name__ == '__main__':
    run_migration()
