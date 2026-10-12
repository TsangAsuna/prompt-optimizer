import type { TextModel, TextProvider } from '../types'
import { OpenAIAdapter } from './openai-adapter'

const OPENAI_COMPATIBLE_STATIC_MODELS: Array<{
  id: string
  name: string
  description: string
}> = [
  {
    id: 'custom-model',
    name: 'Custom Model',
    description: 'Generic model entry for custom endpoints that support OpenAI-compatible Chat Completions or Responses APIs'
  }
]

export class OpenAICompatibleAdapter extends OpenAIAdapter {
  public getProvider(): TextProvider {
    return {
      id: 'openai-compatible',
      name: 'OpenAI Compatible (Custom)',
      description: 'Add any number of custom OpenAI-compatible providers, each with its own API key and URL. Accepts full endpoints (…/v1/chat/completions), version bases (…/v1), and bare domains (/v1 auto-appended); append # to force as-is.',
      requiresApiKey: false,
      defaultBaseURL: 'http://localhost:11434/v1',
      supportsDynamicModels: true,
      connectionSchema: {
        required: [],
        optional: ['baseURL', 'apiKey', 'requestStyle'],
        fieldTypes: {
          baseURL: 'string',
          apiKey: 'string',
          requestStyle: 'string'
        }
      }
    }
  }

  public getModels(): TextModel[] {
    return OPENAI_COMPATIBLE_STATIC_MODELS.map((definition) => ({
      ...this.buildDefaultModel(definition.id),
      name: definition.name,
      description: definition.description
    }))
  }
}
