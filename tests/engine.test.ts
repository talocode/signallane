import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  analyzeSignals,
  generateContentPlan,
  generatePostDrafts,
  generateExperiments,
  generateReport,
} from '../src/engine.js'

describe('analyzeSignals', () => {
  it('returns expected signal structure', () => {
    const result = analyzeSignals({
      handle: 'testacc',
      goal: 'grow audience',
      metrics: {
        followers: 1000,
        impressions: 50000,
        engagements: 1500,
      },
    })

    assert.ok(result.summary)
    assert.ok(Array.isArray(result.strongSignals))
    assert.ok(Array.isArray(result.weakSignals))
    assert.ok(Array.isArray(result.audiencePatterns))
    assert.ok(Array.isArray(result.topicOpportunities))
    assert.ok(Array.isArray(result.ctaOpportunities))
    assert.ok(Array.isArray(result.risks))
    assert.ok(Array.isArray(result.nextActions))
  })

  it('detects strong signals with high metrics', () => {
    const result = analyzeSignals({
      handle: 'topacc',
      goal: 'monetize audience',
      metrics: {
        followers: 50000,
        verifiedFollowers: 25000,
        activeFollowers: 40000,
        impressions: 500000,
        engagementRate: 8.5,
        engagements: 42500,
        profileVisits: 100000,
        replies: 5000,
        likes: 30000,
        reposts: 5000,
        bookmarks: 2500,
        shares: 1000,
      },
    })

    assert.ok(result.strongSignals.length >= 3)
    assert.ok(result.strongSignals.some(s => s.metric === 'engagementRate'))
    assert.ok(result.strongSignals.some(s => s.metric === 'verifiedFollowerRatio'))
    assert.ok(result.strongSignals.some(s => s.metric === 'activeFollowerRatio'))
  })

  it('detects weak signals with low metrics', () => {
    const result = analyzeSignals({
      handle: 'lowacc',
      goal: 'grow audience',
      metrics: {
        followers: 100,
        impressions: 500,
        engagements: 2,
        engagementRate: 0.4,
      },
    })

    assert.ok(result.weakSignals.length >= 1)
    assert.ok(result.weakSignals.some(s => s.metric === 'engagementRate'))
  })

  it('empty metrics returns default/low signals', () => {
    const result = analyzeSignals({
      handle: 'emptyacc',
      goal: 'test',
      metrics: {},
    })

    assert.equal(result.strongSignals.length, 0)
    assert.ok(result.weakSignals.length >= 1)
    assert.ok(result.audiencePatterns.length >= 1)
    assert.ok(result.topicOpportunities.length >= 1)
    assert.ok(result.risks.length >= 1)
    assert.ok(result.nextActions.length >= 1)
  })

  it('very high metrics returns strong signals', () => {
    const result = analyzeSignals({
      handle: 'megaacc',
      goal: 'brand awareness',
      metrics: {
        followers: 1000000,
        verifiedFollowers: 800000,
        activeFollowers: 900000,
        impressions: 20000000,
        engagementRate: 12.0,
        engagements: 2400000,
        profileVisits: 5000000,
        replies: 200000,
        likes: 1800000,
        reposts: 300000,
        bookmarks: 500000,
        shares: 50000,
      },
    })

    assert.ok(result.strongSignals.length >= 4)
    assert.ok(result.weakSignals.length === 0)
  })
})

describe('generateContentPlan', () => {
  it('returns weekly plan with pillars', () => {
    const result = generateContentPlan({
      handle: 'testacc',
      goal: 'grow audience',
      analysis: {},
      week: '2026-W27',
      cadence: '5',
    })

    assert.ok(result.weeklyTheme)
    assert.ok(result.contentPillars.length >= 3)
    assert.ok(result.postAngles.length >= 3)
    assert.ok(result.postingCadence.length > 0)
    assert.ok(result.ctaStrategy.length > 0)
  })
})

describe('generatePostDrafts', () => {
  it('returns requested number of drafts', () => {
    const result = generatePostDrafts({
      goal: 'grow audience',
      voice: 'conversational',
      topics: ['growth', 'engagement', 'content'],
      count: 5,
      maxLength: 280,
    })

    assert.equal(result.drafts.length, 5)
    for (const draft of result.drafts) {
      assert.ok(draft.angle)
      assert.ok(draft.text)
      assert.ok(draft.cta)
      assert.ok(draft.risk)
      assert.ok(draft.text.length <= 280)
    }
  })

  it('caps at 20 drafts', () => {
    const result = generatePostDrafts({
      goal: 'test',
      voice: 'professional',
      topics: ['test'],
      count: 100,
      maxLength: 500,
    })

    assert.equal(result.drafts.length, 20)
  })
})

describe('generateExperiments', () => {
  it('returns experiment plans', () => {
    const result = generateExperiments({
      goal: 'grow audience',
      hypotheses: ['Posting at different times increases reach', 'Video content gets more engagement'],
      durationDays: 14,
    })

    assert.equal(result.experiments.length, 2)
    for (const exp of result.experiments) {
      assert.ok(exp.name)
      assert.ok(exp.hypothesis)
      assert.ok(exp.posts.length >= 1)
      assert.ok(exp.successMetric)
      assert.ok(exp.reviewDate)
    }
  })

  it('returns default experiment when no hypotheses', () => {
    const result = generateExperiments({
      goal: 'test',
      hypotheses: [],
      durationDays: 14,
    })

    assert.equal(result.experiments.length, 1)
  })
})

describe('generateReport', () => {
  it('combines all sections', () => {
    const result = generateReport({
      handle: 'testacc',
      goal: 'grow audience',
      metrics: {
        followers: 5000,
        impressions: 100000,
        engagements: 3000,
        engagementRate: 3.0,
      },
      topPosts: [
        { text: 'Great post about growth strategies', impressions: 10000, likes: 500, replies: 50, bookmarks: 200 },
        { text: 'Another post about content creation', impressions: 8000, likes: 400, bookmarks: 150 },
      ],
      period: '30d',
    })

    assert.ok(result.executiveSummary)
    assert.ok(result.scorecard.length >= 3)
    assert.ok(result.signals.strong)
    assert.ok(result.signals.weak)
    assert.ok(result.contentPlan)
    assert.ok(result.drafts.length >= 1)
    assert.ok(result.experiments.length >= 1)
    assert.ok(result.nextActions.length >= 1)
  })
})
