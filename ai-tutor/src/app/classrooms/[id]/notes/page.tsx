'use client'
import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

const COLORS = [
  { name: 'green',  class: 'bg-green-100' },
  { name: 'pink',   class: 'bg-pink-100' },
  { name: 'yellow', class: 'bg-yellow-100' },
  { name: 'purple', class: 'bg-purple-100' },
]

export default function NotesPage({ params }: { params: { id: string } }) {
  const [notes, setNotes] = useState<any[]>([])
  const [selectedNote, setSelectedNote] = useState<any | null>(null)
  const [newNote, setNewNote] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const router = useRouter()

  // Fetch notes
  useEffect(() => {
    fetch(`/api/classrooms/${params.id}/notes`)
      .then(res => res.json())
      .then(setNotes)
  }, [params.id])

  // Create note
  const createNote = async () => {
    const res = await fetch(`/api/classrooms/${params.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote, name: 'Note', color: 'yellow' }),
    })
    const note = await res.json()
    setNotes([note, ...notes])
    setNewNote('')
  }

  // Unified update note function
  const updateNote = async (noteId: string, updates: { content?: string; name?: string; color?: string }) => {
    try {
      const response = await fetch(`/api/classrooms/${params.id}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      setNotes(notes => notes.map(n => n.id === noteId ? { ...n, ...updates } : n));
      
      // Update selected note if it's the one being edited
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote({ ...selectedNote, ...updates });
      }

      // Close the note window and refresh the page
      setSelectedNote(null);
      router.refresh();

      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  // Update note content
  const updateNoteContent = async (noteId: string, content: string) => {
    await updateNote(noteId, { content });
  }

  // Update note name
  const updateNoteName = async (noteId: string, name: string) => {
    await updateNote(noteId, { name });
    setEditingNameId(null);
  }

  // Update note color
  const updateNoteColor = async (noteId: string, color: string) => {
    await updateNote(noteId, { color });
  }

  // Delete note
  const deleteNote = async (noteId: string) => {
    await fetch(`/api/classrooms/${params.id}/notes/${noteId}`, { method: 'DELETE' })
    setNotes(notes => notes.filter(n => n.id !== noteId))
    setShowModal(false)
  }

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
            className={`p-4 border rounded cursor-pointer transition-colors ${COLORS.find(c => c.name === note.color)?.class || 'bg-yellow-100'}`}
            onClick={() => { setSelectedNote(note); setShowModal(true); }}
          >
            <div className="flex items-center mb-2">
              {editingNameId === note.id ? (
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onBlur={() => updateNoteName(note.id, newName)}
                  onKeyDown={e => e.key === 'Enter' && updateNoteName(note.id, newName)}
                  className="font-semibold border-b bg-transparent"
                  autoFocus
                />
              ) : (
                <>
                  <span className="font-semibold text-black">{note.name || 'Note'}</span>
                  <Pencil className="ml-2 w-4 h-4 cursor-pointer" onClick={e => { e.stopPropagation(); setEditingNameId(note.id); setNewName(note.name || 'Note') }} />
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {(note.content ?? '').split(' ').slice(0, 15).join(' ')}{(note.content ?? '').split(' ').length > 15 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>
      {showModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded shadow-lg w-full max-w-lg transition-colors ${COLORS.find(c => c.name === selectedNote.color)?.class || 'bg-yellow-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <input
                className="font-bold text-xxl border-b bg-transparent text-black"
                value={selectedNote.name}
                onChange={e => setSelectedNote({ ...selectedNote, name: e.target.value })}
                onBlur={() => updateNoteName(selectedNote.id, selectedNote.name)}
              />
              <div className="flex flex-col gap-2 ml-4">
                {COLORS.map(c => (
                  <span
                    key={c.name}
                    className={`w-5 h-5 rounded-full border-2 border-gray-300 cursor-pointer ${c.class}`}
                    onClick={() => updateNoteColor(selectedNote.id, c.name)}
                  />
                ))}
              </div>
            </div>
            <textarea
              className="w-full border rounded p-2 mb-2"
              value={selectedNote.content}
              onChange={e => setSelectedNote({ ...selectedNote, content: e.target.value })}
              onBlur={() => updateNoteContent(selectedNote.id, selectedNote.content)}
            />
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => updateNote(selectedNote.id, { content: selectedNote.content })}
              >Update</button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => deleteNote(selectedNote.id)}
              >Delete</button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}