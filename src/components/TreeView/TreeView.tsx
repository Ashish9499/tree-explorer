import React, { useState, useCallback } from "react";
import { TreeNodeComponent } from "./TreeNodeComponent";
import { useTreeState } from "@/hooks/useTreeState";
import { mockRootData } from "@/data/mockTree";

export const TreeView: React.FC = () => {
  const { tree, loadChildren, addChild, removeNode, renameNode, moveNode } =
    useTreeState(mockRootData);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const handleToggle = useCallback(
    async (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      // Lazy load if not already loaded
      const findNode = (node: typeof tree): typeof tree | null => {
        if (node.id === id) return node;
        for (const c of node.children || []) {
          const f = findNode(c);
          if (f) return f;
        }
        return null;
      };
      const target = findNode(tree);
      if (target && !target.isLoaded && !target.isLoading) {
        await loadChildren(id);
      }
    },
    [tree, loadChildren]
  );

  return (
    <div className="p-8">
      <TreeNodeComponent
        node={tree}
        onToggle={handleToggle}
        onAdd={addChild}
        onRemove={removeNode}
        onRename={renameNode}
        onMove={moveNode}
        expanded={expanded}
        isRoot
      />
    </div>
  );
};
