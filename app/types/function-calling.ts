// Function calling types for AI chat

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface FunctionCall {
  name: string;
  arguments: string; // JSON string of arguments
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: FunctionCall;
}

export interface FunctionResult {
  tool_call_id: string;
  result: any;
  error?: string;
}

// Available functions
export const availableFunctions: FunctionDefinition[] = [
  {
    name: 'getCurrentTime',
    description: 'Get the current date and time in various formats',
    parameters: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description: 'Timezone (e.g., "Asia/Shanghai", "UTC"). Defaults to "Asia/Shanghai"',
        },
        format: {
          type: 'string',
          description: 'Date format ("full", "date", "time", "iso"). Defaults to "full"',
        },
      },
    },
  },
  {
    name: 'readWebContent',
    description: 'Read and extract content from a web page URL',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL of the web page to read',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'searchWeb',
    description: 'Search the web for information about a specific topic or query',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query or topic to search for',
        },
      },
      required: ['query'],
    },
  },
];