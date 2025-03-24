
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-2">Team Not Found</h1>
      <p className="text-muted-foreground mb-6">
        Could not find scouting report for the requested team.
      </p>
      <Button asChild>
        <Link to="/scouting">Back to Scouting</Link>
      </Button>
    </div>
  );
}
