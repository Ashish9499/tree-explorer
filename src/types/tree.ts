export interface TreeNodeData {
  id: string;
  name: string;
  level: string; // A, B, C, D, etc.
  children?: TreeNodeData[];
  isLoaded?: boolean;
  isLoading?: boolean;
}
