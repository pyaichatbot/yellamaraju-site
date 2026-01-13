# Ask Praveen.AI Chatbot - Security Requirements

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Security Team | Initial security requirements for Ask AI Chatbot feature |

---

## 1. Security Objectives

### 1.1 Core Security Principles
- **API Key Protection**: Groq API key never exposed to browser
- **Rate Limiting**: Prevent abuse and cost overruns
- **Input Validation**: Prevent prompt injection and XSS
- **Output Sanitization**: Prevent hallucination and misinformation
- **Privacy**: No PII collection or storage
- **Cost Control**: Monitor and limit API usage

### 1.2 Threat Model

| Threat | Attack Vector | Mitigation |
|--------|--------------|------------|
| **API Key Theft** | Browser inspection, network sniffing | API key in Netlify env vars only, never in client code |
| **Prompt Injection** | Malicious user queries | Input sanitization, strict prompting, anti-hallucination prompts |
| **Rate Limit Bypass** | IP spoofing, distributed requests | IP-based rate limiting, hCaptcha verification |
| **Cost Overrun** | Excessive API calls | Rate limiting, cost monitoring, alerts |
| **XSS Attacks** | Malicious query content | Input sanitization, CSP headers, output encoding |
| **Data Exfiltration** | PII in responses | No PII in blog content, response filtering |

---

## 2. Security Controls

### 2.1 API Key Isolation

**Requirement**: Groq API key must never be exposed to the browser.

**Implementation**:
- Store API key in Netlify environment variables
- Access key only in Netlify Functions (serverless)
- Never include key in client-side code
- Never log key in application logs
- Use environment variable validation

**Validation**:
```bash
# Verify API key not in code
grep -r "GROQ_API_KEY" src/ netlify/functions/ --exclude-dir=node_modules
# Should return: netlify.toml (env var reference only)

# Verify API key in Netlify dashboard
# Check: Site settings → Environment variables → GROQ_API_KEY
```

**Test Cases**:
- [ ] API key not in Git repository
- [ ] API key not in browser network tab
- [ ] API key not in client-side JavaScript
- [ ] API key accessible only in Netlify Function context

---

### 2.2 Rate Limiting

**Requirement**: Limit API calls to prevent abuse and cost overruns.

**Implementation**:
- **Rate Limit**: 10 requests per IP per 60 seconds
- **Storage**: In-memory Map or Netlify KV (for persistence)
- **Headers**: Include rate limit info in response
- **Status Code**: Return 429 when limit exceeded

**Code Example**:
```typescript
// Rate limiting implementation
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const window = 60 * 1000; // 60 seconds
  const limit = 10;
  
  const record = rateLimiter.get(ip);
  
  if (!record || now > record.resetAt) {
    // Reset window
    rateLimiter.set(ip, { count: 1, resetAt: now + window });
    return { allowed: true, remaining: limit - 1, resetAt: now + window };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}
```

**Response Headers**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1704672000
```

**Validation**:
- [ ] Rate limit enforced (10 req/60s)
- [ ] 429 status returned when exceeded
- [ ] Rate limit headers present
- [ ] Different IPs have separate limits
- [ ] Rate limit resets after 60 seconds

---

### 2.3 hCaptcha Verification

**Requirement**: Verify human users to prevent bot abuse.

**Implementation**:
- Client-side hCaptcha widget
- Backend token verification
- Reject requests without valid token
- Token validation on every request

**Code Example**:
```typescript
// Backend verification
import { verify } from '@hcaptcha/verify';

