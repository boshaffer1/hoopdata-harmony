-- Create basic tables for the basketball database

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    league TEXT,
    city TEXT,
    mascot TEXT,
    coach TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Players table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    team TEXT,
    position TEXT,
    number INTEGER,
    height TEXT,
    weight INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- NBA roster table
CREATE TABLE IF NOT EXISTS public."NBA roster" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    team TEXT,
    position TEXT,
    number INTEGER,
    height TEXT,
    weight INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Video files table
CREATE TABLE IF NOT EXISTS public.video_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    filename TEXT,
    duration FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Clips table
CREATE TABLE IF NOT EXISTS public.clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES public.video_files(id),
    video_url TEXT,
    clip_path TEXT,
    start_time FLOAT,
    end_time FLOAT,
    play_name TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- NBA player box scores table
CREATE TABLE IF NOT EXISTS public.nba_player_box_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    game_date DATE,
    team TEXT,
    opponent TEXT,
    points INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    three_pointers_made INTEGER DEFAULT 0,
    three_pointers_attempted INTEGER DEFAULT 0,
    free_throws_made INTEGER DEFAULT 0,
    free_throws_attempted INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- NBA schedules table
CREATE TABLE IF NOT EXISTS public.nba_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_date DATE,
    home_team TEXT,
    away_team TEXT,
    venue TEXT,
    time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert some sample data
INSERT INTO public.teams (name, league, city, mascot, coach)
VALUES
    ('Lakers', 'NBA', 'Los Angeles', 'Lakers', 'Darvin Ham'),
    ('Warriors', 'NBA', 'Golden State', 'Warriors', 'Steve Kerr'),
    ('Celtics', 'NBA', 'Boston', 'Celtics', 'Joe Mazzulla'),
    ('Bucks', 'NBA', 'Milwaukee', 'Bucks', 'Doc Rivers');

INSERT INTO public.players (name, team, position, number, height, weight)
VALUES
    ('LeBron James', 'Lakers', 'SF', 23, '6''9"', 250),
    ('Anthony Davis', 'Lakers', 'PF', 3, '6''10"', 253),
    ('Stephen Curry', 'Warriors', 'PG', 30, '6''2"', 185),
    ('Jayson Tatum', 'Celtics', 'SF', 0, '6''8"', 210),
    ('Giannis Antetokounmpo', 'Bucks', 'PF', 34, '7''0"', 243);

INSERT INTO public."NBA roster" (name, team, position, number, height, weight)
VALUES
    ('LeBron James', 'Los Angeles Lakers', 'SF', 23, '6''9"', 250),
    ('Anthony Davis', 'Los Angeles Lakers', 'PF', 3, '6''10"', 253),
    ('Stephen Curry', 'Golden State Warriors', 'PG', 30, '6''2"', 185),
    ('Jayson Tatum', 'Boston Celtics', 'SF', 0, '6''8"', 210),
    ('Giannis Antetokounmpo', 'Milwaukee Bucks', 'PF', 34, '7''0"', 243);

INSERT INTO public.nba_player_box_scores (player_name, game_date, team, opponent, points, rebounds, assists)
VALUES
    ('LeBron James', '2023-12-01', 'Lakers', 'Warriors', 28, 10, 11),
    ('Stephen Curry', '2023-12-01', 'Warriors', 'Lakers', 32, 5, 8),
    ('Jayson Tatum', '2023-12-02', 'Celtics', 'Bucks', 24, 8, 5),
    ('Giannis Antetokounmpo', '2023-12-02', 'Bucks', 'Celtics', 31, 14, 7);

-- Create row level security policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NBA roster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nba_player_box_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nba_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies to allow read access
CREATE POLICY "Allow read access for all users" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON public."NBA roster" FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON public.video_files FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON public.clips FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON public.nba_player_box_scores FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON public.nba_schedules FOR SELECT USING (true); 