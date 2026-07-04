import type {
  XMetrics,
  XTopPost,
  StrongSignal,
  WeakSignal,
  AudiencePattern,
  TopicOpportunity,
  CtaOpportunity,
  Risk,
  NextAction,
  AnalysisResult,
  ContentPillar,
  PostAngle,
  PostingCadence,
  CtaStrategy,
  ContentPlanResult,
  PostDraft,
  PostDraftsResult,
  Experiment,
  ExperimentsResult,
  ScorecardItem,
  ReportResult,
} from './types.js'

// ── Helpers ──────────────────────────────────────────

function ratio(a: number | undefined, b: number | undefined): number {
  if (a == null || b == null || b === 0) return 0
  return a / b
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v))
}

// ── analyzeSignals ───────────────────────────────────

export function analyzeSignals(input: {
  handle: string
  goal: string
  metrics: XMetrics
  topPosts?: XTopPost[]
}): AnalysisResult {
  const m = input.metrics
  const er = m.engagementRate ?? ratio(m.engagements, m.impressions) * 100
  const repostShareRatio = ratio(m.reposts, m.shares)
  const bmImpRatio = ratio(m.bookmarks, m.impressions)
  const pvImpRatio = ratio(m.profileVisits, m.impressions)
  const replyImpRatio = ratio(m.replies, m.impressions)
  const verifiedRatio = ratio(m.verifiedFollowers, m.followers)
  const activeRatio = ratio(m.activeFollowers, m.followers)

  const strongSignals: StrongSignal[] = []
  const weakSignals: WeakSignal[] = []

  if (er > 3) {
    strongSignals.push({
      type: 'engagement',
      label: 'Strong Engagement',
      value: er,
      metric: 'engagementRate',
      insight: `Engagement rate of ${er.toFixed(2)}% indicates highly resonant content.`,
    })
  } else if (er < 1) {
    weakSignals.push({
      type: 'engagement',
      label: 'Low Engagement',
      value: er,
      metric: 'engagementRate',
      insight: `Engagement rate of ${er.toFixed(2)}% suggests content isn't resonating.`,
    })
  }

  if (bmImpRatio > 0.01) {
    strongSignals.push({
      type: 'bookmarks',
      label: 'High Save Rate',
      value: bmImpRatio,
      metric: 'bookmarksPerImpression',
      insight: 'High bookmark rate — audience finds this content worth revisiting.',
    })
  } else if (m.bookmarks != null && m.bookmarks > 0 && bmImpRatio <= 0.001) {
    weakSignals.push({
      type: 'bookmarks',
      label: 'Low Save Rate',
      value: bmImpRatio,
      metric: 'bookmarksPerImpression',
      insight: 'Very few saves relative to impressions — content may lack lasting value.',
    })
  }

  if (verifiedRatio > 0.3) {
    strongSignals.push({
      type: 'audience',
      label: 'Quality Audience',
      value: verifiedRatio,
      metric: 'verifiedFollowerRatio',
      insight: `${(verifiedRatio * 100).toFixed(1)}% of followers are verified — high-quality audience.`,
    })
  } else if (verifiedRatio > 0 && verifiedRatio < 0.05) {
    weakSignals.push({
      type: 'audience',
      label: 'Low Verified Ratio',
      value: verifiedRatio,
      metric: 'verifiedFollowerRatio',
      insight: 'Very few verified followers — audience authority may be low.',
    })
  }

  if (activeRatio > 0.5) {
    strongSignals.push({
      type: 'audience',
      label: 'Highly Active Audience',
      value: activeRatio,
      metric: 'activeFollowerRatio',
      insight: `${(activeRatio * 100).toFixed(0)}% of followers are active — strong reach potential.`,
    })
  } else if (activeRatio > 0 && activeRatio < 0.1) {
    weakSignals.push({
      type: 'audience',
      label: 'Low Active Audience',
      value: activeRatio,
      metric: 'activeFollowerRatio',
      insight: 'Few followers are active — consider engagement campaigns.',
    })
  }

  if (replyImpRatio > 0.005) {
    strongSignals.push({
      type: 'conversation',
      label: 'High Reply Rate',
      value: replyImpRatio,
      metric: 'repliesPerImpression',
      insight: 'Strong conversation rate — audience wants to engage in dialogue.',
    })
  }

  if (pvImpRatio > 0.1) {
    strongSignals.push({
      type: 'discovery',
      label: 'High Profile Visit Rate',
      value: pvImpRatio,
      metric: 'profileVisitsPerImpression',
      insight: 'Impression-to-profile-visit conversion is strong — content drives discovery.',
    })
  }

  if (repostShareRatio > 2) {
    strongSignals.push({
      type: 'amplification',
      label: 'Strong Repost/Share Ratio',
      value: repostShareRatio,
      metric: 'repostsPerShare',
      insight: 'Content is reshared more than shared — organic amplification working.',
    })
  }

  // Audience patterns
  const audiencePatterns: AudiencePattern[] = []
  const replyPct = ratio(m.replies, m.engagements) * 100
  const likePct = ratio(m.likes, m.engagements) * 100
  const repostPct = ratio(m.reposts, m.engagements) * 100
  const bookmarkPct = ratio(m.bookmarks, m.engagements) * 100

  if (likePct > 50) {
    audiencePatterns.push({
      type: 'engagement_distribution',
      label: 'Like-Heavy Audience',
      percentage: Math.round(likePct),
      description: 'Audience primarily shows support through likes — low-effort engagement.',
    })
  }
  if (replyPct > 10) {
    audiencePatterns.push({
      type: 'engagement_distribution',
      label: 'Conversational Audience',
      percentage: Math.round(replyPct),
      description: 'Significant reply volume indicates a conversational community.',
    })
  }
  if (bookmarkPct > 15) {
    audiencePatterns.push({
      type: 'engagement_distribution',
      label: 'Save-Oriented Audience',
      percentage: Math.round(bookmarkPct),
      description: 'High bookmark share — audience values reference content.',
    })
  }
  if (audiencePatterns.length === 0) {
    audiencePatterns.push({
      type: 'engagement_distribution',
      label: 'Balanced Engagement',
      percentage: 100,
      description: 'Engagement is distributed across likes, replies, reposts, and bookmarks.',
    })
  }

  // Topic opportunities
  const topicOpportunities: TopicOpportunity[] = deriveTopicOpportunities(input.goal, input.topPosts)

  // CTA opportunities
  const ctaOpportunities: CtaOpportunity[] = deriveCtaOpportunities(input.goal)

  // Risks
  const risks: Risk[] = []
  if (likePct > 80) {
    risks.push({
      area: 'engagement_depth',
      severity: 'medium',
      description: 'Over 80% of engagement is likes — low conversational depth.',
    })
  }
  if (er < 0.5) {
    risks.push({
      area: 'reach',
      severity: 'high',
      description: 'Extremely low engagement rate — content may not be reaching the right audience.',
    })
  }
  if (m.followers != null && m.impressions != null && m.impressions < m.followers * 2) {
    risks.push({
      area: 'reach',
      severity: 'medium',
      description: 'Impressions are less than 2x follower count — limited viral/non-follower reach.',
    })
  }
  if (bmImpRatio > 0.05) {
    risks.push({
      area: 'conversion',
      severity: 'low',
      description: 'Very high save rate with no corresponding CTA — audience hoarding content without acting.',
    })
  }
  if (risks.length === 0) {
    risks.push({
      area: 'general',
      severity: 'low',
      description: 'No significant risks detected — engagement patterns are healthy.',
    })
  }

  // Next actions
  const nextActions: NextAction[] = []
  if (er < 2) {
    nextActions.push({
      priority: 'high',
      action: 'Test new content formats to improve engagement rate',
      impact: 'Could boost engagement rate by 1-3 percentage points',
    })
  }
  if (bmImpRatio > 0.01) {
    nextActions.push({
      priority: 'high',
      action: 'Add CTAs to top-performing saved posts',
      impact: 'Convert saved content into replies, sign-ups, or shares',
    })
  }
  if (replyImpRatio < 0.002) {
    nextActions.push({
      priority: 'medium',
      action: 'Include reply prompts and questions in posts',
      impact: 'Increase reply rate and community conversation',
    })
  }
  if (m.followers != null && m.followers < 5000) {
    nextActions.push({
      priority: 'medium',
      action: 'Focus on follower growth through engagement pods and collaborations',
      impact: 'Build critical mass for organic reach',
    })
  }
  nextActions.push({
    priority: 'low',
    action: 'Schedule top-performing content for republishing',
    impact: 'Extend lifespan of high-engagement posts',
  })

  // Summary
  const strongCount = strongSignals.length
  const weakCount = weakSignals.length
  const summary = `Analysis of @${input.handle} shows ${strongCount} strong signal${strongCount !== 1 ? 's' : ''} and ${weakCount} weak signal${weakCount !== 1 ? 's' : ''}. ` +
    `With an engagement rate of ${er.toFixed(2)}%, the account has ${er > 2 ? 'solid' : 'low'} audience resonance. ` +
    `Goal "${input.goal}" suggests focusing on ${topicOpportunities.slice(0, 2).map(t => t.topic).join(' and ')}. ` +
    `${nextActions.length > 0 ? `Top priority: ${nextActions[0].action}.` : ''}`

  return {
    summary,
    strongSignals,
    weakSignals,
    audiencePatterns,
    topicOpportunities,
    ctaOpportunities,
    risks,
    nextActions,
  }
}