async function verifyCaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const result = await verify(secretKey, token);
    return result.success;
  } catch (error) {
    return false;
  }
}
```

**Validation**:
- [ ] hCaptcha widget on chat interface
- [ ] Token verified on backend
- [ ] Invalid tokens rejected
- [ ] Missing tokens rejected
- [ ] Token expires after use

---

### 2.4 Input Validation and Sanitization

**Requirement**: Prevent prompt injection and XSS attacks.

**Implementation**:
- **Query Length**: Max 500 characters
- **Character Validation**: Allow alphanumeric, spaces, punctuation
- **Sanitization**: Remove/escape HTML tags
- **Pattern Detection**: Detect common injection patterns

**Code Example**:
```typescript
function validateQuery(query: string): { valid: boolean; sanitized: string; error?: string } {
  // Length check
  if (query.length > 500) {
    return { valid: false, sanitized: '', error: 'Query too long (max 500 characters)' };
  }
  
  // Sanitize HTML
  const sanitized = query
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Detect injection patterns
  const injectionPatterns = [
    /ignore\s+all\s+previous\s+instructions/i,
    /you\s+are\s+now\s+in\s+developer\s+mode/i,
    /system:\s*override/i,
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(query)) {
      return { valid: false, sanitized: '', error: 'Invalid query detected' };
    }
  }
  
  return { valid: true, sanitized };
}
```

**Validation**:
- [ ] Query length validated
- [ ] HTML tags escaped
- [ ] Injection patterns detected
- [ ] Invalid queries rejected
- [ ] Error messages user-friendly

---

### 2.5 Prompt Injection Prevention

**Requirement**: Prevent users from overriding system prompts.

**Implementation**:
- **Strict System Prompt**: Always prepend system instructions
- **Context Separation**: User query clearly separated from context
- **Instruction Enforcement**: Explicit "answer only from context" rule
- **Boundary Detection**: Detect attempts to override instructions

**Prompt Structure**:
```
[SYSTEM PROMPT - Always Applied]
You are "Ask yellamaraju.com AI"—a precise, helpful assistant.
Answer ONLY using the provided blog excerpts as truth.
Never invent information not in excerpts.
[END SYSTEM PROMPT]

[CONTEXT - Blog Excerpts]
{chunk1}
{chunk2}
...
[END CONTEXT]

[USER QUERY]
{userQuery}
[END USER QUERY]
```

**Anti-Injection Measures**:
- System prompt always prepended (cannot be overridden)
- User query clearly marked as [USER QUERY]
- Explicit instructions: "Answer ONLY using provided excerpts"
- Fallback: "I don't know" if query not covered

**Validation**:
- [ ] System prompt always included
- [ ] User query cannot override system prompt
- [ ] Injection attempts detected
- [ ] Responses grounded in context only
- [ ] Hallucination rate <5% (via user feedback)

---

### 2.6 Content Security Policy (CSP)

**Requirement**: Restrict resource loading to prevent XSS.

**Implementation**:
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://js.hcaptcha.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.netlify.com https://api.groq.com;
      frame-src https://js.hcaptcha.com;
    """
```

**Validation**:
- [ ] CSP headers configured
- [ ] No CSP violations in console
- [ ] hCaptcha loads correctly
- [ ] Chat API calls allowed
- [ ] External scripts blocked

---

### 2.7 Origin Validation

**Requirement**: Only allow requests from authorized origins.

