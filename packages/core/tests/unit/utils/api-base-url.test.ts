import { describe, it, expect } from 'vitest'
import { normalizeOpenAIBaseURL } from '../../../src/utils/api-base-url'

describe('normalizeOpenAIBaseURL', () => {
  it('returns fallback when input is empty', () => {
    expect(normalizeOpenAIBaseURL(undefined, 'https://api.example.com/v1')).toBe(
      'https://api.example.com/v1'
    )
    expect(normalizeOpenAIBaseURL('', 'https://api.example.com/v1')).toBe(
      'https://api.example.com/v1'
    )
    expect(normalizeOpenAIBaseURL('   ', 'https://api.example.com/v1')).toBe(
      'https://api.example.com/v1'
    )
    expect(normalizeOpenAIBaseURL('', '')).toBe('')
  })

  it('appends /v1 to bare domains', () => {
    expect(normalizeOpenAIBaseURL('https://token.sensenova.cn')).toBe(
      'https://token.sensenova.cn/v1'
    )
    expect(normalizeOpenAIBaseURL('https://token.sensenova.cn/')).toBe(
      'https://token.sensenova.cn/v1'
    )
    expect(normalizeOpenAIBaseURL('http://localhost:11434')).toBe(
      'http://localhost:11434/v1'
    )
  })

  it('keeps standard version bases as-is', () => {
    expect(normalizeOpenAIBaseURL('https://token.sensenova.cn/v1')).toBe(
      'https://token.sensenova.cn/v1'
    )
    expect(normalizeOpenAIBaseURL('https://token.sensenova.cn/v1/')).toBe(
      'https://token.sensenova.cn/v1'
    )
    expect(normalizeOpenAIBaseURL('https://generativelanguage.googleapis.com/v1beta')).toBe(
      'https://generativelanguage.googleapis.com/v1beta'
    )
  })

  it('strips full chat completions endpoints down to the version root', () => {
    expect(normalizeOpenAIBaseURL('https://token.sensenova.cn/v1/chat/completions')).toBe(
      'https://token.sensenova.cn/v1'
    )
    expect(normalizeOpenAIBaseURL('https://token.sensenova.cn/v1/chat/completions/')).toBe(
      'https://token.sensenova.cn/v1'
    )
  })

  it('strips full responses endpoints down to the version root', () => {
    expect(normalizeOpenAIBaseURL('https://api.example.com/v1/responses')).toBe(
      'https://api.example.com/v1'
    )
  })

  it('keeps explicit custom paths untouched', () => {
    expect(normalizeOpenAIBaseURL('https://example.com/api')).toBe('https://example.com/api')
    expect(normalizeOpenAIBaseURL('https://example.com/openai/v1')).toBe(
      'https://example.com/openai/v1'
    )
  })

  it('honors the trailing # marker to use the URL as-is', () => {
    expect(normalizeOpenAIBaseURL('https://example.com/v1#')).toBe('https://example.com/v1')
    expect(normalizeOpenAIBaseURL('https://example.com#')).toBe('https://example.com')
    // # keeps even non-standard endpoint paths untouched
    expect(normalizeOpenAIBaseURL('https://example.com/chat/completions#')).toBe(
      'https://example.com/chat/completions'
    )
  })

  it('prepends https:// when the scheme is missing', () => {
    expect(normalizeOpenAIBaseURL('token.sensenova.cn/v1')).toBe(
      'https://token.sensenova.cn/v1'
    )
    expect(normalizeOpenAIBaseURL('token.sensenova.cn')).toBe(
      'https://token.sensenova.cn/v1'
    )
    expect(normalizeOpenAIBaseURL('localhost:11434/v1')).toBe('https://localhost:11434/v1')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeOpenAIBaseURL('  https://token.sensenova.cn/v1  ')).toBe(
      'https://token.sensenova.cn/v1'
    )
  })

  it('returns the input unchanged when URL parsing fails', () => {
    // 'https://::::' cannot construct a URL; the helper must not throw.
    expect(normalizeOpenAIBaseURL('::::')).toBe('https://::::')
  })
})
