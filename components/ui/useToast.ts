// Simple toast utility — pairs with Toaster component
type ToastOptions = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

type Listener = (toast: ToastOptions & { id: string }) => void;

const listeners: Listener[] = [];

export function toast(options: ToastOptions) {
  const id = Math.random().toString(36).slice(2);
  listeners.forEach((l) => l({ ...options, id }));
}

export function subscribe(listener: Listener) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}
