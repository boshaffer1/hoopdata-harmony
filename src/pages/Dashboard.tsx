
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import Section from "@/components/layout/Section";
import FileUploader from "@/components/data/FileUploader";
import DataTable from "@/components/data/DataTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, LineChart, PieChart, ArrowUp, ArrowDown, Users, Clock } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  
  const handleFileLoaded = (loadedData: any) => {
    setData(loadedData);
    console.log("Data loaded:", loadedData);
  };

  return (
    <Layout className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Upload, analyze, and visualize your basketball data
        </p>
      </div>
      
      {/* Dashboard Overview Cards */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <Card className="animate-hover">
            <CardHeader className="pb-2">
              <CardDescription>Total Games</CardDescription>
              <CardTitle className="text-2xl flex justify-between items-center">
                24 <Users className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">12%</span> from last month
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-hover">
            <CardHeader className="pb-2">
              <CardDescription>Points Per Game</CardDescription>
              <CardTitle className="text-2xl flex justify-between items-center">
                82.5 <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">5.2%</span> improvement
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-hover">
            <CardHeader className="pb-2">
              <CardDescription>Shooting Percentage</CardDescription>
              <CardTitle className="text-2xl flex justify-between items-center">
                46.8% <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center">
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" /> 
                <span className="text-red-500 font-medium">2.1%</span> decrease
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-hover">
            <CardHeader className="pb-2">
              <CardDescription>Avg. Game Duration</CardDescription>
              <CardTitle className="text-2xl flex justify-between items-center">
                105 min <Clock className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="h-3 w-3 text-amber-500 mr-1" /> 
                <span className="text-amber-500 font-medium">3.5%</span> increase
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="data-upload" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="data-upload">Data Upload</TabsTrigger>
          <TabsTrigger value="data-table" disabled={data.length === 0}>Data Table</TabsTrigger>
          <TabsTrigger value="analytics" disabled={data.length === 0}>Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-upload" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Import Game Data</CardTitle>
              <CardDescription>
                Upload your CSV files containing game data, player statistics, or event timestamps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader 
                onFileLoaded={handleFileLoaded} 
                allowedFileTypes={[".csv"]}
                maxSizeMB={20}
              />
            </CardContent>
          </Card>
          
          {data.length > 0 && (
            <div className="mt-8 animate-slide-up">
              <Card>
                <CardHeader>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>
                    Showing a preview of your imported data. Switch to the Data Table tab for full view.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable data={data.slice(0, 5)} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="data-table" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>
                View, filter, and export your imported data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={data} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Data Analytics</CardTitle>
              <CardDescription>
                Visual representation of your basketball data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LineChart className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Analytics visualizations will be displayed here. This feature is coming soon.
                </p>
                <Progress value={70} className="max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Dashboard;
