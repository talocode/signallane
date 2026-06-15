# SignalLane

SignalLane is an open-source, local-first growth intelligence CLI/TUI for builders.

It helps creators, founders, engineers, and indie builders find better conversations, write sharper replies, generate hooks and angles, and grow on X without sounding like AI.

## Try it in 10 seconds

```bash
npx @talocode/signallane hooks --topic "AI tools"
```

## Install

```bash
npm install -g @talocode/signallane
signallane
```

Or just run it:

```bash
npx @talocode/signallane
```

## Local-first. No model required.

SignalLane v0.1.x works without an AI model, API key, X login, scraping, or hosted service. It uses local deterministic writing patterns first.

## Commands

```bash
signallane
signallane --version
signallane init
signallane doctor
signallane reply --from ./post.txt
signallane improve --text "your draft reply here"
signallane score --text "your reply here"
signallane angles --topic "AI coding agents"
signallane hooks --topic "AI tools" --count 20 --style builder
signallane examples
signallane profile set
signallane profile show
```

## Package

- Name: `@talocode/signallane`
- Version: `0.1.1`
- Binary: `signallane`
