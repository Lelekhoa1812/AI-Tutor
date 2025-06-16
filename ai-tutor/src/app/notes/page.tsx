'use client'

import { useEffect, useState } from 'react'

const COLORS = [
  { name: 'green',  class: 'bg-green-100' },
  { name: 'pink',   class: 'bg-pink-100' },
  { name: 'yellow', class: 'bg-yellow-100' },
  { name: 'purple', class: 'bg-purple-100' },
]

export default function NotesPage() {
  const [notesByClassroom, setNotesByClassroom] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/notes/all')
      .then(res => res.json())
      .then(setNotesByClassroom)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Notes</h1>
      {notesByClassroom.length === 0 ? (
        <div className="text-center text-muted-foreground">
          <p>No notes found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {notesByClassroom.map((classroom: any) => (
            <div key={classroom.classroomId}>
              <h2 className="text-xl font-semibold mb-4">{classroom.classroomName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classroom.notes.map((note: any) => (
                  <div
                    key={note.id}
                    className={`p-4 border rounded transition-colors ${COLORS.find(c => c.name === note.color)?.class || 'bg-yellow-100'}`}
                  >
                    <div className="font-semibold text-black mb-2">{note.name || 'Note'}</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {note.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 