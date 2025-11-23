import { ReactNode } from 'react';

export interface ItemMinimalViewProps<T> {
  items: T[];
  renderRow: (item: T) => ReactNode;
}

export default function ItemMinimalView<T>({ items, renderRow }: ItemMinimalViewProps<T>) {
  return (
    <div className="space-y-1">
      {items.map((item) => renderRow(item))}
    </div>
  );
}