function deriveTopicOpportunities(goal: string, topPosts?: XTopPost[]): TopicOpportunity[] {
  const goalLower = goal.toLowerCase()
  const topics: TopicOpportunity[] = []

  const goalTopicMap: Record<string, string[]> = {
    grow: ['audience growth', 'visibility'],
    monetize: ['monetization', 'products', 'services'],
    launch: ['product launch', 'announcement'],
    authority: ['thought leadership', 'expertise'],
    community: ['community building', 'engagement'],
    lead: ['lead generation', 'conversions'],
    brand: ['brand awareness', 'storytelling'],
  }

  for (const [key, suggestions] of Object.entries(goalTopicMap)) {
    if (goalLower.includes(key)) {
      for (const topic of suggestions) {
        if (!topics.find(t => t.topic === topic)) {
          topics.push({
            topic,
            relevance: 0.9,
            angle: `Create content around ${topic} aligned with ${goal}`,
          })
        }
      }
    }
  }

  if (topPosts && topPosts.length > 0) {
    const topTexts = topPosts.slice(0, 3).map(p => p.text.toLowerCase())
    for (const text of topTexts) {
      const words = text.split(/\s+/).filter(w => w.length > 5)
      const freq: Record<string, number> = {}
      for (const w of words) {
        freq[w] = (freq[w] || 0) + 1
      }
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 2)
      for (const [word] of sorted) {
        if (!topics.find(t => t.topic.toLowerCase().includes(word))) {
          topics.push({
            topic: word.charAt(0).toUpperCase() + word.slice(1),
            relevance: 0.7,
            angle: `Expand on "${word}" themes that resonated with your audience`,
          })
        }
      }
    }
  }

  if (topics.length === 0) {
    topics.push({
      topic: 'Content Strategy',
      relevance: 0.5,
      angle: 'Develop a consistent content cadence aligned with your goals',
    })
  }

  return topics.slice(0, 5)
}

