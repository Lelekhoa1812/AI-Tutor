'use client'
import { useState, useEffect } from 'react'

export default function NotesPage({ params }: { params: { id: string } }) {
  const [notes, setNotes] = useState<any[]>([])
  const [selectedNote, setSelectedNote] = useState<any | null>(null)
  const [newNote, setNewNote] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch(`/api/classrooms/${params.id}/notes`)
      .then(res => res.json())
      .then(setNotes)
  }, [params.id])

  const createNote = async () => {
    const res = await fetch(`/api/classrooms/${params.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    })
    const note = await res.json()
    setNotes([note, ...notes])
    setNewNote('')
  }

  // ...update and delete handlers...

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      <textarea
        value={newNote}
        onChange={e => setNewNote(e.target.value)}
        placeholder="New note..."
        className="w-full border rounded p-2 mb-2"
      />
      <button onClick={createNote} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Add Note</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            className="p-4 border rounded cursor-pointer"
            onClick={() => { setSelectedNote(note); setShowModal(true); }}
          >
            <div className="font-semibold mb-2">Note</div>
            <div className="text-sm text-muted-foreground">
                {(note.content ?? '').slice(0, 100)}
                {(note.content ?? '').length > 100 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>
      {showModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-yellow-100 p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl text-black font-bold mb-2">Note</h2>
            <textarea
              className="w-full border rounded p-2 mb-2"
              value={selectedNote.content}
              onChange={e => setSelectedNote({ ...selectedNote, content: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={async () => {
                  await fetch(`/api/classrooms/${params.id}/notes/${selectedNote.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: selectedNote.content }),
                  })
                  setShowModal(false)
                  // refetch notes...
                }}
              >Save</button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={async () => {
                  await fetch(`/api/classrooms/${params.id}/notes/${selectedNote.id}`, { method: 'DELETE' })
                  setShowModal(false)
                  // refetch notes...
                }}
              >Delete</button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}