<!-- GSD:project-start source:PROJECT.md -->
## Project

**傻了么 (Silaomo)**

一款极简的每日益智 App：用户每天打开后，系统自动在 **数独（Sudoku）** 与 **二进制谜题（Binary Puzzle / Takuzu / Binairo）** 中随机分配一局，玩完或放弃后看到搞笑鼓励/嘲讽文案，第二天自动换新题。无社交、无排行榜，专注「今天这一局」的体验。

**Core Value:** 用户每天只需打开 App，就能玩到**唯一、确定、不重复**的今日谜题，并在结束时获得情绪化的结果反馈——简单、有仪式感、明天再来。

### Constraints

- **Tech stack**: Expo + TypeScript + expo-router + NativeWind — 一人可维护、热更新友好
- **Offline-first**: 谜题与进度均本地完成，无网络也能玩
- **Deterministic daily**: 同一自然日、同一设备得到相同「今日游戏」（基于日期种子）
- **Scope**: v1 仅两种谜题类型；扩展新游戏只需 `dailySelector` + 新 Grid 组件
- **Auth**: v1 游客优先；`expo-secure-store` / Supabase Auth 仅预留
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
| Layer | Choice | Version guidance |
|-------|--------|------------------|
| Runtime | Expo SDK | SDK 52+ (use `npx create-expo-app@latest`) |
| Language | TypeScript | strict mode |
| Routing | expo-router | v4 with SDK 52 |
| UI | NativeWind | v4 + Tailwind CSS 3.4 |
| Animation | react-native-reanimated | Expo-bundled compatible version |
| Gestures | react-native-gesture-handler | Peer of reanimated |
| State | Zustand (optional) | v5 — or React Context for MVP |
| Storage | @react-native-async-storage/async-storage | Expo install |
| Secure (future auth) | expo-secure-store | v1 — stub only in v1 |
| Notifications (v2) | expo-notifications | defer |
| Auth (v2) | expo-auth-session or @supabase/supabase-js | defer |
## Rationale
## Do NOT Use (v1)
| Avoid | Why |
|-------|-----|
| Custom native modules for puzzles | Unnecessary; JS is fast enough |
| Redux Toolkit | Overkill for daily state + grid |
| Remote config for daily puzzle | Violates offline-first; adds backend |
| moment.js / date-fns heavy usage | Use small `lib/date.ts` with `Intl` or lightweight helpers |
| Tamagui / Paper (v1) | User chose NativeWind; avoid dual UI systems |
## Init Command
# then: npx expo install expo-router nativewind tailwindcss react-native-reanimated react-native-gesture-handler @react-native-async-storage/async-storage
## Verification checklist
- [ ] `expo-doctor` passes after install
- [ ] Reanimated babel plugin in `babel.config.js`
- [ ] NativeWind `metro.config.js` per v4 docs
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