function deriveCtaOpportunities(goal: string): CtaOpportunity[] {
  const goalLower = goal.toLowerCase()
  const ctas: CtaOpportunity[] = []

  if (goalLower.includes('grow') || goalLower.includes('follow')) {
    ctas.push({ type: 'follow', label: 'Follow to grow', description: 'Encourage follows with value-first content' })
  }
  if (goalLower.includes('monetize') || goalLower.includes('sell') || goalLower.includes('product')) {
    ctas.push({ type: 'product', label: 'Product pitch', description: 'Direct CTAs to product pages or waitlists' })
  }
  if (goalLower.includes('lead') || goalLower.includes('signup') || goalLower.includes('newsletter')) {
    ctas.push({ type: 'signup', label: 'Sign-up prompt', description: 'Drive newsletter or waitlist sign-ups' })
  }
  if (goalLower.includes('community') || goalLower.includes('engage')) {
    ctas.push({ type: 'reply', label: 'Reply to engage', description: 'Ask questions to spark discussion' })
  }
  if (goalLower.includes('launch') || goalLower.includes('announce')) {
    ctas.push({ type: 'announcement', label: 'Launch CTA', description: 'Clear call to action for launches and announcements' })
  }
  if (goalLower.includes('authority') || goalLower.includes('thought')) {
    ctas.push({ type: 'share', label: 'Share to amplify', description: 'Encourage reposts and shares to build authority' })
  }

  if (ctas.length === 0) {
    ctas.push({ type: 'engage', label: 'General engagement', description: 'Ask audience what they think' })
  }

  return ctas
}

// ── generateContentPlan ──────────────────────────────

