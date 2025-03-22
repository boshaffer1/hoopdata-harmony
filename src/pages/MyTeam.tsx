
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useRoster } from "@/hooks/analyzer/use-roster";
import TeamRosterList from "@/components/analyzer/teams/TeamRosterList";
import { TeamStats } from "@/components/myteam/TeamStats";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus } from "lucide-react";

const MyTeam = () => {
  const { rosters, addTeam, removeTeam, addPlayer, removePlayer } = useRoster();
  
  return (
    <Layout className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">My Team</h1>
        <p className="text-muted-foreground">
          Manage your team rosters and view player statistics
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Rosters</h2>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Team
            </Button>
          </div>
          
          {rosters.length > 0 ? (
            <TeamRosterList 
              rosters={rosters}
              onRemoveTeam={removeTeam}
              onRemovePlayer={removePlayer}
              renderPlayerActions={(teamId, player) => (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link to={`/myteam/player/${teamId}/${player.id}`}>View Stats</Link>
                </Button>
              )}
            />
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">No teams added yet</p>
              <Button 
                variant="default" 
                size="sm" 
                className="mx-auto flex items-center gap-1"
                onClick={() => addTeam("My Team")}
              >
                <UserPlus className="h-4 w-4" />
                Create Team
              </Button>
            </div>
          )}
        </div>
        
        {/* Team Stats Overview */}
        <div className="lg:col-span-2">
          {rosters.length > 0 ? (
            <TeamStats rosters={rosters} />
          ) : (
            <div className="border rounded-lg p-12 text-center h-full flex flex-col justify-center">
              <h3 className="text-lg font-medium mb-2">No Team Data Available</h3>
              <p className="text-muted-foreground mb-6">
                Add a team and players to see statistics and analytics
              </p>
              <img 
                src="/lovable-uploads/2c47eeaf-a948-4b06-ae8d-5403afa03211.png" 
                alt="Team stats example"
                className="max-w-md mx-auto opacity-50 rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyTeam;
