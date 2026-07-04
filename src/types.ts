// ── Metrics ──────────────────────────────────────────
export interface XMetrics {
  followers?: number
  verifiedFollowers?: number
  activeFollowers?: number
  impressions?: number
  engagementRate?: number
  engagements?: number
  profileVisits?: number
  replies?: number
  likes?: number
  reposts?: number
  bookmarks?: number
  shares?: number
}

export interface XTopPost {
  text: string
  impressions?: number
  likes?: number
  replies?: number
  bookmarks?: number
}

// ── Analysis ─────────────────────────────────────────
export interface StrongSignal {
  type: string
  label: string
  value: number
  metric: string
  insight: string
}

export interface WeakSignal {
  type: string
  label: string
  value: number
  metric: string
  insight: string
}

export interface AudiencePattern {
  type: string
  label: string
  percentage: number
  description: string
}

export interface TopicOpportunity {
  topic: string
  relevance: number
  angle: string
}

export interface CtaOpportunity {
  type: string
  label: string
  description: string
}

export interface Risk {
  area: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

export interface NextAction {
  priority: 'high' | 'medium' | 'low'
  action: string
  impact: string
}

export interface AnalysisResult {
  summary: string
  strongSignals: StrongSignal[]
  weakSignals: WeakSignal[]
  audiencePatterns: AudiencePattern[]
  topicOpportunities: TopicOpportunity[]
  ctaOpportunities: CtaOpportunity[]
  risks: Risk[]
  nextActions: NextAction[]
}

// ── Content Plan ─────────────────────────────────────
export interface ContentPillar {
  name: string
  description: string
  postAngles: string[]
}

export interface PostAngle {
  angle: string
  examples: string[]
}

export interface PostingCadence {
  day: string
  times: number
  theme: string
}

export interface CtaStrategy {
  placement: string
  type: string
  message: string
}

export interface ContentPlanResult {
  weeklyTheme: string
  contentPillars: ContentPillar[]
  postAngles: PostAngle[]
  postingCadence: PostingCadence[]
  ctaStrategy: CtaStrategy[]
}

// ── Post Drafts ──────────────────────────────────────
export interface PostDraft {
  angle: string
  text: string
  cta: string
  risk: string
}

export interface PostDraftsResult {
  drafts: PostDraft[]
}

// ── Experiments ──────────────────────────────────────
export interface Experiment {
  name: string
  hypothesis: string
  posts: string[]
  successMetric: string
  reviewDate: string
}

export interface ExperimentsResult {
  experiments: Experiment[]
}

// ── Report ───────────────────────────────────────────
export interface ScorecardItem {
  metric: string
  value: string
  signal: 'strong' | 'neutral' | 'weak'
}

export interface ReportResult {
  executiveSummary: string
  scorecard: ScorecardItem[]
  signals: {
    strong: StrongSignal[]
    weak: WeakSignal[]
  }
  contentPlan: ContentPlanResult
  drafts: PostDraft[]
  experiments: Experiment[]
  nextActions: NextAction[]
}

// ── Billing ──────────────────────────────────────────
export const BillingActions = {
  ANALYZE: 'x_analyze',
  CONTENT_PLAN: 'x_content_plan',
  POST_DRAFTS: 'x_post_drafts',
  EXPERIMENTS: 'x_experiments',
  REPORT: 'x_report',
} as const

export type BillingAction = (typeof BillingActions)[keyof typeof BillingActions]

// ── API ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  ok: boolean
  requestId: string
  data?: T
  error?: string
  usage?: {
    credits: number
  }
}
