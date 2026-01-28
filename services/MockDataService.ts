/**
 * MockDataService.ts - Service thay thế Firebase cho MVP Demo
 * Load data từ mockData.ts, save vào LocalStorage
 */

import { UserProfile, Hub, Campaign, GardenData } from '../types';
import { DEMO_USERS, DEMO_HUBS, DEMO_CAMPAIGNS, DEMO_GARDENS, DEMO_WORKERS } from '../data/mockData';
import * as LocalStorage from './LocalStorageService';

// ============ USER ============

export function getUser(userId: string): UserProfile | null {
    return DEMO_USERS[userId] || null;
}

export function getAllDemoUsers(): UserProfile[] {
    return Object.values(DEMO_USERS);
}

export function getCurrentUser(): UserProfile | null {
    const userId = LocalStorage.getCurrentUserId();
    if (!userId) return null;
    return getUser(userId);
}

// ============ HUB ============

export function getHub(hubId: string): Hub | null {
    return DEMO_HUBS[hubId] || null;
}

export function getAllHubs(): Hub[] {
    return Object.values(DEMO_HUBS);
}

export function getUserHub(userId: string): Hub | null {
    const user = getUser(userId);
    if (!user?.hubId) return null;
    return getHub(user.hubId);
}

// ============ CAMPAIGNS ============

export function getCampaigns(hubId: string): Campaign[] {
    return DEMO_CAMPAIGNS.filter(c => c.hubId === hubId && c.status === 'ACTIVE');
}

export function getAllCampaigns(): Campaign[] {
    return DEMO_CAMPAIGNS;
}

export function getCampaign(campaignId: string): Campaign | null {
    return DEMO_CAMPAIGNS.find(c => c.id === campaignId) || null;
}

export function getCampaignWithUpdatedQty(campaignId: string): Campaign | null {
    const campaign = getCampaign(campaignId);
    if (!campaign) return null;

    // Add LocalStorage orders to current quantity
    const additionalQty = LocalStorage.getCampaignOrderCount(campaignId);
    return {
        ...campaign,
        currentQuantity: campaign.currentQuantity + additionalQty
    };
}

// ============ GARDENS ============

export function getDefaultGardens(): GardenData[] {
    return DEMO_GARDENS;
}

// ============ WORKERS ============

export function getWorkers(hubId: string): UserProfile[] {
    return DEMO_WORKERS.filter(w => w.hubId === hubId);
}

export function getAvailableWorkers(hubId: string): UserProfile[] {
    return DEMO_WORKERS.filter(w =>
        w.hubId === hubId &&
        w.workerProfile?.availability === 'available'
    );
}

// ============ DEMO LOGIN ============

export function demoLogin(role: 'farmer' | 'hub_leader' | 'worker' | 'agent'): UserProfile {
    const userMap = {
        farmer: 'farmer_demo',
        hub_leader: 'hub_leader_demo',
        worker: 'worker_demo',
        agent: 'agent_demo'
    };

    const userId = userMap[role];
    LocalStorage.setCurrentUser(userId);
    LocalStorage.initializeDemoData(userId);

    return DEMO_USERS[userId];
}

export function demoLogout(): void {
    LocalStorage.clearSession();
}

export function isLoggedIn(): boolean {
    return LocalStorage.isDemoMode() && LocalStorage.getCurrentUserId() !== null;
}
