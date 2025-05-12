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