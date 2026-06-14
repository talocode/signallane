# SignalLane

SignalLane is a local-first growth intelligence CLI for X/Twitter builders.

It helps creators, founders, engineers, and indie builders find better conversations, write sharper replies, and grow on X without sounding like AI.

## Install

```bash
npx @talocode/signallane
```

Or install globally:

```bash
npm install -g @talocode/signallane
signallane
```

## Commands

```bash
signallane
signallane --version
signallane --help
signallane init
signallane doctor
signallane reply
signallane reply --from ./post.txt
signallane improve --text "your draft reply here"
signallane score --text "your reply here"
signallane angles --topic "AI coding agents"
signallane hooks --topic "open source AI tools"
signallane profile set
signallane profile show
```

## Local storage

SignalLane stores data locally in:

```text
~/.signallane/
  profile.json
  drafts/
  history.json
```

No secrets. No telemetry. No network required.

## Release notes

See [CHANGELOG.md](./CHANGELOG.md) for the v0.1.0 release notes.
