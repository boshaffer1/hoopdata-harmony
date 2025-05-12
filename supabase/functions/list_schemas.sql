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