import React from 'react';
import { Button } from '@/components/ui/button';

const App: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-4xl font-bold text-center">
          Welcome to React + Symfony + shadcn/ui
        </h1>

        <div className="flex flex-col items-center gap-4">
          <p className="text-xl text-muted-foreground">
            Counter: {count}
          </p>

          <div className="flex gap-2">
            <Button onClick={() => setCount(count + 1)}>
              Increment
            </Button>
            <Button variant="secondary" onClick={() => setCount(count - 1)}>
              Decrement
            </Button>
            <Button variant="outline" onClick={() => setCount(0)}>
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-8 p-6 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold mb-2">Setup Complete!</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>React 18 with TypeScript</li>
            <li>Tailwind CSS</li>
            <li>shadcn/ui components</li>
            <li>Webpack Encore</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
