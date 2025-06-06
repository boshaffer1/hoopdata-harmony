export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Clips: {
        Row: {
          clip_path: string | null
          created_at: string | null
          end_time: number
          id: string
          play_name: string
          start_time: number
          tags: string[] | null
          video_id: string
          video_url: string | null
        }
        Insert: {
          clip_path?: string | null
          created_at?: string | null
          end_time: number
          id?: string
          play_name: string
          start_time: number
          tags?: string[] | null
          video_id: string
          video_url?: string | null
        }
        Update: {
          clip_path?: string | null
          created_at?: string | null
          end_time?: number
          id?: string
          play_name?: string
          start_time?: number
          tags?: string[] | null
          video_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      Csv_Data: {
        Row: {
          created_at: string
          data: Json
          filename: string
          id: string
          updated_at: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          filename: string
          id?: string
          updated_at?: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          filename?: string
          id?: string
          updated_at?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csv_data_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_files"
            referencedColumns: ["id"]
          },
        ]
      }
      "NBA Roster": {
        Row: {
          height: string | null
          id: number
          league: string | null
          name: string
          number: number | null
          position: string | null
          team_id: number | null
          weight: number | null
        }
        Insert: {
          height?: string | null
          id?: number
          league?: string | null
          name: string
          number?: number | null
          position?: string | null
          team_id?: number | null
          weight?: number | null
        }
        Update: {
          height?: string | null
          id?: number
          league?: string | null
          name?: string
          number?: number | null
          position?: string | null
          team_id?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "NBA roster_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "Teams"
            referencedColumns: ["id"]
          },
        ]
      }
      nba_player_box_scores: {
        Row: {
          assists: number | null
          blocks: number | null
          game_date: string | null
          id: number
          minutes: number | null
          player_name: string | null
          points: number | null
          rebounds: number | null
          steals: number | null
          team: string | null
          TO: number | null
        }
        Insert: {
          assists?: number | null
          blocks?: number | null
          game_date?: string | null
          id?: number
          minutes?: number | null
          player_name?: string | null
          points?: number | null
          rebounds?: number | null
          steals?: number | null
          team?: string | null
          TO?: number | null
        }
        Update: {
          assists?: number | null
          blocks?: number | null
          game_date?: string | null
          id?: number
          minutes?: number | null
          player_name?: string | null
          points?: number | null
          rebounds?: number | null
          steals?: number | null
          team?: string | null
          TO?: number | null
        }
        Relationships: []
      }
      nba_schedules: {
        Row: {
          away_team: string | null
          away_team_score: number | null
          date: string | null
          game_id: number | null
          home_team: string | null
          home_team_score: number | null
          team: string | null
          team_id: number | null
        }
        Insert: {
          away_team?: string | null
          away_team_score?: number | null
          date?: string | null
          game_id?: number | null
          home_team?: string | null
          home_team_score?: number | null
          team?: string | null
          team_id?: number | null
        }
        Update: {
          away_team?: string | null
          away_team_score?: number | null
          date?: string | null
          game_id?: number | null
          home_team?: string | null
          home_team_score?: number | null
          team?: string | null
          team_id?: number | null
        }
        Relationships: []
      }
      nba_teams: {
        Row: {
          abbreviation: string | null
          conference: string | null
          id: number
          league: string | null
          location: string | null
          name: string
        }
        Insert: {
          abbreviation?: string | null
          conference?: string | null
          id: number
          league?: string | null
          location?: string | null
          name: string
        }
        Update: {
          abbreviation?: string | null
          conference?: string | null
          id?: number
          league?: string | null
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      "NCAA D1 teams": {
        Row: {
          abbreviation: string | null
          conference: string | null
          id: number
          league: string | null
          location: string | null
          name: string
        }
        Insert: {
          abbreviation?: string | null
          conference?: string | null
          id: number
          league?: string | null
          location?: string | null
          name: string
        }
        Update: {
          abbreviation?: string | null
          conference?: string | null
          id?: number
          league?: string | null
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      Organizations: {
        Row: {
          created_at: string
          id: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Players: {
        Row: {
          height: string | null
          id: number
          league: string | null
          name: string
          number: number | null
          position: string | null
          team_id: number | null
          weight: number | null
          year: string | null
        }
        Insert: {
          height?: string | null
          id?: number
          league?: string | null
          name: string
          number?: number | null
          position?: string | null
          team_id?: number | null
          weight?: number | null
          year?: string | null
        }
        Update: {
          height?: string | null
          id?: number
          league?: string | null
          name?: string
          number?: number | null
          position?: string | null
          team_id?: number | null
          weight?: number | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_duplicate_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "Teams"
            referencedColumns: ["id"]
          },
        ]
      }
      "players test": {
        Row: {
          height: string | null
          id: number
          league: string | null
          name: string
          number: number | null
          position: string | null
          team_id: number | null
          weight: number | null
        }
        Insert: {
          height?: string | null
          id?: number
          league?: string | null
          name: string
          number?: number | null
          position?: string | null
          team_id?: number | null
          weight?: number | null
        }
        Update: {
          height?: string | null
          id?: number
          league?: string | null
          name?: string
          number?: number | null
          position?: string | null
          team_id?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "Teams"
            referencedColumns: ["id"]
          },
        ]
      }
      Profiles: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      Teams: {
        Row: {
          abbreviation: string | null
          conference: string | null
          id: number
          league: string
          location: string | null
          name: string
        }
        Insert: {
          abbreviation?: string | null
          conference?: string | null
          id?: number
          league: string
          location?: string | null
          name: string
        }
        Update: {
          abbreviation?: string | null
          conference?: string | null
          id?: number
          league?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "Video upload": {
        Row: {
          away_team: string | null
          created_at: string
          file_name: string | null
          game_date: string | null
          home_team: string | null
          id: number
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          away_team?: string | null
          created_at?: string
          file_name?: string | null
          game_date?: string | null
          home_team?: string | null
          id?: number
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          away_team?: string | null
          created_at?: string
          file_name?: string | null
          game_date?: string | null
          home_team?: string | null
          id?: number
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      video_files: {
        Row: {
          away_team_id: string | null
          content_type: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          filename: string
          game_date: string | null
          id: string
          team_id: string | null
          title: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          away_team_id?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          game_date?: string | null
          id?: string
          team_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          away_team_id?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          game_date?: string | null
          id?: string
          team_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      video_tags: {
        Row: {
          created_at: string
          id: number
          tag_name: string
          tag_value: string | null
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          tag_name: string
          tag_value?: string | null
          video_id: string
        }
        Update: {
          created_at?: string
          id?: never
          tag_name?: string
          tag_value?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_tags_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_files"
            referencedColumns: ["id"]
          },
        ]
      }
      "WNBA Roster": {
        Row: {
          height: string | null
          id: number
          league: string | null
          name: string
          number: number | null
          position: string | null
          team_id: number | null
          weight: number | null
        }
        Insert: {
          height?: string | null
          id?: number
          league?: string | null
          name: string
          number?: number | null
          position?: string | null
          team_id?: number | null
          weight?: number | null
        }
        Update: {
          height?: string | null
          id?: number
          league?: string | null
          name?: string
          number?: number | null
          position?: string | null
          team_id?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "WNBA roster_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "Teams"
            referencedColumns: ["id"]
          },
        ]
      }
      "WNBA Teams": {
        Row: {
          abbreviation: string | null
          conference: string | null
          id: number
          league: string | null
          location: string | null
          name: string
        }
        Insert: {
          abbreviation?: string | null
          conference?: string | null
          id: number
          league?: string | null
          location?: string | null
          name: string
        }
        Update: {
          abbreviation?: string | null
          conference?: string | null
          id?: number
          league?: string | null
          location?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_query: {
        Args: { query_text: string }
        Returns: Json
      }
      get_table_schema: {
        Args: { table_name: string }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: boolean
          column_default: string
        }[]
      }
      list_schemas: {
        Args: Record<PropertyKey, never>
        Returns: {
          schema_name: string
        }[]
      }
      list_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      send_to_webhook: {
        Args: { data: Json }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
