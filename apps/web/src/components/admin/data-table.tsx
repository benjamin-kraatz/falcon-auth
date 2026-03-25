import { Button } from "@falcon/auth-ui/components/button";
import { Input } from "@falcon/auth-ui/components/input";
import { useState } from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  searchable,
  searchPlaceholder = "Search...",
  onSearch,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const filtered = query
    ? data.filter((row) =>
        columns.some((col) => {
          const v = (row as Record<string, unknown>)[col.key as string];
          return typeof v === "string" && v.toLowerCase().includes(query.toLowerCase());
        }),
      )
    : data;

  return (
    <div className="space-y-3">
      {searchable && (
        <Input
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
      )}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={`px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      className={`px-4 py-3 ${col.className ?? ""}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? "–")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  variant?: "default" | "destructive" | "outline" | "ghost";
  disabled?: boolean;
}

export function ActionButton({ onClick, label, variant = "ghost", disabled }: ActionButtonProps) {
  return (
    <Button size="xs" variant={variant} onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
}
