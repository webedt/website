import { ReactNode } from 'react';

export interface ItemDetailedViewProps<T> {
  items: T[];
  renderRow: (item: T) => ReactNode;
}

export default function ItemDetailedView<T>({ items, renderRow }: ItemDetailedViewProps<T>) {
  return (
    <div className="space-y-3">
      {items.map((item) => renderRow(item))}
    </div>
  );
}
