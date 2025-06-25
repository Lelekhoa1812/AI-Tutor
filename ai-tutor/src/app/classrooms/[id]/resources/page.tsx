// src/app/classrooms/[id]/resources/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Play, Globe, BookOpen, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Resource {
  id: string;
  topic: string;
  type: "video" | "website";
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

export default function ResourcesPage() {
  const { id } = useParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [groupedResources, setGroupedResources] = useState<Record<string, Resource[]>>({});

  useEffect(() => {
    fetchResources();
  }, [id]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/classrooms/${id}/resources`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      const data = await response.json();
      setResources(data.resources || []);
      
      // Group resources by topic
      const grouped = data.resources.reduce((acc: Record<string, Resource[]>, resource: Resource) => {
        if (!acc[resource.topic]) {
          acc[resource.topic] = [];
        }
        acc[resource.topic].push(resource);
        return acc;
      }, {});
      
      setGroupedResources(grouped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const openVideo = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      setSelectedVideo(videoId);
    }
  };

  const openWebsite = (url: string) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading resources...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchResources}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Study Resources</h1>
      </div>

      {Object.keys(groupedResources).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No resources available for this classroom yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="topics">By Topic</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onVideoClick={openVideo}
                  onWebsiteClick={openWebsite}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources
                .filter((resource) => resource.type === "video")
                .map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onVideoClick={openVideo}
                    onWebsiteClick={openWebsite}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="websites" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources
                .filter((resource) => resource.type === "website")
                .map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onVideoClick={openVideo}
                    onWebsiteClick={openWebsite}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            {Object.entries(groupedResources).map(([topic, topicResources]) => (
              <div key={topic} className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  {topic}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topicResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onVideoClick={openVideo}
                      onWebsiteClick={openWebsite}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Watch Video</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ResourceCardProps {
  resource: Resource;
  onVideoClick: (url: string) => void;
  onWebsiteClick: (url: string) => void;
}

function ResourceCard({ resource, onVideoClick, onWebsiteClick }: ResourceCardProps) {
  const isVideo = resource.type === "video";
  const isYouTube = isVideo && resource.url.includes("youtube.com");

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">
              {resource.title || resource.topic}
            </CardTitle>
            <CardDescription className="mt-1">
              {resource.description || `Study resources for ${resource.topic}`}
            </CardDescription>
          </div>
          <Badge variant={isVideo ? "default" : "secondary"} className="ml-2">
            {isVideo ? "Video" : "Website"}
          </Badge>
        </div>
      </CardHeader>
      
      {resource.thumbnail && (
        <div className="px-6 pb-3">
          <img
            src={resource.thumbnail}
            alt={resource.title || resource.topic}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}
      
      <CardContent className="pt-0">
        <div className="flex space-x-2">
          {isVideo && isYouTube ? (
            <Button
              onClick={() => onVideoClick(resource.url)}
              className="flex-1"
              variant="default"
            >
              <Play className="h-4 w-4 mr-2" />
              Watch Video
            </Button>
          ) : (
            <Button
              onClick={() => onWebsiteClick(resource.url)}
              className="flex-1"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open {isVideo ? "Video" : "Website"}
            </Button>
          )}
          
          <Button
            onClick={() => onWebsiteClick(resource.url)}
            variant="ghost"
            size="sm"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}