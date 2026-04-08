// Simple event bus to trigger the chat widget from anywhere (e.g., hero input)
type Listener = (message: string) => void;

const listeners = new Set<Listener>();

export const triggerChat = (message: string) => {
  listeners.forEach((fn) => fn(message));
};

export const onChatTrigger = (fn: Listener) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};
