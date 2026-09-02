export function OverdueBanner({
  onComplete,
  onReschedule,
}: {
  onComplete: () => void;
  onReschedule: () => void;
}) {
  return (
    <div className="mt-2 rounded-2xl bg-terracotta/15 p-3 text-sm text-ink">
      <p>Дедлайн подошёл. Возьмись за задачу — или просто передвинь срок, ничего страшного 🌿</p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onComplete}
          className="rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white"
        >
          Выполнить
        </button>
        <button
          onClick={onReschedule}
          className="rounded-full border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink"
        >
          Перенести срок
        </button>
      </div>
    </div>
  );
}
