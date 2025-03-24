
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRoster } from "@/hooks/analyzer/use-roster";
import { PlayerStats } from "@/components/myteam/PlayerStats";
import { Button } from "@/components/ui/button";
import { PlayerProfile } from "@/components/myteam/PlayerProfile";
import { ArrowLeft, BarChart2, Edit, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceTrends } from "@/components/myteam/PerformanceTrends";
import { GameLog } from "@/components/myteam/GameLog";
import { PlayerNotes } from "@/components/myteam/PlayerNotes";
import { toast } from "sonner";

const PlayerDetail = () => {
  const { teamId, playerId } = useParams();
  const navigate = useNavigate();
  const { rosters } = useRoster();
  const [team, setTeam] = useState(null);
  const [player, setPlayer] = useState(null);
  
  useEffect(() => {
    if (teamId && playerId && rosters.length > 0) {
      const foundTeam = rosters.find(team => team.id === teamId);
      if (foundTeam) {
        setTeam(foundTeam);
        const foundPlayer = foundTeam.players.find(player => player.id === playerId);
        if (foundPlayer) {
          setPlayer(foundPlayer);
        } else {
          navigate("/myteam");
          toast.error("Player not found");
        }
      } else {
        navigate("/myteam");
        toast.error("Team not found");
      }
    }
  }, [teamId, playerId, rosters, navigate]);
  
  if (!team || !player) {
    return (
      <Layout className="py-6">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/myteam">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-display font-bold">Loading player...</h1>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout className="py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/myteam">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold">{player.name}</h1>
            <span className="text-muted-foreground">
              #{player.number} • {player.position}
            </span>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Link to="/myteam" className="hover:underline">My Team</Link> &gt; {team.name}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            Sync Stats
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Player Profile */}
        <div className="lg:col-span-1">
          <PlayerProfile player={player} team={team} />
        </div>
        
        {/* Player Stats & Data */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="statistics">
            <TabsList className="mb-6">
              <TabsTrigger value="statistics" className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="gamelog" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                Game Log
              </TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="statistics" className="space-y-8">
              <PlayerStats player={player} />
              <PerformanceTrends player={player} />
            </TabsContent>
            
            <TabsContent value="gamelog">
              <GameLog player={player} />
            </TabsContent>
            
            <TabsContent value="notes">
              <PlayerNotes player={player} teamId={teamId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerDetail;
