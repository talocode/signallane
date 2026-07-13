# SignalLane — X Growth Intelligence

**SignalLane** is Talocode's X (Twitter) growth intelligence product. It turns X account analytics into growth signals, content experiments, and product distribution strategy for builders.

## Features

- **Analyze** — Detect strong and weak signals from X metrics
- **Content Plans** — Generate weekly content strategies aligned to your goals
- **Post Drafts** — Generate draft posts with CTAs and risk assessment
- **Experiments** — Design content experiments with success metrics
- **Reports** — Comprehensive growth intelligence reports

## Quick Start

```bash
# Install dependencies
pnpm install

# Set your API key
export TALOCODE_API_KEY=sk-your-key-here
export PORT=4001

# Start server
pnpm dev
```

## Auth

SignalLane uses Talocode API keys. Provide via:

```
Authorization: Bearer sk-your-key-here
```

or

```
X-Api-Key: sk-your-key-here
```

## Routes

All routes are under `/v1/signallane/`.

### Health

```bash
curl http://localhost:4001/v1/signallane/health
```

### Analyze

```bash
curl -X POST http://localhost:4001/v1/signallane/x/analyze \
  -H "Authorization: Bearer $TALOCODE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "elonmusk",
    "goal": "grow audience",
    "metrics": {
      "followers": 100000,
      "impressions": 5000000,
      "engagementRate": 4.2,
      "engagements": 210000
    },
    "topPosts": [
      {"text": "Great thread about AI", "impressions": 50000, "likes": 3000}
    ]
  }'
```

### Content Plan

```bash
curl -X POST http://localhost:4001/v1/signallane/x/content-plan \
  -H "Authorization: Bearer $TALOCODE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "elonmusk",
    "goal": "grow audience",
    "analysis": {},
    "week": "2026-W27",
    "cadence": "5"
  }'
```

### Post Drafts

```bash
curl -X POST http://localhost:4001/v1/signallane/x/post-drafts \
  -H "Authorization: Bearer $TALOCODE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "grow audience",
    "voice": "conversational",
    "topics": ["AI", "growth", "content"],
    "count": 5,
    "maxLength": 280
  }'
```

### Experiments

```bash
curl -X POST http://localhost:4001/v1/signallane/x/experiments \
  -H "Authorization: Bearer $TALOCODE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "grow audience",
    "hypotheses": [
      "Threads outperform single posts",
      "Video content drives more engagement"
    ],
    "durationDays": 14
  }'
```

### Report

```bash
curl -X POST http://localhost:4001/v1/signallane/x/report \
  -H "Authorization: Bearer $TALOCODE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "elonmusk",
    "goal": "grow audience",
    "metrics": {
      "followers": 100000,
      "impressions": 5000000,
      "engagementRate": 4.2
    },
    "topPosts": [
      {"text": "Great thread about AI", "impressions": 50000, "likes": 3000}
    ],
    "period": "30d"
  }'
```

## Deterministic Engine

SignalLane uses a pure, synchronous, deterministic analysis engine. No LLM or external provider is required. Given the same input metrics, the engine always produces the same output. This makes it reliable, predictable, and fast.

## Self-Hosting

SignalLane is open source and self-hostable:

1. Clone the repo
2. `pnpm install`
3. Set `TALOCODE_API_KEY` and `PORT`
4. `pnpm start`

For hosted billing via Talocode Cloud, set `TALOCODE_BASE_URL=https://api.talocode.site`.

## Talocode Domains

| Domain | Purpose |
|--------|---------|
| [talocode.site](https://talocode.site) | Main site / homepage |
| [docs.talocode.site](https://docs.talocode.site) | Documentation |
| [api.talocode.site](https://api.talocode.site) | API endpoint |
| [dashboard.talocode.site](https://dashboard.talocode.site) | Cloud dashboard |
| [stacklane.talocode.site](https://stacklane.talocode.site) | Stacklane platform |
| [dashboard.talocode.site](https://dashboard.talocode.site) | Dashboard |

## License

MIT — part of the [Talocode](https://talocode.site) ecosystem.

## Support

Open-source Talocode products are built and maintained by Abdulmuiz Adeyemo.

Sponsor the work: https://github.com/sponsors/Abdulmuiz44
