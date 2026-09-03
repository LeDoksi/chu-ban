import { useState, type FormEvent } from 'react';
import type { Sphere } from '../types';
import { addSphere, updateSphere, deleteSphere } from '../firebase/spheres';

const PALETTE = ['#7C9885', '#E8927C', '#D4A373', '#6C9BCF', '#A8DADC', '#C8A2C8'];

export function SettingsPage({ uid, spheres }: { uid: string; spheres: Sphere[] }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await addSphere(uid, newName.trim(), newColor, spheres.length);
    setNewName('');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-ink/70">Сферы жизни</p>
        {spheres.map((sphere) => (
          <div key={sphere.id} className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: sphere.color }} />
            {editingId === sphere.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={async () => {
                  if (editingName.trim()) await updateSphere(uid, sphere.id, { name: editingName.trim() });
                  setEditingId(null);
                }}
                autoFocus
                className="flex-1 rounded-lg border border-ink/20 px-2 py-1 text-sm"
              />
            ) : (
              <button
                className="flex-1 text-left text-sm text-ink"
                onClick={() => {
                  setEditingId(sphere.id);
                  setEditingName(sphere.name);
                }}
              >
                {sphere.name}
              </button>
            )}
            <button onClick={() => deleteSphere(uid, sphere.id)} className="text-xs text-terracotta">
              Удалить
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-2">
        <p className="text-sm font-medium text-ink/70">Добавить сферу</p>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название"
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewColor(color)}
              className={`h-7 w-7 rounded-full ${newColor === color ? 'ring-2 ring-ink/40 ring-offset-2' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <button type="submit" className="w-full rounded-full bg-sage px-4 py-2 text-sm font-medium text-white">
          Добавить
        </button>
      </form>
    </div>
  );
}
