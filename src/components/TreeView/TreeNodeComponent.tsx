import React, { useState, useRef, useEffect } from "react";
import { TreeNodeData } from "@/types/tree";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  GripVertical,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BADGE_COLORS: Record<string, string> = {
  A: "bg-tree-badge-a",
  B: "bg-tree-badge-b",
  C: "bg-tree-badge-c",
  D: "bg-tree-badge-d",
};

interface Props {
  node: TreeNodeData;
  onToggle: (id: string) => void;
  onAdd: (parentId: string, name: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMove: (dragId: string, targetId: string, position: "before" | "after" | "inside") => void;
  expanded: Set<string>;
  isRoot?: boolean;
}

export const TreeNodeComponent: React.FC<Props> = ({
  node,
  onToggle,
  onAdd,
  onRemove,
  onRename,
  onMove,
  expanded,
  isRoot,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.name);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [dragOver, setDragOver] = useState<"before" | "after" | "inside" | null>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isExpanded = expanded.has(node.id);
  const hasChildren = (node.children && node.children.length > 0) || !node.isLoaded;

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    if (isAdding) addRef.current?.focus();
  }, [isAdding]);

  const handleEditSubmit = () => {
    if (editValue.trim()) {
      onRename(node.id, editValue.trim());
    } else {
      setEditValue(node.name);
    }
    setIsEditing(false);
  };

  const handleAddSubmit = () => {
    if (newName.trim()) {
      onAdd(node.id, newName.trim());
      setNewName("");
    }
    setIsAdding(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = e.clientY - rect.top;
    const h = rect.height;
    if (y < h * 0.25) setDragOver("before");
    else if (y > h * 0.75) setDragOver("after");
    else setDragOver("inside");
  };

  const handleDragLeave = () => setDragOver(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dragId = e.dataTransfer.getData("text/plain");
    if (dragId && dragOver) {
      onMove(dragId, node.id, dragOver);
    }
    setDragOver(null);
  };

  const badgeColor = BADGE_COLORS[node.level] || "bg-secondary";

  return (
    <div className="relative">
      {/* Connector line from parent */}
      {!isRoot && (
        <div className="absolute -left-6 top-5 w-6 border-t-2 border-dashed border-tree-connector" />
      )}

      {/* Node card */}
      <div
        ref={nodeRef}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          group relative inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2
          shadow-tree-node transition-all duration-150 hover:shadow-tree-node-hover
          cursor-grab active:cursor-grabbing select-none
          ${dragOver === "inside" ? "ring-2 ring-tree-drag-over ring-offset-1" : ""}
          ${dragOver === "before" ? "border-t-2 border-t-tree-drag-over" : ""}
          ${dragOver === "after" ? "border-b-2 border-b-tree-drag-over" : ""}
        `}
      >
        {/* Drag grip */}
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Expand/collapse */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted transition-colors"
          >
            {node.isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Badge */}
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary-foreground ${badgeColor}`}
        >
          {node.level}
        </span>

        {/* Name */}
        {isEditing ? (
          <input
            ref={editRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditSubmit();
              if (e.key === "Escape") {
                setEditValue(node.name);
                setIsEditing(false);
              }
            }}
            className="h-6 w-28 rounded border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <span
            className="text-sm font-medium text-card-foreground cursor-text"
            onDoubleClick={() => {
              setEditValue(node.name);
              setIsEditing(true);
            }}
          >
            {node.name}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsAdding(true)}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted transition-colors"
            title="Add child"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => {
              setEditValue(node.name);
              setIsEditing(true);
            }}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted transition-colors"
            title="Rename"
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
          {!isRoot && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-destructive/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{node.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the node and all its children. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRemove(node.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Inline add input */}
      {isAdding && (
        <div className="ml-10 mt-2">
          <input
            ref={addRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleAddSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubmit();
              if (e.key === "Escape") {
                setNewName("");
                setIsAdding(false);
              }
            }}
            placeholder="Node name…"
            className="h-7 w-36 rounded border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      {/* Children */}
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="relative ml-6 mt-1 pl-6 border-l-2 border-dashed border-tree-connector">
          {node.children.map((child) => (
            <div key={child.id} className="mt-2">
              <TreeNodeComponent
                node={child}
                onToggle={onToggle}
                onAdd={onAdd}
                onRemove={onRemove}
                onRename={onRename}
                onMove={onMove}
                expanded={expanded}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
