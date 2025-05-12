import { supabase } from "@/integrations/supabase/client";

/**
 * Function to query any table in the Supabase database
 * 
 * @param tableName The name of the table to query
 * @param columns The columns to select, defaults to all columns
 * @param limit The maximum number of rows to return
 * @param filter Optional filter conditions in the format { column: value }
 * @returns The query result with data and any error information
 */
export async function queryTable(
  tableName: string,
  columns: string = '*',
  limit: number = 100,
  filter?: Record<string, any>
) {
  try {
    // Using any type to bypass type checking for dynamic table names
    let query = (supabase.from(tableName as any) as any)
      .select(columns)
      .limit(limit);

    // Apply filters if provided
    if (filter) {
      Object.entries(filter).forEach(([column, value]) => {
        if (query && typeof query.eq === 'function') {
          query = query.eq(column, value);
        }
      });
    }

    const { data, error } = await query;
    return { data, error, tableName };
  } catch (error: any) {
    console.error(`Error querying table ${tableName}:`, error);
    return { 
      data: null, 
      error: { message: `Failed to query ${tableName}: ${error.message}` }, 
      tableName 
    };
  }
}

/**
 * Function to list all available tables in the database
 * 
 * @returns The list of table names in the database
 */
export async function listTables() {
  try {
    // Try the RPC method first
    const { data, error } = await (supabase.rpc as any)('list_tables');

    if (error) {
      console.error("Error listing tables via RPC:", error);
      // Fallback to direct query if RPC fails - this requires admin privileges
      return {
        tables: [
          'teams',
          'players',
          'NBA roster',
          'WNBA roster',
          'video_files',
          'clips',
          'nba_player_box_scores',
          'nba_schedules'
        ],
        error: { message: `Failed to list tables via RPC` }
      };
    }

    return { 
      tables: Array.isArray(data) 
        ? data.map((item: any) => {
            if (typeof item === 'object' && item !== null && 'table_name' in item) {
              return item.table_name;
            }
            return item;
          })
        : [], 
      error: null 
    };
  } catch (error: any) {
    console.error("Error in listTables:", error);
    // Return a fallback list of known tables
    return {
      tables: [
        'teams',
        'players',
        'NBA roster',
        'WNBA roster',
        'video_files',
        'clips',
        'nba_player_box_scores',
        'nba_schedules'
      ],
      error: { message: `Exception in listTables: ${error.message}` }
    };
  }
}

/**
 * Get information about the schema of a specific table
 * 
 * @param tableName The name of the table to get schema information for
 * @returns Table schema information including columns and data types
 */
export async function getTableSchema(tableName: string) {
  try {
    // Try the RPC method first
    const { data, error } = await (supabase.rpc as any)('get_table_schema', { 
      table_name: tableName 
    });

    if (error) {
      console.error(`Error getting schema for ${tableName} via RPC:`, error);
      return { 
        schema: null, 
        error: { message: `Failed to get schema for ${tableName}: ${error.message}` } 
      };
    }

    return { schema: data, error: null };
  } catch (error: any) {
    console.error(`Error in getTableSchema for ${tableName}:`, error);
    return { 
      schema: null, 
      error: { message: `Exception in getTableSchema for ${tableName}: ${error.message}` } 
    };
  }
}

/**
 * Execute a custom SQL query - USE WITH CAUTION
 * This should be restricted to admin users or disabled in production
 * 
 * @param query The SQL query to execute
 * @returns The query results
 */
export async function executeQuery(query: string) {
  try {
    // Safety validation on the client side as well
    if (query.match(/drop|alter|create|update|delete|truncate|insert/i)) {
      return { 
        data: null, 
        error: { message: 'Query contains unsafe operations' } 
      };
    }

    if (!query.match(/^select\s/i)) {
      return { 
        data: null, 
        error: { message: 'Only SELECT queries are allowed for security reasons' } 
      };
    }

    const { data, error } = await (supabase.rpc as any)('execute_query', { 
      query_text: query 
    });

    if (error) {
      console.error("Error executing query via RPC:", error);
      return { 
        data: null, 
        error: { message: `Failed to execute query: ${error.message}` } 
      };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Error executing custom query:", error);
    return { 
      data: null, 
      error: { message: `Exception in executeQuery: ${error.message}` } 
    };
  }
}

/**
 * Helper function to get a list of all databases
 * In Supabase, this is actually returning schemas within the PostgreSQL database
 * 
 * @returns List of available databases/schemas
 */
export async function listDatabases() {
  try {
    const { data, error } = await (supabase.rpc as any)('list_schemas');
    
    if (error) {
      console.error("Error listing schemas via RPC:", error);
      return { 
        databases: ['public'], 
        error: { message: `Failed to list schemas: ${error.message}` }
      };
    }
    
    return { 
      databases: Array.isArray(data) 
        ? data.map((item: any) => {
            if (typeof item === 'object' && item !== null && 'schema_name' in item) {
              return item.schema_name;
            }
            return item;
          })
        : ['public'], 
      error: null 
    };
  } catch (error: any) {
    console.error("Error listing databases:", error);
    return { 
      databases: ['public'], 
      error: { message: `Exception in listDatabases: ${error.message}` } 
    };
  }
} 