export function generateContentPlan(input: {
  handle: string
  goal: string
  analysis: Record<string, unknown>
  week: string
  cadence: string
}): ContentPlanResult {
  const goalLower = input.goal.toLowerCase()
  const cadenceNum = parseInt(input.cadence) || 5

  const pillars: ContentPillar[] = [
    {
      name: 'Educational',
      description: 'Teach your audience something valuable related to your goal',
      postAngles: ['How-to guides', 'Tips & tricks', 'Industry insights', 'Myth busting'],
    },
    {
      name: 'Engagement',
      description: 'Spark conversation and community interaction',
      postAngles: ['Polls & questions', 'Controversial takes', 'Behind the scenes', 'User spotlights'],
    },
    {
      name: 'Promotional',
      description: 'Drive action toward your goal',
      postAngles: ['Product highlights', 'Case studies', 'Testimonials', 'Limited offers'],
    },
  ]

  if (goalLower.includes('authority') || goalLower.includes('thought')) {
    pillars.push({
      name: 'Thought Leadership',
      description: 'Establish expertise and unique perspective',
      postAngles: ['Original frameworks', 'Industry predictions', 'Personal stories', 'Op-eds'],
    })
  }

  if (goalLower.includes('community') || goalLower.includes('grow')) {
    pillars.push({
      name: 'Community',
      description: 'Build and nurture your audience',
      postAngles: ['User generated content', 'Community challenges', 'AMA sessions', 'Collaborations'],
    })
  }

  const pillar = goalLower.includes('monetize') || goalLower.includes('product')
    ? 'conversion'
    : goalLower.includes('authority')
      ? 'authority'
      : 'growth'

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const postingCadence: PostingCadence[] = []
  for (let i = 0; i < Math.min(cadenceNum, 7); i++) {
    const pillarIdx = i % pillars.length
    postingCadence.push({
      day: daysOfWeek[i],
      times: 1,
      theme: `${pillars[pillarIdx].name} content`,
    })
  }

  const weeklyTheme = `${input.goal}-focused content with emphasis on ${pillar}`
  const postAngles: PostAngle[] = pillars.flatMap(p =>
    p.postAngles.map(angle => ({
      angle,
      examples: [`Example post using "${angle}" angle`],
    }))
  )

  const ctaStrategy: CtaStrategy[] = [
    {
      placement: 'End of educational posts',
      type: 'soft',
      message: 'What do you think? Share your experience below.',
    },
    {
      placement: 'Promotional posts',
      type: 'direct',
      message: goalLower.includes('monetize') ? 'Check the link to get started.' : 'Follow for more insights.',
    },
    {
      placement: 'Engagement posts',
      type: 'interactive',
      message: 'Tag someone who needs to see this.',
    },
  ]

  return {
    weeklyTheme,
    contentPillars: pillars,
    postAngles,
    postingCadence,
    ctaStrategy,
  }
}

// ── generatePostDrafts ───────────────────────────────

const draftTemplates = [
  {
    angle: 'Education',
    template: (topic: string, goal: string) =>
      `Most people get "${topic}" wrong when it comes to ${goal}.\n\nHere's what actually works:\n\n1. Start with why\n2. Focus on value\n3. Iterate based on data\n\nSave this for later.`,
  },
  {
    angle: 'Hot Take',
    template: (topic: string, _goal: string) =>
      `Unpopular opinion: "${topic}" is overrated.\n\nHere's what I'd focus on instead:\n\nA thread 🧵`,
  },
  {
    angle: 'Story',
    template: (topic: string, goal: string) =>
      `I spent months trying to figure out ${topic} for ${goal}.\n\nHere's what I learned:\n\n1. It takes longer than expected\n2. Consistency > intensity\n3. Listen to your audience`,
  },
  {
    angle: 'Data',
    template: (topic: string, goal: string) =>
      `The data on ${topic} for ${goal} is clear:\n\n• Most people overlook the basics\n• Consistency drives results\n• Engagement > vanity metrics\n\nHere's the breakdown 👇`,
  },
  {
    angle: 'List',
    template: (topic: string, goal: string) =>
      `${topic} isn't complicated. Here's a simple framework for ${goal}:\n\n1. Define your goal\n2. Know your audience\n3. Create value first\n4. Optimize over time`,
  },
]

export function generatePostDrafts(input: {
  goal: string
  voice: string
  topics: string[]
  count: number
  maxLength: number
}): PostDraftsResult {
  const count = Math.max(1, Math.min(input.count, 20))
  const drafts: PostDraft[] = []

  for (let i = 0; i < count; i++) {
    const template = draftTemplates[i % draftTemplates.length]
    const topic = input.topics[i % input.topics.length] || 'growth'
    const text = template.template(topic, input.goal)
    const truncated = text.length > input.maxLength ? text.slice(0, input.maxLength - 3) + '...' : text

    drafts.push({
      angle: template.angle,
      text: truncated,
      cta: input.voice === 'professional' ? 'Share your thoughts below.' : 'Drop a comment or tag a friend!',
      risk: i % 3 === 0 ? 'low' : i % 3 === 1 ? 'medium' : 'high',
    })
  }

  return { drafts }
}

