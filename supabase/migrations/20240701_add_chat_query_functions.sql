-- Migration to add database query functions for the chat widget
-- This includes functions to list tables, get schema, list schemas, and execute queries

-- Function to list all tables in the database
CREATE OR REPLACE FUNCTION public.list_tables()
RETURNS TABLE (table_name text)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    information_schema.tables.table_name::text
  FROM 
    information_schema.tables
  WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE';
END;
$$ LANGUAGE plpgsql;

-- Function to get the schema of a table
CREATE OR REPLACE FUNCTION public.get_table_schema(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    columns.column_name::text,
    columns.data_type::text,
    (columns.is_nullable = 'YES')::boolean,
    columns.column_default::text
  FROM 
    information_schema.columns
  WHERE 
    columns.table_schema = 'public'
    AND columns.table_name = table_name;
END;
$$ LANGUAGE plpgsql;

-- Function to list all schemas
CREATE OR REPLACE FUNCTION public.list_schemas()
RETURNS TABLE (schema_name text)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nspname::text
  FROM 
    pg_catalog.pg_namespace
  WHERE 
    nspname NOT LIKE 'pg_%' AND
    nspname != 'information_schema';
END;
$$ LANGUAGE plpgsql;

-- Function to execute custom SQL queries (read-only for security)
CREATE OR REPLACE FUNCTION public.execute_query(query_text text)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Safety validation to prevent unsafe queries
  IF query_text ~* 'drop|alter|create|update|delete|truncate|insert' THEN
    RAISE EXCEPTION 'Query contains unsafe operations: %', query_text;
  END IF;

  -- Only allow SELECT statements for safety
  IF NOT (query_text ~* '^select\s') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed for security reasons: %', query_text;
  END IF;

  -- Execute the query and return results as JSON
  EXECUTE 'SELECT jsonb_agg(t) FROM (' || query_text || ') t' INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE);
END;
$$ LANGUAGE plpgsql; 