export function EmptyState({ title, message }: { title: string; message: string }) {
  return <section className="panel emptyPanel"><p className="eyebrow">Empty state</p><h2>{title}</h2><p>{message}</p></section>;
}
