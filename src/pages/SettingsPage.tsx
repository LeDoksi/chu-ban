import { useState, type FormEvent } from 'react';
import type { Sphere } from '../types';
import { addSphere, updateSphere, deleteSphere } from '../firebase/spheres';

const PALETTE = [
  '#7C9885', // sage
  '#E8927C', // terracotta
  '#D4A373', // gold
  '#6C9BCF', // dusty blue
  '#A8DADC', // pale teal
  '#C8A2C8', // lavender
  '#F2A6A6', // dusty rose
  '#9ED9C4', // mint
  '#F5C99B', // peach
  '#A6B6E8', // periwinkle
  '#E8C468', // mustard
  '#B08BBB', // plum
  '#8FC4E8', // sky
  '#C97B63', // clay
];

export function SettingsPage({ uid, spheres }: { uid: string; spheres: Sphere[] }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string | null>(null);
  const usedColors = new Set(spheres.map((s) => s.color));
  const availablePalette = PALETTE.filter((c) => !usedColors.has(c));
  const palette = availablePalette.length > 0 ? availablePalette : PALETTE;
  const selectedColor = newColor && palette.includes(newColor) ? newColor : palette[0];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function describeError(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await addSphere(uid, newName.trim(), selectedColor, spheres.length);
      setNewName('');
      setNewColor(null);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRename(sphere: Sphere) {
    const name = editingName.trim();
    setEditingId(null);
    if (!name || name === sphere.name) return;
    try {
      await updateSphere(uid, sphere.id, { name });
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleDelete(sphere: Sphere) {
    if (!confirm(`Удалить сферу «${sphere.name}»? Это нельзя отменить.`)) return;
    try {
      await deleteSphere(uid, sphere.id);
    } catch (err) {
      setError(describeError(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-ink/70">Сферы жизни</p>
        {spheres.map((sphere) => (
          <div key={sphere.id} className="flex items-center gap-2 rounded-xl bg-surface p-3 shadow-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: sphere.color }} />
            {editingId === sphere.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRename(sphere)}
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
            <button onClick={() => handleDelete(sphere)} className="text-xs text-terracotta">
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
        <div className="flex flex-wrap gap-2">
          {palette.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewColor(color)}
              className={`h-9 w-9 rounded-full ${selectedColor === color ? 'ring-2 ring-ink/40 ring-offset-2' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {error && (
          <p className="rounded-xl bg-terracotta/15 px-3 py-2 text-sm text-ink">Не сохранилось: {error}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Добавить
        </button>
      </form>
    </div>
  );
}