**Implementation**:
```typescript
function validateOrigin(origin: string | null): boolean {
  const allowedOrigins = [
    'https://yellamaraju.com',
    'https://www.yellamaraju.com',
    'http://localhost:4321', // Development
  ];
  
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

// In Netlify Function
const origin = event.headers.origin || event.headers.referer;
if (!validateOrigin(origin)) {
  return new Response(JSON.stringify({ error: 'Unauthorized origin' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

**Validation**:
- [ ] Only allowed origins accepted
- [ ] Unauthorized origins rejected (403)
- [ ] Development origin allowed
- [ ] Production origins configured

---

### 2.8 Output Sanitization

**Requirement**: Ensure LLM responses are safe and properly formatted.

**Implementation**:
- **Citation Validation**: Verify citations match provided chunks
- **HTML Escaping**: Escape HTML in responses
- **Link Validation**: Validate citation URLs
- **Length Limits**: Enforce max response length

**Code Example**:
```typescript
function sanitizeResponse(response: string): string {
  // Escape HTML
  let sanitized = response
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Validate citations [1], [2], etc.
  const citationPattern = /\[(\d+)\]/g;
  const citations = response.match(citationPattern) || [];
  
  // Ensure citations are valid numbers
  for (const citation of citations) {
    const num = parseInt(citation.replace(/[\[\]]/g, ''));
    if (isNaN(num) || num < 1 || num > 5) {
      // Invalid citation, remove it
      sanitized = sanitized.replace(citation, '');
    }
  }
  
  return sanitized;
}
```

**Validation**:
- [ ] HTML escaped in responses
- [ ] Citations validated
- [ ] Links validated
- [ ] Response length limited
- [ ] No script tags in output

---

## 3. Monitoring and Alerting

### 3.1 Security Event Logging

**Requirement**: Log all security-relevant events.

**Events to Log**:
- Rate limit hits
- Invalid hCaptcha tokens
- Prompt injection attempts
- Origin validation failures
- API errors
- Cost threshold breaches

**Log Format**:
```json
{
  "timestamp": "2026-01-13T10:00:00Z",
  "event_type": "rate_limit_exceeded",
  "ip": "192.168.1.1",
  "query": "[redacted]",
  "metadata": {
    "limit": 10,
    "window": 60
  }
}
```

---

### 3.2 Cost Monitoring

**Requirement**: Monitor API costs and alert on thresholds.

**Implementation**:
- Track token usage per request
- Calculate estimated cost (Groq pricing)
- Alert if daily cost > $5
- Alert if monthly cost > $10
- Log cost per request

**Cost Calculation**:
```typescript
function calculateCost(inputTokens: number, outputTokens: number): number {
  // Groq Llama 3.1 8B pricing (as of 2026-01-13)
  const inputCostPer1K = 0.0001; // $0.0001 per 1K tokens
  const outputCostPer1K = 0.0001;
  
  const inputCost = (inputTokens / 1000) * inputCostPer1K;
  const outputCost = (outputTokens / 1000) * outputCostPer1K;
  
  return inputCost + outputCost;
}
```

**Alerts**:
- Daily cost > $5 → Alert to admin
- Monthly cost > $10 → Alert to admin
- Unusual spike (>2x average) → Alert

---

### 3.3 Quality Monitoring

**Requirement**: Monitor answer quality to detect hallucinations.

**Implementation**:
- User feedback collection (5-star rating)
- Negative feedback triggers review
- Track "I don't know" responses
- Monitor citation accuracy

**Metrics**:
- Hallucination rate (via user feedback)
- Citation accuracy
- Response relevance
- User satisfaction

**Alerts**:
- Hallucination rate > 5% → Alert
- Negative feedback spike → Alert
- Citation errors detected → Alert

---

## 4. Testing Requirements

### 4.1 Security Testing

**Required Tests**:
- [ ] API key not exposed in browser
- [ ] Rate limiting enforced
- [ ] hCaptcha verification works
- [ ] Prompt injection blocked
- [ ] XSS attempts blocked
- [ ] Origin validation works
- [ ] CSP headers configured
- [ ] Input sanitization works

### 4.2 Red-Team Scenarios

See `RED-TEAM-TESTING-GUIDE.md` for chatbot-specific scenarios:
- RT-CHAT-001: Prompt Injection via User Query
- RT-CHAT-002: Rate Limit Bypass Attempt
- RT-CHAT-003: API Key Exfiltration Attempt
- RT-CHAT-004: Cost Overrun Attack
- RT-CHAT-005: XSS via Query Input

---

## 5. Compliance

### 5.1 Privacy

**Requirements**:
- No PII collection (no email, name, etc.)
- No user tracking
- No data storage (except feedback)
- GDPR-compliant (if EU users)

**Implementation**:
- Chat queries not stored
- No user identification
- Feedback optional and anonymous
- No cookies (except hCaptcha)

---

### 5.2 Data Retention

**Requirements**:
- Minimal data retention
- Logs retained for 30 days
- Feedback retained for analysis
- Cost data retained for budgeting

---

## 6. Incident Response

### 6.1 Security Incidents

**Types**:
- API key compromise
- Rate limit bypass
- Cost overrun
- Prompt injection success
- XSS attack

**Response**:
1. **Detect**: Monitor alerts and logs
2. **Contain**: Disable feature if critical
3. **Assess**: Determine scope and impact
4. **Remediate**: Fix vulnerability
5. **Document**: Log incident and lessons learned

---

## 7. Pre-Launch Security Checklist

- [ ] API key in Netlify env vars (not in code)
- [ ] Rate limiting functional (test 15 requests in 60s)
- [ ] hCaptcha token verified on backend
- [ ] CSP headers deployed
- [ ] Origin validation works
- [ ] Input sanitization tested
- [ ] Prompt injection tests pass
- [ ] XSS tests pass
- [ ] Cost monitoring configured
- [ ] Alerts configured
- [ ] Security logging enabled
- [ ] Red-team tests pass

---

**Document Status**: APPROVED  
**Last Updated**: 2026-01-13  
**Next Review**: Before production launch  
**Classification**: Internal - Security Sensitive
