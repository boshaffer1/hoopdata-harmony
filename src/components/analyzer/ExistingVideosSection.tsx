import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Upload, FileText, Film, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface VideoFile {
  id: string;
  filename: string;
  title: string | null;
  description: string | null;
  created_at: string;
  file_path: string;
  content_type: string | null;
}

interface CSVData {
  id: string;
  filename: string;
  created_at: string;
  data: any;
  video_id: string | null;
}

interface ExistingVideosSectionProps {
  onVideoSelect: (url: string) => void;
  onCsvDataSelect: (data: any) => void;
}

const ExistingVideosSection: React.FC<ExistingVideosSectionProps> = ({
  onVideoSelect,
  onCsvDataSelect
}) => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [csvFiles, setCsvFiles] = useState<CSVData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'csv'>('videos');
  const { user } = useAuth();

  const fetchVideos = async () => {
    if (!user) {
      setVideos([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCsvData = async () => {
    if (!user) {
      setCsvFiles([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('csv_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setCsvFiles(data || []);
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      toast.error('Failed to load CSV files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVideos();
      fetchCsvData();
    }
  }, [user]);

  const handleSelectVideo = async (video: VideoFile) => {
    if (!user) {
      toast.error('Please log in to access videos');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(video.file_path, 3600);
      
      if (error) {
        throw error;
      }
      
      if (data && data.signedUrl) {
        onVideoSelect(data.signedUrl);
        toast.success(`Loaded video: ${video.filename}`);
      }
    } catch (error) {
      console.error('Error getting video URL:', error);
      toast.error('Failed to load video');
    }
  };

  const handleSelectCsv = (csvData: CSVData) => {
    if (!user) {
      toast.error('Please log in to access CSV data');
      return;
    }

    if (csvData.data) {
      onCsvDataSelect(csvData.data);
      toast.success(`Loaded CSV data: ${csvData.filename}`);
    } else {
      toast.error('CSV data is empty or invalid');
    }
  };

  const handleRefresh = () => {
    if (user) {
      activeTab === 'videos' ? fetchVideos() : fetchCsvData();
      toast.info('Refreshing data from server');
    } else {
      toast.error('Please log in to refresh data');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Existing Files</CardTitle>
          <CardDescription>
            Your previously uploaded videos and data files
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex border-b mb-4">
          <Button
            variant={activeTab === 'videos' ? 'default' : 'ghost'}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === 'videos' ? 'active' : 'inactive'}
            onClick={() => setActiveTab('videos')}
          >
            <Film className="h-4 w-4 mr-2" />
            Game Videos ({videos.length})
          </Button>
          <Button
            variant={activeTab === 'csv' ? 'default' : 'ghost'}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === 'csv' ? 'active' : 'inactive'}
            onClick={() => setActiveTab('csv')}
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV Data ({csvFiles.length})
          </Button>
        </div>

        {activeTab === 'videos' && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      {loading ? 'Loading videos...' : 'No videos found. Upload your first game video!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell className="font-medium">{video.filename}</TableCell>
                      <TableCell>{video.title || '-'}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectVideo(video)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-4 w-4" />
                          Load
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Video ID</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      {loading ? 'Loading CSV files...' : 'No CSV data found. Upload your first data file!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  csvFiles.map((csv) => (
                    <TableRow key={csv.id}>
                      <TableCell className="font-medium">{csv.filename}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(csv.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>{csv.video_id || 'Not linked'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectCsv(csv)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          Load
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExistingVideosSection;
