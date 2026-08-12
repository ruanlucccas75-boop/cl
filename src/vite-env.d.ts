/// <reference types="vite/client" />

interface PuterAI {
  chat(
    messages: Array<{ role: string; content: string }>,
    options?: {
      model?: string;
      stream?: boolean;
      max_tokens?: number;
      temperature?: number;
    }
  ): Promise<any>;
}

interface Puter {
  ai: PuterAI;
  auth: {
    signIn: () => Promise<any>;
    signOut: () => Promise<any>;
    isSignedIn: () => boolean;
    getUser: () => Promise<any>;
  };
}

interface Window {
  puter: Puter;
}
