import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from config import Config

# Initialize connection pool
_db_pool = None

def get_pool():
    global _db_pool
    if _db_pool is None:
        _db_pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=20,
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
    return _db_pool

@contextmanager
def get_db_connection():
    """Context manager for acquiring a database connection from the pool."""
    pool = get_pool()
    conn = pool.getconn()
    try:
        yield conn
    finally:
        pool.putconn(conn)

@contextmanager
def get_db_cursor(commit=False):
    """
    Context manager for obtaining a database cursor with RealDictCursor.
    Automatically commits or rolls back if commit=True.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()

def query_one(sql, params=None):
    """Execute query and fetch a single dictionary record."""
    with get_db_cursor() as cur:
        cur.execute(sql, params or ())
        return cur.fetchone()

def query_all(sql, params=None):
    """Execute query and fetch all matching records as dictionaries."""
    with get_db_cursor() as cur:
        cur.execute(sql, params or ())
        return cur.fetchall()

def execute(sql, params=None, commit=True):
    """Execute a single query with commit."""
    with get_db_cursor(commit=commit) as cur:
        cur.execute(sql, params or ())
        return cur.rowcount
