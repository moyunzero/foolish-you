# Phase 1: 基础骨架与每日管道 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-16
**Phase:** 1-基础骨架与每日管道
**Areas discussed:** Expo SDK 与开发方式

---

## Expo SDK 与开发方式

### Q1: 日常真机开发方式

| Option | Description | Selected |
|--------|-------------|----------|
| Expo Go（推荐 MVP） | 扫码即跑，受商店 Expo Go SDK 限制 | ✓ |
| Development Build | 自打 dev 包，可用最新 SDK | |
| 主要用模拟器 | 模拟器为主 | |

**User's choice:** Expo Go

### Q2: SDK 目标版本

| Option | Description | Selected |
|--------|-------------|----------|
| SDK 54 + Expo Go（推荐） | 最快出 MVP，真机零摩擦 | ✓ |
| SDK 55 + Dev Build | 新架构，需 dev client | |
| 你决定 | Planner 按最少配置选型 | |

**User's choice:** SDK 54 + Expo Go

**Notes:** 用户未讨论路由、时区、占位深度、Zustand；这些记入 CONTEXT.md「Claude's Discretion」，默认遵循 PROJECT + research。

---

## Claude's Discretion

- 路由分流细节、dateKey 算法、game 占位形态、状态管理 — 未在 discuss 中展开

## Deferred Ideas

None
