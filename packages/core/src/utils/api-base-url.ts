/**
 * OpenAI 兼容 API 的 Base URL 规范化工具
 *
 * OpenAI SDK 以 `<baseURL>/chat/completions` 拼接请求地址，因此 baseURL 必须
 * 是"版本根"（如 https://host/v1）。用户实际粘贴的地址五花八门，这里统一归一化。
 */

/** 末尾 `#` 标记（one-api/new-api 生态约定）：强制按原样使用，不做任何补全 */
const USE_AS_IS_SUFFIX = '#'

const CHAT_COMPLETIONS_SUFFIX = '/chat/completions'
const RESPONSES_SUFFIX = '/responses'

/** scheme:// 前缀（允许 http/https/自定义协议） */
const SCHEME_PREFIX = /^[a-z][a-z0-9+.-]*:\/\//i

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

/**
 * 规范化用户输入的 OpenAI 兼容 Base URL
 *
 * 支持的输入格式：
 * - https://host                        → https://host/v1          （裸域名，自动补 /v1）
 * - https://host/                       → https://host/v1
 * - https://host/v1                     → https://host/v1          （标准 base，原样）
 * - https://host/v1/                    → https://host/v1
 * - https://host/v1/chat/completions    → https://host/v1          （完整 endpoint，自动剥离）
 * - https://host/v1/responses           → https://host/v1          （Responses API endpoint）
 * - https://host/api                    → https://host/api         （显式自定义路径，原样保留）
 * - https://host#                       → https://host             （# 结尾：按原样使用）
 * - host/v1（无协议）                    → https://host/v1          （自动补 https://）
 *
 * @param rawBaseURL 用户输入的地址
 * @param fallbackBaseURL 输入为空时使用的默认地址
 * @returns 规范化后的 Base URL；输入与默认值均为空时返回空字符串
 */
export function normalizeOpenAIBaseURL(
  rawBaseURL: string | undefined,
  fallbackBaseURL?: string
): string {
  const fallback = typeof fallbackBaseURL === 'string' ? fallbackBaseURL.trim() : ''
  const raw = typeof rawBaseURL === 'string' ? rawBaseURL.trim() : ''

  if (!raw) {
    return fallback
  }

  const useAsIs = raw.endsWith(USE_AS_IS_SUFFIX)
  let normalized = (useAsIs ? raw.slice(0, -USE_AS_IS_SUFFIX.length) : raw).trim()
  normalized = stripTrailingSlashes(normalized)

  if (!normalized) {
    return fallback
  }

  // 无协议时默认按 https 处理（用户常直接粘贴 host/v1 形式）
  if (!SCHEME_PREFIX.test(normalized)) {
    normalized = `https://${normalized}`
  }

  if (useAsIs) {
    return normalized
  }

  // 用户粘贴了完整 endpoint：剥离到版本根
  if (normalized.endsWith(CHAT_COMPLETIONS_SUFFIX)) {
    normalized = stripTrailingSlashes(normalized.slice(0, -CHAT_COMPLETIONS_SUFFIX.length))
  } else if (normalized.endsWith(RESPONSES_SUFFIX)) {
    normalized = stripTrailingSlashes(normalized.slice(0, -RESPONSES_SUFFIX.length))
  }

  // 裸域名（无路径）时补默认的 /v1；已有显式路径则尊重用户输入
  try {
    const url = new URL(normalized)
    const path = stripTrailingSlashes(url.pathname)
    if (!path) {
      return `${normalized}/v1`
    }
  } catch {
    // URL 解析失败时按原样返回，交由上层/SDK 报错
  }

  return normalized
}
