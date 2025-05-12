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