"use client";

import { Schedule } from "@/components/planner/Schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlannerPage() {
  // TODO: Get classroomId from user context or props
  const classroomId = "class-1";

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Class Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Schedule classroomId={classroomId} />
        </CardContent>
      </Card>
    </div>
  );
} 