import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, FileVideo, Database, FolderOpen, Settings, Server, Play } from "lucide-react";
import { toast } from "sonner";
import { testAllBuckets } from "@/utils/bucket-debug";
import { testDirectBucketByName, testSupabaseConfig } from "@/utils/direct-bucket-test";
import { testVideoAccess, testVideoSources } from "@/utils/test-video-access";

const SupabaseDebug = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [bucketFiles, setBucketFiles] = useState<any[]>([]);
  const [testVideoUrl, setTestVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [bucketTestResults, setBucketTestResults] = useState<any>(null);
  const [isBucketTesting, setIsBucketTesting] = useState(false);
  const [directBucketResults, setDirectBucketResults] = useState<any>(null);
  const [isDirectTesting, setIsDirectTesting] = useState(false);
  const [configInfo, setConfigInfo] = useState<any>(null);
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [videoAccessResult, setVideoAccessResult] = useState<any>(null);
  const [isTestingVideo, setIsTestingVideo] = useState(false);
  const [videoTestResults, setVideoTestResults] = useState<any>(null);

  // Function to test a direct video URL
  const testVideo = async (path: string) => {
    setIsLoadingVideo(true);
    try {
      const { data, error } = await supabase
        .storage
        .from('videos')
        .createSignedUrl(path, 3600);
        
      if (error) {
        console.error("Error creating signed URL:", error);
        toast.error("Failed to create signed URL");
        return;
      }
      
      if (data?.signedUrl) {
        setTestVideoUrl(data.signedUrl);
        toast.success("Video URL created successfully");
      } else {
        toast.error("No URL generated");
      }
    } catch (err) {
      console.error("Error in testVideo:", err);
      toast.error("Failed to test video");
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Function to test buckets directly by name
  const testDirectBucketAccess = async () => {
    setIsBucketTesting(true);
    try {
      const results = await testAllBuckets();
      setBucketTestResults(results);
      console.log("Bucket test results:", results);
      toast.success("Bucket tests complete");
    } catch (err) {
      console.error("Error testing buckets:", err);
      toast.error("Failed to test buckets");
    } finally {
      setIsBucketTesting(false);
    }
  };
  
  // Test direct access to buckets without using listBuckets
  const testDirectAccess = async () => {
    setIsDirectTesting(true);
    try {
      const buckets = ['videos', 'clips', 'thumbnails', 'csv_files', 'roster'];
      const results = {};
      
      for (const bucket of buckets) {
        const result = await testDirectBucketByName(bucket);
        results[bucket] = result;
      }
      
      setDirectBucketResults(results);
      toast.success("Direct bucket tests complete");
    } catch (err) {
      console.error("Error in direct testing:", err);
      toast.error("Failed to test buckets directly");
    } finally {
      setIsDirectTesting(false);
    }
  };
  
  // Test Supabase configuration
  const testConfig = async () => {
    setIsTestingConfig(true);
    try {
      const config = await testSupabaseConfig();
      setConfigInfo(config);
      console.log("Supabase configuration:", config);
      toast.success("Configuration test complete");
    } catch (err) {
      console.error("Error testing config:", err);
      toast.error("Failed to test configuration");
    } finally {
      setIsTestingConfig(false);
    }
  };

  // Test direct video access
  const testVideos = async () => {
    setIsTestingVideo(true);
    try {
      // First test basic video access
      const accessResult = await testVideoAccess();
      setVideoAccessResult(accessResult);
      
      // Then test video sources more thoroughly
      const sourceResults = await testVideoSources();
      setVideoTestResults(sourceResults);
      
      console.log("Video access results:", accessResult);
      console.log("Video sources results:", sourceResults);
      
      if (accessResult.success && accessResult.url) {
        setTestVideoUrl(accessResult.url);
        toast.success("Video access test successful!");
      } else {
        toast.error("Video access test failed");
      }
    } catch (err) {
      console.error("Error testing videos:", err);
      toast.error("Video test failed");
    } finally {
      setIsTestingVideo(false);
    }
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        setIsLoading(true);
        const allTests: any = { buckets: {}, tables: {} };
        
        // Test storage access
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();
        
        allTests.bucketsTest = bucketsError ? 'Failed' : 'Success';
        allTests.bucketsList = buckets || [];
        
        if (bucketsError) {
          console.error("Buckets test failed:", bucketsError);
          setError(`Storage access error: ${bucketsError.message}`);
        } else {
          // If buckets exist, check specific buckets we need
          const requiredBuckets = ['videos', 'clips', 'thumbnails'];
          const bucketNames = buckets?.map(b => b.name) || [];
          
          for (const bucketName of requiredBuckets) {
            const exists = bucketNames.includes(bucketName);
            allTests.buckets[bucketName] = {
              exists,
              files: []
            };
            
            if (exists) {
              try {
                // List files in bucket
                const { data: files, error: listError } = await supabase
                  .storage
                  .from(bucketName)
                  .list('', { limit: 10 });
                  
                allTests.buckets[bucketName].listTest = listError ? 'Failed' : 'Success';
                allTests.buckets[bucketName].files = files || [];
                
                if (bucketName === 'videos' && files && files.length > 0) {
                  setBucketFiles(files);
                }
              } catch (err) {
                console.error(`Error listing files in ${bucketName}:`, err);
              }
            }
          }
        }
        
        // Test database tables
        /*
        const requiredTables = ['clips', 'video_files'] as const;
        
        for (const tableName of requiredTables) {
          try {
            const { data, error: tableError } = await supabase
              .from(tableName)
              .select('count')
              .limit(1);
              
            allTests.tables[tableName] = {
              accessible: !tableError,
              error: tableError ? tableError.message : null,
              data
            };
            
            if (tableError) {
              console.error(`${tableName} table test failed:`, tableError);
              setError((prev) => 
                `${prev ? prev + '\n' : ''}${tableName} table error: ${tableError.message}`
              );
            }
          } catch (err) {
            console.error(`Error testing ${tableName} table:`, err);
          }
        }
        */
        
        // Check direct video access if we found files
        if (allTests.buckets.videos?.files?.length > 0) {
          const firstFile = allTests.buckets.videos.files[0];
          try {
            const { data, error: urlError } = await supabase
              .storage
              .from('videos')
              .createSignedUrl(firstFile.name, 3600);
              
            allTests.signedUrlTest = {
              success: !urlError,
              error: urlError ? urlError.message : null,
              url: data?.signedUrl || null
            };
            
            if (data?.signedUrl) {
              setTestVideoUrl(data.signedUrl);
            }
          } catch (err) {
            console.error("Error creating signed URL:", err);
          }
        }
        
        setTestResult(allTests);
      } catch (err: any) {
        console.error("Connection test error:", err);
        setError(`Connection test failed: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    testConnection();
  }, []);

  return (
    <Layout className="py-6">
      <h1 className="text-3xl font-display font-bold mb-6">Supabase Connection Debug</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Testing Supabase connection...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            <pre className="whitespace-pre-wrap mt-2 text-sm">
              {error}
            </pre>
            <Button 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {/* Debug Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={testDirectAccess}
                  disabled={isDirectTesting}
                  className="flex items-center gap-2"
                  variant="secondary"
                >
                  {isDirectTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Server className="h-4 w-4" />
                  )}
                  Test Bucket Access
                </Button>
                
                <Button 
                  onClick={testVideos}
                  disabled={isTestingVideo}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  {isTestingVideo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Test Video Access
                </Button>
                
                <Button 
                  onClick={testConfig}
                  disabled={isTestingConfig}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  {isTestingConfig ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                  Test Configuration
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Tests
                </Button>
                
                <a
                  href="https://app.supabase.com/project/_/storage/buckets"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Open Supabase Storage
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
          
          {/* Configuration Info */}
          {configInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Supabase Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium mb-2">Connection</h3>
                      <p className="text-sm mb-1">
                        <span className="font-medium">URL:</span> {configInfo.url}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Anon Key:</span> {configInfo.hasAnonKey ? 'Available' : 'Missing'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Auth Status:</span> {configInfo.authStatus}
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium mb-2">Client Modules</h3>
                      <p className={`text-sm mb-1 ${configInfo.clientObject.hasStorageModule ? 'text-green-600' : 'text-red-600'}`}>
                        Storage Module: {configInfo.clientObject.hasStorageModule ? 'Available ✅' : 'Missing ❌'}
                      </p>
                      <p className={`text-sm mb-1 ${configInfo.clientObject.hasAuthModule ? 'text-green-600' : 'text-red-600'}`}>
                        Auth Module: {configInfo.clientObject.hasAuthModule ? 'Available ✅' : 'Missing ❌'}
                      </p>
                      <p className={`text-sm ${configInfo.clientObject.hasFromMethod ? 'text-green-600' : 'text-red-600'}`}>
                        Storage.from Method: {configInfo.clientObject.hasFromMethod ? 'Available ✅' : 'Missing ❌'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Direct Bucket Test Results */}
          {directBucketResults && (
            <Card>
              <CardHeader>
                <CardTitle>Direct Bucket Access Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm mb-4">
                    These tests bypass the listBuckets API and try to access each bucket directly:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(directBucketResults).map(([bucketName, result]: [string, any]) => (
                      <div 
                        key={bucketName} 
                        className={`border rounded-md p-3 ${result.success ? 'border-green-200' : 'border-red-200'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{bucketName}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {result.success ? 'Accessible' : 'Inaccessible'}
                          </span>
                        </div>
                        
                        {result.success ? (
                          <>
                            <p className="text-sm">
                              <span className="font-medium">Files:</span> {result.fileCount}
                            </p>
                            {result.firstFile && (
                              <p className="text-xs mt-1 text-muted-foreground truncate">
                                First file: {result.firstFile.name}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-red-600 mt-1">
                            {result.error}
                            {result.statusCode && <span className="block mt-1">Status: {result.statusCode}</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Test video preview */}
          {testVideoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Test Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <video 
                    src={testVideoUrl} 
                    controls 
                    className="w-full max-w-md mx-auto border rounded-md"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  If this video plays correctly, your Supabase storage configuration is working properly.
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Bucket Files */}
          {bucketFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Video Files in Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {bucketFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="border rounded-md p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FileVideo className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm font-medium truncate max-w-[150px]">
                            {file.name}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={isLoadingVideo}
                          onClick={() => testVideo(file.name)}
                        >
                          {isLoadingVideo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Size: {(file.metadata?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Connection Results */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tables Section */}
                <div>
                  <h3 className="font-medium mb-3">Database Table Tests:</h3>
                  <div className="space-y-4">
                    {Object.entries(testResult.tables || {}).map(([tableName, data]: [string, any]) => (
                      <div 
                        key={tableName} 
                        className={`border rounded-md p-3 ${data.accessible ? 'border-green-200' : 'border-red-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{tableName}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${data.accessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {data.accessible ? 'Accessible' : 'Error'}
                          </span>
                        </div>
                        
                        {!data.accessible && data.error && (
                          <p className="mt-2 text-sm text-red-600">{data.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Video Test Results */}
          {videoTestResults && (
            <Card>
              <CardHeader>
                <CardTitle>Video Source Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Database results */}
                    <div className={`p-3 border rounded-md ${videoTestResults.database.success ? 'border-green-200' : 'border-red-200'}`}>
                      <h3 className="font-medium mb-2">Database Videos</h3>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Status:</span> 
                        <span className={videoTestResults.database.success ? 'text-green-600' : 'text-red-600'}>
                          {videoTestResults.database.success ? ' ✅ Accessible' : ' ❌ Error'}
                        </span>
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Videos found:</span> {videoTestResults.database.count}
                      </p>
                      {videoTestResults.database.error && (
                        <p className="text-sm text-red-600">{videoTestResults.database.error}</p>
                      )}
                    </div>
                    
                    {/* Storage results */}
                    <div className={`p-3 border rounded-md ${videoTestResults.storage.success ? 'border-green-200' : 'border-red-200'}`}>
                      <h3 className="font-medium mb-2">Storage Videos</h3>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Status:</span> 
                        <span className={videoTestResults.storage.success ? 'text-green-600' : 'text-red-600'}>
                          {videoTestResults.storage.success ? ' ✅ Accessible' : ' ❌ Error'}
                        </span>
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Files found:</span> {videoTestResults.storage.count}
                      </p>
                      {videoTestResults.storage.error && (
                        <p className="text-sm text-red-600">{videoTestResults.storage.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {videoTestResults.urls.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Video URL Tests</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {videoTestResults.urls.map((result, idx) => (
                          <div 
                            key={idx} 
                            className={`p-2 border rounded-md text-sm ${result.success ? 'border-green-200' : 'border-red-200'}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate max-w-[200px]">Path: {result.path}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {result.success ? 'Success' : 'Failed'}
                              </span>
                            </div>
                            {result.success ? (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="mt-1"
                                onClick={() => setTestVideoUrl(result.url)}
                              >
                                <Play className="h-3 w-3 mr-1" /> Test Play
                              </Button>
                            ) : (
                              <p className="text-xs text-red-600 mt-1">{result.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Storage Policies for Clips Bucket */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Policies for Clips Bucket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  Make sure you have a SELECT policy for the clips bucket in Supabase. Without this policy, anonymous users 
                  may not be able to access clips even if they appear in bucket listings.
                </p>
                
                <div className="p-3 border rounded-md">
                  <h3 className="font-medium mb-2">SQL to Add a SELECT Policy</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {`-- Run this SQL in the Supabase SQL Editor:
CREATE POLICY "Public can view clips" ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'clips');`}
                  </pre>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Note: You might need additional policies for INSERT, UPDATE, or DELETE operations depending on your application needs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default SupabaseDebug; 