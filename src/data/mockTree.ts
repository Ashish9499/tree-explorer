import { TreeNodeData } from "@/types/tree";

let idCounter = 100;
export const generateId = () => `node-${++idCounter}`;

// Simulated lazy-loaded children
const lazyChildren: Record<string, TreeNodeData[]> = {
  "node-1": [
    {
      id: "node-2",
      name: "Services",
      level: "B",
      isLoaded: false,
      children: [],
    },
    {
      id: "node-6",
      name: "Components",
      level: "B",
      isLoaded: false,
      children: [],
    },
  ],
  "node-2": [
    {
      id: "node-3",
      name: "Auth Service",
      level: "C",
      isLoaded: false,
      children: [],
    },
    {
      id: "node-5",
      name: "API Gateway",
      level: "C",
      isLoaded: false,
      children: [],
    },
  ],
  "node-3": [
    {
      id: "node-4",
      name: "OAuth Provider",
      level: "D",
      isLoaded: true,
      children: [],
    },
  ],
  "node-6": [
    {
      id: "node-7",
      name: "Button",
      level: "C",
      isLoaded: true,
      children: [],
    },
    {
      id: "node-8",
      name: "Modal",
      level: "C",
      isLoaded: true,
      children: [],
    },
  ],
};

export const mockRootData: TreeNodeData = {
  id: "node-1",
  name: "Application",
  level: "A",
  isLoaded: false,
  children: [],
};

export async function fetchChildren(nodeId: string): Promise<TreeNodeData[]> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
  return lazyChildren[nodeId] || [];
}
