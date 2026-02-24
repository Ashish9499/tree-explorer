import { TreeView } from "@/components/TreeView/TreeView";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-8 py-5">
        <h1 className="text-xl font-bold text-foreground">Tree View</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Expand nodes to lazy-load children · Double-click to rename · Drag to reorder
        </p>
      </header>
      <main className="mx-auto max-w-4xl">
        <TreeView />
      </main>
    </div>
  );
};

export default Index;
