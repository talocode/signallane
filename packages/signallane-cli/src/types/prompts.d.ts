declare module 'prompts' {
  type Prompt = {
    type?: string;
    name?: string;
    message?: string;
    initial?: string;
    choices?: Array<{ title: string; value: string }>;
  };

  export default function prompts<T = Record<string, unknown>>(
    prompt: Prompt | Prompt[],
    options?: unknown,
  ): Promise<T>;
}
