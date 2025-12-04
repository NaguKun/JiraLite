from supabase import create_client, Client
from src.config import settings

supabase: Client = None

def init_supabase():
    global supabase
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return supabase

def get_supabase() -> Client:
    if supabase is None:
        return init_supabase()
    return supabase

def get_supabase_admin() -> Client:
    """Get Supabase client with service role key for admin operations"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
