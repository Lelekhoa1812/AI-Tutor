import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ClassroomModalProps {
  isOpen: boolean
  onClose: () => void
  classroomId: string
  classroomName: string
}

export function ClassroomModal({ isOpen, onClose, classroomId, classroomName }: ClassroomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 [&>button]:hidden">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-2xl font-semibold">{classroomName}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Study Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add study materials content */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add schedule content */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add progress content */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add assignments content */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add notes content */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add resources content */}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 