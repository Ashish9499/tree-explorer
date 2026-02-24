import { useState, useCallback } from "react";
import { TreeNodeData } from "@/types/tree";
import { fetchChildren, generateId } from "@/data/mockTree";

function mapTree(
  node: TreeNodeData,
  id: string,
  fn: (n: TreeNodeData) => TreeNodeData
): TreeNodeData {
  if (node.id === id) return fn(node);
  if (!node.children) return node;
  return { ...node, children: node.children.map((c) => mapTree(c, id, fn)) };
}

function removeFromTree(
  node: TreeNodeData,
  id: string
): TreeNodeData | null {
  if (node.id === id) return null;
  if (!node.children) return node;
  const filtered = node.children
    .map((c) => removeFromTree(c, id))
    .filter(Boolean) as TreeNodeData[];
  return { ...node, children: filtered };
}

function findNode(node: TreeNodeData, id: string): TreeNodeData | null {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

function deepClone(node: TreeNodeData): TreeNodeData {
  return {
    ...node,
    children: node.children?.map(deepClone),
  };
}

function isDescendant(node: TreeNodeData, ancestorId: string, targetId: string): boolean {
  const ancestor = findNode(node, ancestorId);
  if (!ancestor) return false;
  return !!findNode(ancestor, targetId);
}

export function useTreeState(initialData: TreeNodeData) {
  const [tree, setTree] = useState<TreeNodeData>(initialData);

  const loadChildren = useCallback(async (nodeId: string) => {
    setTree((prev) =>
      mapTree(prev, nodeId, (n) => ({ ...n, isLoading: true }))
    );
    const children = await fetchChildren(nodeId);
    setTree((prev) =>
      mapTree(prev, nodeId, (n) => ({
        ...n,
        children,
        isLoaded: true,
        isLoading: false,
      }))
    );
  }, []);

  const addChild = useCallback((parentId: string, name: string) => {
    const depth = getDepth(parentId);
    const levels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const newNode: TreeNodeData = {
      id: generateId(),
      name,
      level: levels[Math.min(depth + 1, levels.length - 1)],
      children: [],
      isLoaded: true,
    };
    setTree((prev) =>
      mapTree(prev, parentId, (n) => ({
        ...n,
        children: [...(n.children || []), newNode],
        isLoaded: true,
      }))
    );
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setTree((prev) => removeFromTree(prev, nodeId) || prev);
  }, []);

  const renameNode = useCallback((nodeId: string, newName: string) => {
    setTree((prev) =>
      mapTree(prev, nodeId, (n) => ({ ...n, name: newName }))
    );
  }, []);

  const moveNode = useCallback(
    (dragId: string, targetId: string, position: "before" | "after" | "inside") => {
      setTree((prev) => {
        // Prevent moving a node into its own subtree
        if (isDescendant(prev, dragId, targetId)) return prev;
        if (dragId === targetId) return prev;

        const dragNode = findNode(prev, dragId);
        if (!dragNode) return prev;
        const cloned = deepClone(dragNode);

        // Remove dragged node
        let newTree = removeFromTree(prev, dragId);
        if (!newTree) return prev;

        if (position === "inside") {
          newTree = mapTree(newTree, targetId, (n) => ({
            ...n,
            children: [...(n.children || []), cloned],
            isLoaded: true,
          }));
        } else {
          // Insert before/after target in its parent's children
          const insertInParent = (node: TreeNodeData): TreeNodeData => {
            if (node.children) {
              const idx = node.children.findIndex((c) => c.id === targetId);
              if (idx !== -1) {
                const newChildren = [...node.children];
                const insertIdx = position === "before" ? idx : idx + 1;
                newChildren.splice(insertIdx, 0, cloned);
                return { ...node, children: newChildren };
              }
              return { ...node, children: node.children.map(insertInParent) };
            }
            return node;
          };
          newTree = insertInParent(newTree);
        }
        return newTree;
      });
    },
    []
  );

  function getDepth(nodeId: string): number {
    function find(node: TreeNodeData, depth: number): number {
      if (node.id === nodeId) return depth;
      for (const c of node.children || []) {
        const d = find(c, depth + 1);
        if (d >= 0) return d;
      }
      return -1;
    }
    return Math.max(0, find(tree, 0));
  }

  return { tree, loadChildren, addChild, removeNode, renameNode, moveNode };
}
