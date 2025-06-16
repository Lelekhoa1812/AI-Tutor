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
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 px-6 pb-6">
          <Button variant="ghost" size="icon" className="hover:bg-primary/10" aria-label="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.415 1.415-4.243a4 4 0 01.828-1.414z" /></svg>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-primary/10" aria-label="Notes">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-primary/10" aria-label="Share">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v.01M4 12a8 8 0 018-8v0a8 8 0 018 8v0a8 8 0 01-8 8v0a8 8 0 01-8-8v0zm8-4v8m0 0l-3-3m3 3l3-3" /></svg>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-red-100 hover:text-red-600" aria-label="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 