// ── generateExperiments ──────────────────────────────

const experimentTemplates = [
  {
    name: 'Content Format A/B Test',
    posts: (goal: string) => [`Long-form thread on ${goal}`, `Short punchy post on ${goal}`, `Visual carousel on ${goal}`],
  },
  {
    name: 'Posting Time Optimization',
    posts: (_goal: string) => ['Morning post (7-9am)', 'Lunch post (12-1pm)', 'Evening post (6-8pm)'],
  },
  {
    name: 'CTA Style Test',
    posts: (goal: string) => [`Soft CTA variant on ${goal}`, `Direct CTA variant on ${goal}`, `Question CTA variant on ${goal}`],
  },
]

export function generateExperiments(input: {
  goal: string
  hypotheses: string[]
  durationDays: number
}): ExperimentsResult {
  const experiments: Experiment[] = []

  for (let i = 0; i < input.hypotheses.length; i++) {
    const template = experimentTemplates[i % experimentTemplates.length]
    const review = new Date(Date.now() + input.durationDays * 86400000)

    experiments.push({
      name: `${template.name}: "${input.hypotheses[i].slice(0, 40)}"`,
      hypothesis: input.hypotheses[i],
      posts: template.posts(input.goal),
      successMetric: 'engagement_rate',
      reviewDate: review.toISOString().split('T')[0],
    })
  }

  if (experiments.length === 0) {
    experiments.push({
      name: 'Baseline content experiment',
      hypothesis: 'Increasing posting frequency by 2x will improve total engagement',
      posts: ['Post once daily', 'Post twice daily', 'Post three times daily'],
      successMetric: 'total_engagements',
      reviewDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    })
  }

  return { experiments }
}

// ── generateReport ───────────────────────────────────

export function generateReport(input: {
  handle: string
  goal: string
  metrics: XMetrics
  topPosts: XTopPost[]
  period: string
}): ReportResult {
  const analysis = analyzeSignals({
    handle: input.handle,
    goal: input.goal,
    metrics: input.metrics,
    topPosts: input.topPosts,
  })

  const contentPlan = generateContentPlan({
    handle: input.handle,
    goal: input.goal,
    analysis: analysis as unknown as Record<string, unknown>,
    week: 'next',
    cadence: '5',
  })

  const drafts = generatePostDrafts({
    goal: input.goal,
    voice: 'conversational',
    topics: analysis.topicOpportunities.map(t => t.topic),
    count: 3,
    maxLength: 280,
  })

  const experiments = generateExperiments({
    goal: input.goal,
    hypotheses: ['Increase posting frequency improves reach', 'Video content outperforms text', 'Threads drive more saves'],
    durationDays: 14,
  })

  const scorecard: ScorecardItem[] = [
    { metric: 'Engagement Rate', value: `${analysis.strongSignals.find(s => s.metric === 'engagementRate')?.value.toFixed(2) ?? (input.metrics.engagementRate ?? 0).toFixed(2)}%`, signal: analysis.strongSignals.some(s => s.metric === 'engagementRate') ? 'strong' : 'weak' },
    { metric: 'Strong Signals', value: String(analysis.strongSignals.length), signal: analysis.strongSignals.length >= 3 ? 'strong' : analysis.strongSignals.length >= 1 ? 'neutral' : 'weak' },
    { metric: 'Weak Signals', value: String(analysis.weakSignals.length), signal: analysis.weakSignals.length === 0 ? 'strong' : analysis.weakSignals.length <= 2 ? 'neutral' : 'weak' },
    { metric: 'Audience Quality', value: `${(analysis.audiencePatterns[0]?.percentage ?? 50)}% active`, signal: 'neutral' },
  ]

  const executiveSummary = `Growth Intelligence Report for @${input.handle}\n` +
    `Period: ${input.period}\nGoal: ${input.goal}\n\n` +
    `${analysis.summary}\n\n` +
    `Scorecard: ${scorecard.filter(s => s.signal === 'strong').length} strong, ` +
    `${scorecard.filter(s => s.signal === 'neutral').length} neutral, ` +
    `${scorecard.filter(s => s.signal === 'weak').length} weak signals.\n\n` +
    `Recommended experiments: ${experiments.experiments.length} to run over ${input.topPosts.length > 0 ? 'next two weeks' : 'the next period'}.`

  return {
    executiveSummary,
    scorecard,
    signals: {
      strong: analysis.strongSignals,
      weak: analysis.weakSignals,
    },
    contentPlan,
    drafts: drafts.drafts,
    experiments: experiments.experiments,
    nextActions: analysis.nextActions,
  }
}
