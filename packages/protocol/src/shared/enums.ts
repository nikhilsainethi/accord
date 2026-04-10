import { z } from "zod";

export const ActorType = {
  User: "user",
  Application: "application",
  Agent: "agent",
  System: "system"
} as const;

export type ActorType = (typeof ActorType)[keyof typeof ActorType];

export const actorTypeSchema = z.enum([
  ActorType.User,
  ActorType.Application,
  ActorType.Agent,
  ActorType.System
]);

export const RequesterActorType = {
  Application: ActorType.Application,
  Agent: ActorType.Agent
} as const;

export type RequesterActorType =
  (typeof RequesterActorType)[keyof typeof RequesterActorType];

export const requesterActorTypeSchema = z.enum([
  RequesterActorType.Application,
  RequesterActorType.Agent
]);

export const DeciderActorType = {
  User: ActorType.User,
  System: ActorType.System
} as const;

export type DeciderActorType =
  (typeof DeciderActorType)[keyof typeof DeciderActorType];

export const deciderActorTypeSchema = z.enum([
  DeciderActorType.User,
  DeciderActorType.System
]);

export const RiskLevel = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Critical: "critical"
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const riskLevelSchema = z.enum([
  RiskLevel.Low,
  RiskLevel.Medium,
  RiskLevel.High,
  RiskLevel.Critical
]);

export const DecisionOutcome = {
  Approved: "approved",
  Denied: "denied",
  Expired: "expired",
  Revoked: "revoked",
  Pending: "pending"
} as const;

export type DecisionOutcome =
  (typeof DecisionOutcome)[keyof typeof DecisionOutcome];

export const decisionOutcomeSchema = z.enum([
  DecisionOutcome.Approved,
  DecisionOutcome.Denied,
  DecisionOutcome.Expired,
  DecisionOutcome.Revoked,
  DecisionOutcome.Pending
]);

export const EnforcementMode = {
  Allow: "allow",
  RequireApproval: "require_approval",
  Deny: "deny"
} as const;

export type EnforcementMode =
  (typeof EnforcementMode)[keyof typeof EnforcementMode];

export const enforcementModeSchema = z.enum([
  EnforcementMode.Allow,
  EnforcementMode.RequireApproval,
  EnforcementMode.Deny
]);

export const GrantedScopeStatus = {
  Active: "active",
  Expired: "expired",
  Revoked: "revoked"
} as const;

export type GrantedScopeStatus =
  (typeof GrantedScopeStatus)[keyof typeof GrantedScopeStatus];

export const grantedScopeStatusSchema = z.enum([
  GrantedScopeStatus.Active,
  GrantedScopeStatus.Expired,
  GrantedScopeStatus.Revoked
]);

export const ActionProposalStatus = {
  Pending: "pending"
} as const;

export type ActionProposalStatus =
  (typeof ActionProposalStatus)[keyof typeof ActionProposalStatus];

export const actionProposalStatusSchema = z.enum([
  ActionProposalStatus.Pending
]);

export const RevocationType = {
  Scope: "scope",
  Approval: "approval"
} as const;

export type RevocationType =
  (typeof RevocationType)[keyof typeof RevocationType];

export const revocationTypeSchema = z.enum([
  RevocationType.Scope,
  RevocationType.Approval
]);

export const AuditObjectType = {
  ScopeRequest: "ScopeRequest",
  GrantedScope: "GrantedScope",
  ContextManifest: "ContextManifest",
  ActionProposal: "ActionProposal",
  ApprovalReceipt: "ApprovalReceipt",
  RevocationEvent: "RevocationEvent"
} as const;

export type AuditObjectType =
  (typeof AuditObjectType)[keyof typeof AuditObjectType];

export const auditObjectTypeSchema = z.enum([
  AuditObjectType.ScopeRequest,
  AuditObjectType.GrantedScope,
  AuditObjectType.ContextManifest,
  AuditObjectType.ActionProposal,
  AuditObjectType.ApprovalReceipt,
  AuditObjectType.RevocationEvent
]);
