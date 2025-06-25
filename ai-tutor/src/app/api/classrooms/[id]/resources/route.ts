// src/app/api/classrooms/[id]/resources/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Check if classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: { resources: true }
    });

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
    }

    // If resources already exist, return them
    if (classroom.resources.length > 0) {
      return NextResponse.json({ resources: classroom.resources });
    }

    // If no resources exist, fetch from external API
    const response = await fetch("https://binkhoale1812-resources-searcher.hf.space/api/query-resources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ classroom_id: id }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch resources from external API");
    }

    const data = await response.json();
    
    if (!data.resources || !Array.isArray(data.resources)) {
      return NextResponse.json({ error: "Invalid response from external API" }, { status: 500 });
    }

    // Store resources in database
    const createdResources = await Promise.all(
      data.resources.map(async (resource: any) => {
        let title = resource.topic;
        let description = `Study resources for ${resource.topic}`;
        let thumbnail = null;

        // If it's a YouTube video, try to get more details
        if (resource.type === "video" && resource.url.includes("youtube.com")) {
          try {
            const videoId = extractYouTubeVideoId(resource.url);
            if (videoId) {
              const youtubeResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`
              );
              
              if (youtubeResponse.ok) {
                const youtubeData = await youtubeResponse.json();
                if (youtubeData.items && youtubeData.items.length > 0) {
                  const videoInfo = youtubeData.items[0].snippet;
                  title = videoInfo.title;
                  description = videoInfo.description.substring(0, 200) + "...";
                  thumbnail = videoInfo.thumbnails?.medium?.url || videoInfo.thumbnails?.default?.url;
                }
              }
            }
          } catch (error) {
            console.error("Error fetching YouTube video details:", error);
          }
        }

        return prisma.resource.create({
          data: {
            classroomId: id,
            topic: resource.topic,
            type: resource.type,
            url: resource.url,
            title,
            description,
            thumbnail,
          },
        });
      })
    );

    return NextResponse.json({ resources: createdResources });
  } catch (error) {
    console.error("Error in resources API:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}