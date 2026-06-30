import type { LeaseRecord } from "./property-types";
export const demoLeases: LeaseRecord[] = [{ id:"lease-hq", propertyId:"prop-hq", terms:"Office lease; metadata only", renewalDate:"2026-08-30", rentSchedule:"monthly", notices:["renewal window opens 90 days before renewal"], obligations:["insurance certificate", "maintenance coordination"], reminderOnly:true }];
export const upcomingLeaseRenewals = (leases:LeaseRecord[]) => leases;
