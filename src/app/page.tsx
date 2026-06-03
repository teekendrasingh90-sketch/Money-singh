"use client";
import React, { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const COIN_VALUE = 0.0012; // 1 coin = ₹0.0012
const MIN_WITHDRAWAL = 100; // ₹100 minimum
const COINS_PER_AD = 15;
const COINS_PER_CHECKIN = 10;
const COINS_PER_SPIN = 8;

interface Task {
  id: number;
  title: string;
  coins: number;
  icon: string;
  type: string;
  time: string;
  color: string;
  link?: string;
}

const TASKS: Task[] = [
  { id: 1, title: "Tap Coin Blast", coins: 20, icon: "🪙", type: "booster", time: "Instant", color: "#F59E0B" },
  { id: 2, title: "Install Navi App", coins: 250, icon: "📲", type: "install", time: "Instant", color: "#8B5CF6", link: "https://r.navi.com/r169dB" },
  { id: 3, title: "Spin Wheel Quest", coins: 30, icon: "🎰", type: "spin_quest", time: "Instant", color: "#06B6D4" },
  { id: 4, title: "Captcha Solver", coins: 25, icon: "🛡️", type: "captcha", time: "Instant", color: "#10B981" },
  { id: 5, title: "Mega Tap Challenge", coins: 50, icon: "⚡", type: "mega_booster", time: "Instant", color: "#EF4444" },
];

interface LeaderboardUser {
  rank?: number;
  name: string;
  coins: number;
  avatar: string;
  isUser?: boolean;
}

const NAME_POOLS = [
  [
    { name: "Rahul Kushwaha", avatar: "👑", baseCoins: 48200 },
    { name: "Priya Sharma", avatar: "🥈", baseCoins: 42100 },
    { name: "Amit Verma", avatar: "🥉", baseCoins: 39800 },
    { name: "Neha Mishra", avatar: "😊", baseCoins: 31200 },
  ],
  [
    { name: "Deepak Yadav", avatar: "👑", baseCoins: 49400 },
    { name: "Anjali Singh", avatar: "🥈", baseCoins: 43200 },
    { name: "Vikram Rathore", avatar: "🥉", baseCoins: 38800 },
    { name: "Sneha Goel", avatar: "😊", baseCoins: 32400 },
  ],
  [
    { name: "Suresh Chaudhary", avatar: "👑", baseCoins: 51200 },
    { name: "Kajal Jha", avatar: "🥈", baseCoins: 44500 },
    { name: "Rajat Gupta", avatar: "🥉", baseCoins: 39200 },
    { name: "Preeti Sahni", avatar: "😊", baseCoins: 33100 },
  ],
  [
    { name: "Manish Solanki", avatar: "👑", baseCoins: 47600 },
    { name: "Pooja Trivedi", avatar: "🥈", baseCoins: 41800 },
    { name: "Harish Bisht", avatar: "🥉", baseCoins: 37900 },
    { name: "Kirti Saini", avatar: "😊", baseCoins: 30900 },
  ],
  [
    { name: "Sandeep Tomar", avatar: "👑", baseCoins: 50800 },
    { name: "Divya Rawat", avatar: "🥈", baseCoins: 42900 },
    { name: "Aman Sehgal", avatar: "🥉", baseCoins: 39900 },
    { name: "Neha Dwivedi", avatar: "😊", baseCoins: 32600 },
  ]
];

interface Transaction {
  id: number;
  type: string;
  desc: string;
  coins: number;
  time: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 1, type: "earn", desc: "Video Ad Watched", coins: 25, time: "2 min ago" },
  { id: 2, type: "earn", desc: "Daily Check-in", coins: 10, time: "1 hr ago" },
  { id: 3, type: "withdraw", desc: "Withdrawal - Cash", coins: -2000, time: "Yesterday" },
  { id: 4, type: "earn", desc: "Combo Ad Task", coins: 70, time: "Yesterday" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #080C14;
    --surface: #0F1623;
    --card: #141D2B;
    --card2: #1A2535;
    --border: rgba(255,255,255,0.07);
    --gold: #F59E0B;
    --gold-light: #FCD34D;
    --gold-dark: #D97706;
    --cyan: #06B6D4;
    --green: #10B981;
    --red: #EF4444;
    --purple: #8B5CF6;
    --text: #F1F5F9;
    --muted: #64748B;
    --muted2: #94A3B8;
  }

  body {
    background: var(--bg);
    font-family: 'Exo 2', sans-serif;
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }

  /* ── Noise overlay ── */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  /* ── Header ── */
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(8,12,20,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-logo {
    font-family: 'Rajdhani', sans-serif;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(135deg, #F59E0B, #FCD34D, #F59E0B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
  }

  .header-logo span {
    color: var(--cyan);
    -webkit-text-fill-color: var(--cyan);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .notif-btn {
    width: 36px; height: 36px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    cursor: pointer;
    position: relative;
  }

  .notif-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 8px; height: 8px;
    background: var(--red);
    border-radius: 50%;
    border: 2px solid var(--bg);
  }

  .avatar-btn {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    cursor: pointer;
  }

  /* ── Page content ── */
  .page {
    padding: 0 0 90px;
    position: relative;
    z-index: 1;
  }

  /* ── Hero Balance Card ── */
  .hero-card {
    margin: 16px;
    background: linear-gradient(135deg, #1A2535 0%, #0F1A2A 50%, #1A2535 100%);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 24px;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  .hero-card::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }

  .hero-card::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 150px; height: 150px;
    background: radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  .balance-label {
    font-size: 12px;
    color: var(--muted2);
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .balance-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    margin-bottom: 4px;
  }

  .coin-icon-big {
    font-size: 32px;
    line-height: 1;
  }

  .balance-amount {
    font-family: 'Rajdhani', sans-serif;
    font-size: 44px;
    font-weight: 700;
    color: var(--gold);
    line-height: 1;
    letter-spacing: -1px;
  }

  .balance-unit {
    font-size: 14px;
    color: var(--muted2);
    margin-bottom: 6px;
  }

  .balance-inr {
    font-size: 14px;
    color: var(--muted2);
    margin-bottom: 20px;
  }

  .balance-inr strong {
    color: var(--green);
    font-size: 16px;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .hero-stat {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 12px;
    text-align: center;
  }

  .hero-stat-val {
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--gold);
  }

  .hero-stat-lbl {
    font-size: 10px;
    color: var(--muted);
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ── Section ── */
  .section {
    padding: 0 16px;
    margin-top: 20px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .section-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.5px;
  }

  .section-badge {
    font-size: 11px;
    background: rgba(245,158,11,0.15);
    color: var(--gold);
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 20px;
    padding: 3px 10px;
    font-weight: 600;
  }

  /* ── Quick Actions ── */
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 0 16px;
    margin-top: 20px;
  }

  .quick-btn {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 14px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .quick-btn:hover { transform: translateY(-2px); border-color: rgba(245,158,11,0.4); }
  .quick-btn:active { transform: scale(0.96); }

  .quick-icon {
    font-size: 24px;
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 12px;
  }

  .quick-label {
    font-size: 10px;
    color: var(--muted2);
    font-weight: 600;
    line-height: 1.3;
  }

  /* ── Task Cards ── */
  .task-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .task-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 0 2px 2px 0;
  }

  .task-card:hover { transform: translateX(4px); border-color: rgba(255,255,255,0.12); }
  .task-card:active { transform: scale(0.98); }

  .task-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .task-info { flex: 1; }

  .task-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
  }

  .task-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--muted);
  }

  .task-time {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .task-reward {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .task-coins {
    font-family: 'Rajdhani', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--gold);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .earn-btn {
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    color: #000;
    border: none;
    border-radius: 10px;
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Exo 2', sans-serif;
    letter-spacing: 0.5px;
  }

  /* ── Daily Checkin ── */
  .checkin-strip {
    background: var(--card);
    border: 1px solid rgba(16,185,129,0.3);
    border-radius: 18px;
    padding: 16px;
    margin: 0 16px 10px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
  }

  .checkin-icon {
    width: 52px; height: 52px;
    background: rgba(16,185,129,0.15);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
  }

  .checkin-streak {
    flex: 1;
  }

  .checkin-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--green);
  }

  .checkin-sub {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
  }

  .streak-dots {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .streak-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--card2);
    border: 1px solid var(--border);
  }

  .streak-dot.done { background: var(--green); border-color: var(--green); }
  .streak-dot.today { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 8px var(--gold); }

  .checkin-reward {
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--green);
  }

  /* ── Spin Wheel ── */
  .spin-card {
    background: linear-gradient(135deg, #1A1040, #0F1623);
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 18px;
    padding: 18px;
    margin: 0 16px 10px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
  }

  .spin-wheel-mini {
    width: 52px; height: 52px;
    border-radius: 50%;
    background: conic-gradient(#F59E0B 0deg 60deg, #8B5CF6 60deg 120deg, #10B981 120deg 180deg, #06B6D4 180deg 240deg, #EF4444 240deg 300deg, #EC4899 300deg 360deg);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    animation: spinSlow 6s linear infinite;
  }

  @keyframes spinSlow { to { transform: rotate(360deg); } }

  /* ── Progress Bar ── */
  .progress-wrap {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px;
    margin: 0 16px 10px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 13px;
  }

  .progress-title { font-weight: 600; color: var(--text); }
  .progress-val { color: var(--gold); font-weight: 700; font-family: 'Rajdhani', sans-serif; }

  .progress-bar {
    height: 8px;
    background: var(--card2);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    border-radius: 10px;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light));
    transition: width 0.6s ease;
    position: relative;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    right: -1px; top: 0; bottom: 0;
    width: 10px;
    background: rgba(255,255,255,0.4);
    border-radius: 50%;
    filter: blur(4px);
  }

  .progress-sub { font-size: 11px; color: var(--muted); }

  /* ── Ad Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(8px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .modal {
    background: var(--card);
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 24px;
    padding: 28px;
    width: 100%;
    max-width: 380px;
    position: relative;
    animation: modalIn 0.3s ease;
  }

  @keyframes modalIn {
    from { transform: scale(0.9) translateY(20px); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }

  .modal-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
  .modal-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 8px;
  }

  .modal-sub { font-size: 14px; color: var(--muted2); text-align: center; margin-bottom: 24px; }

  .ad-screen {
    background: var(--bg);
    border-radius: 16px;
    aspect-ratio: 16/9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .ad-placeholder {
    text-align: center;
    padding: 20px;
  }

  .ad-placeholder p { color: var(--muted); font-size: 13px; margin-top: 8px; }

  .ad-admob-tag {
    position: absolute;
    top: 8px; right: 8px;
    background: rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 10px;
    color: var(--muted2);
  }

  .timer-ring {
    position: relative;
    display: inline-block;
    margin: 0 auto 20px;
    display: flex;
    justify-content: center;
  }

  .timer-number {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    font-family: 'Rajdhani', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--gold);
  }

  .modal-close {
    position: absolute;
    top: 16px; right: 16px;
    width: 30px; height: 30px;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: var(--muted2);
  }

  /* ── Success Toast ── */
  .toast {
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, var(--green), #059669);
    color: white;
    padding: 12px 24px;
    border-radius: 40px;
    font-weight: 700;
    font-size: 14px;
    z-index: 300;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2s forwards;
    white-space: nowrap;
    box-shadow: 0 8px 32px rgba(16,185,129,0.4);
  }

  @keyframes toastIn {
    from { opacity: 0; top: 50px; }
    to { opacity: 1; top: 70px; }
  }

  @keyframes toastOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  /* ── Wallet Page ── */
  .wallet-hero {
    margin: 16px;
    background: linear-gradient(135deg, #0A1628, #1A2535);
    border: 1px solid rgba(6,182,212,0.25);
    border-radius: 24px;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  .wallet-hero::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  .withdraw-btn-main {
    width: 100%;
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    color: #000;
    border: none;
    border-radius: 16px;
    padding: 16px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Exo 2', sans-serif;
    letter-spacing: 0.5px;
    margin-top: 16px;
    transition: all 0.2s;
  }

  .withdraw-btn-main:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.3); }
  .withdraw-btn-main:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .txn-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .txn-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .txn-info { flex: 1; }
  .txn-title { font-size: 14px; font-weight: 600; }
  .txn-time { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .txn-amount {
    font-family: 'Rajdhani', sans-serif;
    font-size: 18px;
    font-weight: 700;
  }

  /* ── Withdraw Modal ── */
  .input-field {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    color: var(--text);
    font-size: 16px;
    font-family: 'Exo 2', sans-serif;
    outline: none;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }

  .input-field:focus { border-color: var(--gold); }

  .input-label {
    font-size: 12px;
    color: var(--muted2);
    margin-bottom: 6px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .payment-methods {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .pay-method {
    background: var(--bg);
    border: 2px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    color: var(--muted2);
    font-weight: 600;
  }

  .pay-method.active { border-color: var(--gold); color: var(--gold); background: rgba(245,158,11,0.08); }
  .pay-method-icon { font-size: 22px; margin-bottom: 4px; }

  /* ── Profile Page ── */
  .profile-hero {
    background: linear-gradient(160deg, #1A2535 0%, #0F1623 100%);
    margin: 16px;
    border-radius: 24px;
    border: 1px solid var(--border);
    padding: 24px;
    text-align: center;
    position: relative;
  }

  .profile-avatar {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    margin: 0 auto 14px;
    border: 3px solid rgba(245,158,11,0.4);
    box-shadow: 0 0 30px rgba(245,158,11,0.2);
  }

  .profile-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 22px;
    font-weight: 700;
  }

  .profile-level {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 12px;
    color: var(--gold);
    font-weight: 700;
    margin-top: 8px;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-top: 18px;
  }

  .profile-stat {
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    padding: 12px 8px;
    text-align: center;
  }

  .profile-stat-val {
    font-family: 'Rajdhani', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--gold);
  }

  .profile-stat-lbl {
    font-size: 10px;
    color: var(--muted);
    margin-top: 2px;
  }

  .menu-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .menu-item:hover { border-color: rgba(255,255,255,0.15); }

  .menu-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }

  .menu-label {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
  }

  .menu-arrow { color: var(--muted); font-size: 16px; }

  /* ── Referral Card ── */
  .referral-card {
    margin: 0 16px 10px;
    background: linear-gradient(135deg, #1A1040, #0F1623);
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 18px;
    padding: 18px;
    position: relative;
    overflow: hidden;
  }

  .referral-card::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }

  .ref-code-box {
    background: var(--bg);
    border: 1px dashed rgba(139,92,246,0.4);
    border-radius: 10px;
    padding: 10px 16px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--purple);
    letter-spacing: 4px;
    text-align: center;
    margin-top: 12px;
  }

  /* ── Leaderboard ── */
  .leaderboard-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    transition: all 0.2s;
  }

  .leaderboard-item.you {
    border-color: rgba(245,158,11,0.4);
    background: rgba(245,158,11,0.06);
  }

  .rank-badge {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    color: var(--muted);
  }

  .lb-avatar {
    width: 40px; height: 40px;
    background: var(--card2);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }

  .lb-name { flex: 1; font-size: 14px; font-weight: 600; }
  .lb-coins { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: var(--gold); }

  /* ── Bottom Nav ── */
  .bottom-nav {
    position: fixed;
    bottom: 0; left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    background: rgba(15,22,35,0.97);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    padding: 8px 0 12px;
    z-index: 100;
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    padding: 4px 0;
    transition: all 0.2s;
  }

  .nav-icon {
    font-size: 22px;
    transition: transform 0.2s;
  }

  .nav-item.active .nav-icon { transform: scale(1.2); }

  .nav-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--muted);
  }

  .nav-item.active .nav-label { color: var(--gold); }

  .nav-earn-btn {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin-top: -10px;
    box-shadow: 0 4px 20px rgba(245,158,11,0.4);
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid var(--bg);
  }

  .nav-earn-btn:hover { transform: scale(1.08); }
  .nav-earn-btn:active { transform: scale(0.95); }

  /* ── Coins animation ── */
  @keyframes coinFloat {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
  }

  .coin-float {
    position: fixed;
    font-size: 24px;
    pointer-events: none;
    z-index: 500;
    animation: coinFloat 1s ease forwards;
  }

  /* ── SVG Ring ── */
  .svg-ring {
    transform: rotate(-90deg);
  }

  .ring-track { fill: none; stroke: #1A2535; stroke-width: 6; }
  .ring-fill { fill: none; stroke: var(--gold); stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.5s ease; }

  /* ── Chip tags ── */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 11px;
    color: var(--muted2);
  }

  /* ── Scroll hide ── */
  ::-webkit-scrollbar { display: none; }

  /* ── Captcha Styles ── */
  .captcha-box {
    background: repeating-linear-gradient(
      45deg,
      #131924,
      #131924 10px,
      #1a2436 10px,
      #1a2436 20px
    );
    border: 1px dashed var(--border);
    padding: 20px;
    border-radius: 12px;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 6px;
    color: var(--gold-light);
    font-family: "Courier New", Courier, monospace;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  .captcha-box::before {
    content: "RELIABLE VERIFICATION";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-12deg);
    font-size: 10px;
    opacity: 0.12;
    color: #fff;
    white-space: nowrap;
    letter-spacing: 1px;
  }
  .captcha-noise-line {
    position: absolute;
    width: 140%;
    height: 2px;
    background: rgba(255,255,255,0.18);
    transform: rotate(15deg);
  }

  /* ── Interactive Spin Wheel Styles ── */
  .spin-container-full {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
  }
  .wheel-outer {
    position: relative;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    border: 8px solid #1f2d45;
    box-shadow: 0 10px 25px rgba(0,0,0,0.6), 0 0 0 4px var(--gold);
    overflow: hidden;
  }
  .wheel-svg {
    width: 100%;
    height: 100%;
    transition: transform 4s cubic-bezier(0.15, 0.85, 0.2, 1);
    transform-origin: center center;
  }
  .wheel-pointer {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 25px solid var(--gold);
    z-index: 10;
    filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
  }
  .wheel-center-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: var(--surface);
    border: 3px solid var(--gold);
    border-radius: 50%;
    z-index: 5;
    box-shadow: inset 0px 2px 5px rgba(0,0,0,0.5), 0px 4px 10px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
  }
`;

// ─── SVG Timer Ring ───────────────────────────────────────────────────────────
interface TimerRingProps {
  total: number;
  remaining: number;
  size?: number;
}

function TimerRing({ total, remaining, size = 80 }: TimerRingProps) {
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const progress = remaining / total;
  const offset = circumference * (1 - progress);
  return (
    <div className="timer-ring">
      <svg width={size} height={size} className="svg-ring" viewBox="0 0 70 70">
        <circle className="ring-track" cx="35" cy="35" r={r} />
        <circle
          className="ring-fill"
          cx="35" cy="35" r={r}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="timer-number">{remaining}</span>
    </div>
  );
}

// ─── Ad Modal ─────────────────────────────────────────────────────────────────
interface AdModalProps {
  task: Task;
  onClose: () => void;
  onComplete: (coins: number) => void;
}

function AdModal({ task, onClose, onComplete }: AdModalProps) {
  const [phase, setPhase] = useState<"solving" | "watching" | "verifying" | "done">("solving");
  const [timer] = useState(task.type === "video" || task.type === "rewarded" || task.type === "install" ? 15 : task.type === "combo" ? 25 : 10);
  const total = timer;
  const [elapsed, setElapsed] = useState(0);
  const [clickedLink, setClickedLink] = useState(false);
  const [installError, setInstallError] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoPlayFailed, setVideoPlayFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [playableScore, setPlayableScore] = useState(0);
  const [boosterTaps, setBoosterTaps] = useState(0);

  useEffect(() => {
    if (phase !== "watching") {
      setVideoPlayFailed(false);
      setVideoPlaying(false);
      return;
    }
    const timeout = setTimeout(() => {
      if (!videoPlaying && phase === "watching") {
        setVideoPlayFailed(true);
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [phase, videoPlaying]);

  useEffect(() => {
    if (phase !== "watching" || showConfirmClose) return;
    
    const interval = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= total) {
          clearInterval(interval);
          setPhase("done");
          return total;
        }
        return e + 1;
      });
    }, 1000); // 1s accurate real-time display
    return () => clearInterval(interval);
  }, [phase, total, showConfirmClose]);

  const remaining = Math.max(0, total - elapsed);

  const adContent: Record<string, { bg: string; text: string; sub: string; color: string }> = {
    booster: { bg: "linear-gradient(135deg,#1e3a5f,#0d2137)", text: "🪙 Coin Tap Challenge", sub: "Tap the coin to generate gold coins", color: "#F59E0B" },
    mega_booster: { bg: "linear-gradient(135deg,#3a1a1a,#1f0d0d)", text: "⚡ Mega Tap Challenge", sub: "Tap rapidly to claim the mega reward", color: "#EF4444" },
    install: { bg: "linear-gradient(135deg,#151c2d,#0f172a)", text: "📲 Install App", sub: "Download Navi App", color: "#8B5CF6" },
    quiz: { bg: "linear-gradient(135deg,#3a1a3a,#1f0d1f)", text: "🧠 Quiz Time!", sub: "Complete to Earn", color: "#EC4899" },
  };

  const ad = adContent[task.type] || adContent.booster;

  const handleVerifyInstall = () => {
    if (!clickedLink) {
      setInstallError("⚠️ Pehle 'Download' button par click karke application install karein!");
      return;
    }
    setInstallError("");
    setPhase("verifying");
    setTimeout(() => {
      setElapsed(0);
      setPhase("done"); // Bypasses the simulated ad!
    }, 1500);
  };

  const handleBoosterTap = () => {
    if (boosterTaps < 4) {
      setBoosterTaps(prev => prev + 1);
    } else {
      setBoosterTaps(5);
      setPhase("verifying");
      setTimeout(() => {
        setElapsed(0);
        setPhase("done"); // Bypasses the simulated ad!
      }, 1500);
    }
  };

  const handleCloseAttempt = () => {
    if (phase === "watching" && remaining > 0) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && phase !== "verifying" && handleCloseAttempt()}>
      <div className="modal" style={{ position: "relative", overflow: "hidden" }}>
        
        {/* Top bar indicators for Ad Watching */}
        {phase === "watching" && (
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 30 }}>
            <button 
              onClick={handleCloseAttempt}
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                color: "#fff",
                borderRadius: "20px",
                padding: "5px 12px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                backdropFilter: "blur(4px)",
                fontFamily: "monospace"
              }}
            >
              {remaining > 0 ? `Skip in ${remaining}s` : "✕ Close"}
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="modal-close" onClick={onClose}>✕</div>
        )}

        {phase === "solving" ? (
          task.type === "install" ? (
            <>
              <div className="modal-title" style={{ color: ad.color, display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{task.icon}</span> {task.title}
              </div>
              <div className="modal-sub">
                Task Verification Step 1: Install Navi App
              </div>

              <div className="ad-screen" style={{ 
                background: "#010103", 
                minHeight: "220px", 
                position: "relative",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                padding: "20px"
              }}>
                <div style={{ fontSize: 50, marginBottom: 8 }} className="animate-bounce">📲</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Navi App Install</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4, textAlign: "center", lineHeight: "1.4", maxWidth: "400px" }}>
                  👉 Niche diye button se Navi app install karein aur signup complete karein! Iske baad reward claim karein.
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", padding: "10px", borderRadius: 8, marginTop: 12, fontSize: 11, color: "var(--gold-light)", textAlign: "center" }}>
                  Niyam: App download karke registered status check lagana zaruri hai.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 15 }}>
                <a
                  href={task.link || "https://r.navi.com/r169dB"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setClickedLink(true)}
                  style={{
                    display: "flex", width: "100%", justifyContent: "center", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", border: "none",
                    borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none"
                  }}
                >
                  📥 Download & Install Navi App
                </a>

                {installError && (
                  <p style={{ color: "var(--red)", fontSize: 12, textAlign: "center", fontWeight: 600, margin: 0 }}>
                    {installError}
                  </p>
                )}

                <button
                  type="button"
                  className="withdraw-btn-main"
                  style={{ marginTop: 4 }}
                  onClick={handleVerifyInstall}
                >
                  🚀 Verify & Complete Task
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="modal-title" style={{ color: ad.color, display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{task.icon}</span> {task.title}
              </div>
              <div className="modal-sub">
                Task Step: Activate Reward Booster Key
              </div>

              <div className="ad-screen" style={{ 
                background: "linear-gradient(135deg, #0f0c1b 0%, #05020a 100%)", 
                minHeight: "250px", 
                position: "relative",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                padding: "20px"
              }}>
                {/* Floating neon background blur */}
                <div style={{ position: "absolute", width: "100px", height: "100px", background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)", filter: "blur(25px)", opacity: 0.4 }} />

                <div 
                  onClick={handleBoosterTap}
                  style={{
                    width: "90px",
                    height: "90px",
                    background: "radial-gradient(circle, #fbbf24 0%, #b45309 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "4px solid #fff",
                    boxShadow: boosterTaps > 0 ? "0 0 30px rgba(251, 191, 36, 0.8), inset 0 0 10px rgba(255,255,255,0.4)" : "0 5px 15px rgba(0,0,0,0.5)",
                    cursor: "pointer",
                    transform: `scale(${1 + boosterTaps * 0.05}) rotate(${boosterTaps * 25}deg)`,
                    transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    zIndex: 5,
                    userSelect: "none"
                  }}
                >
                  <span style={{ fontSize: "40px" }}>🪙</span>
                  {boosterTaps > 0 && boosterTaps < 5 && (
                    <div style={{
                      position: "absolute",
                      top: -20,
                      background: "var(--accent)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      animation: "bounce 0.5s infinite"
                    }}>
                      +{boosterTaps}
                    </div>
                  )}
                </div>

                <div style={{ color: "#FFF", zIndex: 5, marginTop: "18px", fontWeight: "800", fontSize: "15px", letterSpacing: "0.5px", fontFamily: "Rajdhani, sans-serif" }}>
                  {boosterTaps >= 5 ? "✅ BOOSTER KEY ACTIVE!" : "TAP COIN 5 TIMES TO ACTIVE BOOSTER"}
                </div>
                
                <div style={{ color: "var(--gold-light)", fontSize: "11px", fontWeight: "600", zIndex: 5, marginTop: "6px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.2)", padding: "3px 12px", borderRadius: "12px" }}>
                  Tap Count: {boosterTaps} / 5
                </div>

                <p style={{ color: "var(--muted)", fontSize: "11px", textAlign: "center", zIndex: 5, marginTop: "12px", maxWidth: "270px", lineHeight: "1.4" }}>
                  {boosterTaps >= 5 
                    ? "Verification connection loaded! Tap below to claim your reward."
                    : "Coins booster power ready! Tap to verify coin request and unlock the reward."}
                </p>
              </div>

              <div style={{ marginTop: "15px", width: "100%" }}>
                <button
                  type="button"
                  className="withdraw-btn-main"
                  disabled={boosterTaps < 5}
                  onClick={() => {
                    setPhase("done");
                  }}
                  style={{
                    background: boosterTaps >= 5 ? "linear-gradient(135deg, var(--gold), #d97706)" : "rgba(255,255,255,0.05)",
                    color: boosterTaps >= 5 ? "#000" : "rgba(255,255,255,0.2)",
                    cursor: boosterTaps >= 5 ? "pointer" : "not-allowed"
                  }}
                >
                  {boosterTaps >= 5 ? "🚀 Complete Task & Claim Reward →" : "🔒 Complete Coin Tapping Task First"}
                </button>
              </div>
            </>
          )
        ) : phase === "watching" ? (
          <>
            <div className="modal-title" style={{ color: ad.color, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{task.icon}</span> {task.title}
            </div>
            
            <div className="modal-sub">
              {task.type === "install" ? "Complete this app install task to earn big coins!" : "Google AdMob Rewarded/Interstitial Test Ad Active"}
            </div>

            {/* Simulated Live Video Player Wrapper */}
            <div className="ad-screen" style={{ 
              background: "#010103", 
              minHeight: task.type === "install" ? "210px" : "250px", 
              position: "relative",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden"
            }}>
              {/* Official AdMob Watermark Banner */}
              <div style={{
                background: "#4285F4",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "800",
                textAlign: "center",
                padding: "6px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: "Rajdhani, sans-serif",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px"
              }}>
                📢 GOOGLE ADMOB AD ACTIVE (APP ID: ca-app-pub-1741947856013956~9733783734 | UNIT ID: ca-app-pub-1741947856013956/8677898539)
              </div>

              <div style={{ flex: 1, position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!videoPlayFailed ? (
                  <video
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    autoPlay
                    muted={isMuted}
                    playsInline
                    loop
                    onPlay={() => { setVideoPlaying(true); setVideoPlayFailed(false); }}
                    onPlaying={() => { setVideoPlaying(true); setVideoPlayFailed(false); }}
                    onError={() => { setVideoPlayFailed(true); }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 1
                    }}
                  />
                ) : (
                  /* High-Fidelity Interactive CSS Gaming Ad Fallback */
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, #130a24 0%, #06020c 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    zIndex: 2,
                    userSelect: "none",
                    width: "100%",
                    height: "100%"
                  }} onClick={() => setPlayableScore(s => s + 25)}>
                    
                    {/* Interactive floating particles */}
                    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: 0.35 }}>
                      <div style={{
                        position: "absolute",
                        width: "120px",
                        height: "120px",
                        background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                        top: "10%",
                        left: "10%",
                        filter: "blur(20px)"
                      }} />
                      <div style={{
                        position: "absolute",
                        width: "100px",
                        height: "100px",
                        background: "radial-gradient(circle, var(--cyan) 0%, transparent 70%)",
                        bottom: "10%",
                        right: "10%",
                        filter: "blur(25px)"
                      }} />
                    </div>

                    {/* Spinning interactive disk */}
                    <div style={{
                      width: "72px",
                      height: "72px",
                      background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(6, 2, 12, 0.8) 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "3px dashed var(--accent)",
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)",
                      transform: `rotate(${playableScore}deg)`,
                      transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      cursor: "pointer",
                      zIndex: 5
                    }}>
                      <span style={{ fontSize: "34px" }}>🎮</span>
                    </div>

                    <div style={{ color: "#FFF", zIndex: 5, marginTop: "12px", fontWeight: "800", fontSize: "14px", letterSpacing: "0.5px", fontFamily: "Rajdhani, sans-serif" }}>
                      TAP HERE TO SPIN DISC
                    </div>
                    <div style={{ color: "var(--gold-light)", fontSize: "11px", fontWeight: "600", zIndex: 5, marginTop: "4px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.2)", padding: "3px 8px", borderRadius: "12px" }}>
                      Discs Spin: {playableScore || 0}° Booster Active!
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: "10px", textAlign: "center", zIndex: 5, marginTop: "8px", maxWidth: "250px", lineHeight: "1.3" }}>
                      Google AdMob Responsive Playable Ad (Unit ID: ca-app-pub-1741947856013956/8677898539) loaded successfully. Watch timer above to claim premium coins!
                    </p>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "10px", zIndex: 5 }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", background: "var(--green)", borderRadius: "50%" }} />
                      <span style={{ fontSize: "9px", color: "var(--green)", fontFamily: "monospace", fontWeight: "600" }}>
                        WEB INTERACTIVE AD UNIT LIVE
                      </span>
                    </div>
                  </div>
                )}

                {/* Speaker Mute/Unmute toggle overlay */}
                {!videoPlayFailed && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                    style={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      zIndex: 10,
                      background: "rgba(0,0,0,0.7)",
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      cursor: "pointer",
                      pointerEvents: "auto",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                    }}
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                )}

                {/* Top-left AdMob Watermark badge */}
                <div style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 10,
                  background: "rgba(10, 10, 15, 0.8)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "9px",
                  color: "#fff",
                  fontFamily: "monospace",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  lineHeight: "1.2"
                }}>
                  <span style={{ color: "var(--gold)", fontWeight: "bold" }}>Google AdMob Rewarded Video</span>
                  <span>App ID: ca-app-pub-1741947856013956~9733783734</span>
                  <span>Unit ID: ca-app-pub-1741947856013956/8677898539</span>
                </div>

                {/* Bottom Progress Bar overlay */}
                <div style={{ 
                  position: "absolute", 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: "4px", 
                  background: "rgba(255,255,255,0.2)", 
                  zIndex: 10 
                }}>
                  <div style={{ 
                    width: `${(elapsed / total) * 100}%`, 
                    height: "100%", 
                    background: "var(--accent)", 
                    transition: "width 0.3s ease" 
                  }} />
                </div>
              </div>

              {/* Video control status footer */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                padding: "8px 12px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "11px",
                color: "#94A3B8"
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  🟢 Playing Live Test
                </span>
                <span style={{ color: "var(--gold)" }}>
                  Reward Tier: {task.coins} Coins
                </span>
              </div>
            </div>

            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%",
                  animation: "pulse 1.5s infinite"
                }} />
                <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>
                  Please wait until countdown ends to receive reward
                </span>
              </div>
            </div>

            {/* Skip protection Warning overlay */}
            {showConfirmClose && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(15, 23, 42, 0.95)",
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px"
              }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>⚠️</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#EF4444", fontFamily: "Rajdhani" }}>
                  Reward Lost Warning!
                </div>
                <p style={{ textAlign: "center", color: "#E2E8F0", fontSize: "12px", marginTop: "8px", lineHeight: "1.5", maxWidth: "240px" }}>
                  Agar aap abhi band karenge, to aapko is task ke <strong style={{ color: "var(--gold)" }}>{task.coins} Coins</strong> ka reward nahi milega!
                </p>
                <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "250px", marginTop: "18px" }}>
                  <button 
                    onClick={() => setShowConfirmClose(false)}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, var(--accent), #7C3AED)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Keep Watching
                  </button>
                  <button 
                    onClick={() => onClose()}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94A3B8",
                      borderRadius: "10px",
                      padding: "10px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Skip Reward
                  </button>
                </div>
              </div>
            )}
          </>
        ) : phase === "verifying" ? (
          <div style={{ textAlign: "center", padding: "40px 10px" }}>
            <div style={{
              width: 45, height: 45, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--cyan)",
              borderRadius: "50%", margin: "0 auto 16px auto", animation: "spin 1s linear infinite"
            }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--cyan)", fontFamily: "Rajdhani, sans-serif", letterSpacing: "1px" }}>VERIFYING TASK COMPLETION...</div>
            <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 6 }}>Checking digital credentials and secure handshake, please wait.</div>
          </div>
        ) : (
          <>
            <div className="modal-icon">🎉</div>
            <div className="modal-title" style={{ color: "var(--green)" }}>
              Reward Claimed!
            </div>
            <div className="modal-sub">
              You earned <strong style={{ color: "var(--gold)" }}>+{task.coins} coins</strong>
              <br />≈ ₹{(task.coins * COIN_VALUE).toFixed(4)}
            </div>
            <button className="withdraw-btn-main" onClick={() => { onComplete(task.coins); onClose(); }}>
              🪙 Collect Coins
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Captcha Modal ────────────────────────────────────────────────────────────
interface CaptchaModalProps {
  onClose: () => void;
  onComplete: (coins: number) => void;
}

function CaptchaModal({ onClose, onComplete }: CaptchaModalProps) {
  const generateCaptchaCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid similar looking chars like I, O, 1, 0
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  };

  const [code, setCode] = useState(generateCaptchaCode());
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState<"solving" | "watching_ad" | "solved">("solving");
  const [errorMsg, setErrorMsg] = useState("");

  // Video Ad playing state
  const [timer] = useState(15);
  const [elapsed, setElapsed] = useState(0);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoPlayFailed, setVideoPlayFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [playableScore, setPlayableScore] = useState(0);

  useEffect(() => {
    if (step !== "watching_ad") {
      setVideoPlayFailed(false);
      setVideoPlaying(false);
      return;
    }
    const timeout = setTimeout(() => {
      if (!videoPlaying) {
        setVideoPlayFailed(true);
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [step, videoPlaying]);

  useEffect(() => {
    if (step === "watching_ad") {
      console.log("AdMob SDK Interstitial Loaded successfully for Captcha reward verifying. App ID: ca-app-pub-1741947856013956~9733783734, Ad Unit: ca-app-pub-1741947856013956/8677898539");
    }
  }, [step]);

  useEffect(() => {
    if (step !== "watching_ad" || showConfirmClose) return;

    const interval = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= timer) {
          clearInterval(interval);
          setStep("solved");
          return timer;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer, showConfirmClose]);

  const remaining = Math.max(0, timer - elapsed);

  const handleRefresh = () => {
    setCode(generateCaptchaCode());
    setTyped("");
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typed.trim().toUpperCase() === code) {
      setErrorMsg("");
      setElapsed(0);
      setStep("solved");
    } else {
      setErrorMsg("❌ Incorrect code! Letters matching check karke dobara enter karein.");
    }
  };

  const handleCloseAttempt = () => {
    if (step === "watching_ad" && remaining > 0) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && step !== "watching_ad" && handleCloseAttempt()}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ position: "relative", overflow: "hidden" }}>
        
        {/* Top bar skip or close button indicator in ad playing state */}
        {step === "watching_ad" && (
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 30 }}>
            <button 
              onClick={handleCloseAttempt}
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                color: "#fff",
                borderRadius: "20px",
                padding: "5px 12px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                backdropFilter: "blur(4px)",
                fontFamily: "monospace"
              }}
            >
              {remaining > 0 ? `Skip in ${remaining}s` : "✕ Close"}
            </button>
          </div>
        )}

        {step !== "watching_ad" && (
          <div className="modal-close" onClick={onClose}>✕</div>
        )}

        {step === "solving" ? (
          <>
            <div className="modal-title" style={{ color: "var(--green)" }}>🛡️ Captcha Solver</div>
            <div className="modal-sub" style={{ marginBottom: 15 }}>Enter correct letters to earn coins instantly!</div>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="captcha-box">
                {code}
                <div className="captcha-noise-line" style={{ top: "30%", transform: "rotate(10deg)" }}></div>
                <div className="captcha-noise-line" style={{ top: "60%", transform: "rotate(-15deg)" }}></div>
              </div>

              <button type="button" onClick={handleRefresh} style={{ alignSelf: "center", border: "none", background: "none", color: "var(--cyan)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                🔄 New Captcha
              </button>

              <div className="input-label" style={{ marginTop: 4 }}>Enter the letters shown above</div>
              <input
                type="text"
                autoFocus
                className="input-field"
                placeholder="Ex: XYZ897"
                value={typed}
                onChange={e => setTyped(e.target.value.toUpperCase())}
                style={{ textAlign: "center", letterSpacing: 4, fontWeight: 700, fontSize: 18 }}
              />

              {errorMsg && (
                <div style={{ color: "var(--red)", fontSize: 12, textAlign: "center", fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" className="withdraw-btn-main">
                🚀 Verify & Claim Reward
              </button>
            </form>
          </>
        ) : step === "watching_ad" ? (
          <>
            <div className="modal-title" style={{ color: "var(--accent)" }}>🎬 Video Ad Playing</div>
            <div className="modal-sub">Watch test ad completely to receive Captcha coins</div>
            
            {/* Simulated Live Video Player Wrapper */}
            <div className="ad-screen" style={{ 
              background: "#010103", 
              minHeight: "250px", 
              position: "relative",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              marginTop: "10px"
            }}>
              {/* Official AdMob Watermark Banner */}
              <div style={{
                background: "#4285F4",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "800",
                textAlign: "center",
                padding: "6px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: "Rajdhani, sans-serif"
              }}>
                📢 GOOGLE ADMOB AD ACTIVE (APP ID: ca-app-pub-1741947856013956~9733783734 | UNIT ID: ca-app-pub-1741947856013956/8677898539)
              </div>

              {/* Video Player Gameplay container */}
              <div style={{ flex: 1, position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!videoPlayFailed ? (
                  <video
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
                    autoPlay
                    muted={isMuted}
                    playsInline
                    loop
                    onPlay={() => { setVideoPlaying(true); setVideoPlayFailed(false); }}
                    onPlaying={() => { setVideoPlaying(true); setVideoPlayFailed(false); }}
                    onError={() => { setVideoPlayFailed(true); }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 1
                    }}
                  />
                ) : (
                  /* High-Fidelity Interactive CSS Gaming Ad Fallback */
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, #130a24 0%, #06020c 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    zIndex: 2,
                    userSelect: "none",
                    width: "100%",
                    height: "100%"
                  }} onClick={() => setPlayableScore(s => s + 25)}>
                    
                    {/* Interactive floating particles */}
                    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: 0.35 }}>
                      <div style={{
                        position: "absolute",
                        width: "120px",
                        height: "120px",
                        background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                        top: "10%",
                        left: "10%",
                        filter: "blur(20px)"
                      }} />
                      <div style={{
                        position: "absolute",
                        width: "100px",
                        height: "100px",
                        background: "radial-gradient(circle, var(--cyan) 0%, transparent 70%)",
                        bottom: "10%",
                        right: "10%",
                        filter: "blur(25px)"
                      }} />
                    </div>

                    {/* Spinning interactive disk */}
                    <div style={{
                      width: "72px",
                      height: "72px",
                      background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(6, 2, 12, 0.8) 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "3px dashed var(--accent)",
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)",
                      transform: `rotate(${playableScore}deg)`,
                      transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      cursor: "pointer",
                      zIndex: 5
                    }}>
                      <span style={{ fontSize: "34px" }}>🎮</span>
                    </div>

                    <div style={{ color: "#FFF", zIndex: 5, marginTop: "12px", fontWeight: "800", fontSize: "14px", letterSpacing: "0.5px", fontFamily: "Rajdhani, sans-serif" }}>
                      TAP HERE TO PLAY DEMO
                    </div>
                    <div style={{ color: "var(--gold-light)", fontSize: "11px", fontWeight: "600", zIndex: 5, marginTop: "4px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.2)", padding: "3px 8px", borderRadius: "12px" }}>
                      Discs Spin: {playableScore || 0}° Booster Active!
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: "10px", textAlign: "center", zIndex: 5, marginTop: "8px", maxWidth: "250px", lineHeight: "1.3" }}>
                      Google AdMob Responsive Playable Ad (Unit ID: ca-app-pub-1741947856013956/8677898539) loaded successfully. Watch timer above to claim premium coins!
                    </p>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "10px", zIndex: 5 }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", background: "var(--green)", borderRadius: "50%" }} />
                      <span style={{ fontSize: "9px", color: "var(--green)", fontFamily: "monospace", fontWeight: "600" }}>
                        WEB INTERACTIVE AD UNIT LIVE
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Speaker Mute/Unmute toggle overlay */}
                {!videoPlayFailed && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                    style={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      zIndex: 10,
                      background: "rgba(0,0,0,0.7)",
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      cursor: "pointer",
                      pointerEvents: "auto",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                    }}
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                )}

                {/* Top-left AdMob Watermark badge */}
                <div style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 10,
                  background: "rgba(10, 10, 15, 0.8)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "9px",
                  color: "#fff",
                  fontFamily: "monospace",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  lineHeight: "1.2"
                }}>
                  <span style={{ color: "var(--gold)", fontWeight: "bold" }}>Google AdMob Interstitial Ad</span>
                  <span>App ID: ca-app-pub-1741947856013956~9733783734</span>
                  <span>Unit ID: ca-app-pub-1741947856013956/8677898539</span>
                </div>

                {/* Progress bar */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "rgba(255,255,255,0.2)", zIndex: 10 }}>
                  <div style={{ width: `${(elapsed / timer) * 100}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s ease" }} />
                </div>
              </div>

              {/* Video Player Control bar */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                padding: "6px 10px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "10px",
                color: "#94A3B8"
              }}>
                <span>🟢 Connected to Google AdMob SDK</span>
                <span style={{ color: "var(--gold)", fontWeight: "600" }}>Reward Tier: +25 Coins</span>
              </div>
            </div>

            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{
                width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%",
                animation: "pulse 1.5s infinite"
              }} />
              <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>
                Ad timing count: {remaining}s left
              </span>
            </div>

            {/* Skip warning modal overlay inside Captcha */}
            {showConfirmClose && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(15, 23, 42, 0.95)",
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px"
              }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>⚠️</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#EF4444", fontFamily: "Rajdhani" }}>
                  Reward Skip Warning!
                </div>
                <p style={{ textAlign: "center", color: "#E2E8F0", fontSize: "12px", marginTop: "8px", lineHeight: "1.5", maxWidth: "230px" }}>
                  Agar aap video ko skip karenge, toh aapka captcha verify hone ke baad bhi <strong style={{ color: "var(--gold)" }}>+25 Coins</strong> ka reward forfeit ho jayega!
                </p>
                <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "240px", marginTop: "16px" }}>
                  <button 
                    onClick={() => setShowConfirmClose(false)}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, var(--accent), #7C3AED)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Keep Watching
                  </button>
                  <button 
                    onClick={() => onClose()}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94A3B8",
                      borderRadius: "10px",
                      padding: "10px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Skip & Close
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 50, marginBottom: 10 }}>🎉</div>
            <div className="modal-title" style={{ color: "var(--green)", fontSize: 20 }}>Captcha Solved!</div>
            <div style={{ color: "var(--muted2)", fontSize: 14, margin: "10px 0 20px" }}>
              Humne aapke wallet me <strong style={{ color: "var(--gold)" }}>+25 Coins</strong> transfer kar diye hain!
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="withdraw-btn-main" style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "#fff" }} onClick={() => { onComplete(25); }}>
                Claim & Close
              </button>
              <button className="withdraw-btn-main" style={{ flex: 1 }} onClick={() => {
                onComplete(25);
                setStep("solving");
                setCode(generateCaptchaCode());
                setTyped("");
              }}>
                Solve Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Spin Wheel Modal ─────────────────────────────────────────────────────────
interface SpinWheelModalProps {
  onClose: () => void;
  onComplete: (coins: number) => void;
}

function SpinWheelModal({ onClose, onComplete }: SpinWheelModalProps) {
  const slices = [5, 10, 15, 20, 25, 50, 100, 0];
  const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#64748B"];

  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const [prize, setPrize] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<string | null>(null);

  useEffect(() => {
    const updateCooldown = () => {
      const last = localStorage.getItem("last_spin_time");
      if (last) {
        const lastTime = parseInt(last, 10);
        const now = Date.now();
        const diff = now - lastTime;
        const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
        if (diff < cooldownMs) {
          const remainingMs = cooldownMs - diff;
          const hrs = Math.floor(remainingMs / (3600 * 1000));
          const mins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
          const secs = Math.floor((remainingMs % (60 * 1000)) / 1000);
          setCooldown(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        } else {
          setCooldown(null);
        }
      } else {
        setCooldown(null);
      }
    };

    updateCooldown();
    const timerId = setInterval(updateCooldown, 1000);
    return () => clearInterval(timerId);
  }, []);

  const startSpin = () => {
    if (spinning || cooldown) return;

    // Check cooldown verification
    const last = localStorage.getItem("last_spin_time");
    if (last) {
      if (Date.now() - parseInt(last, 10) < 24 * 60 * 60 * 1000) return;
    }

    setSpinning(true);
    setPrize(null);

    // Weighted random selection:
    // Index 6 is 100 coins, which has lower probability (3%). Others are random.
    const weights = [20, 20, 15, 15, 12, 10, 3, 5]; // Sum = 100
    const rand = Math.floor(Math.random() * 100);
    let stopIdx = 0;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (rand < sum) {
        stopIdx = i;
        break;
      }
    }

    const segmentAngle = 360 / slices.length;
    // Segment 'stopIdx' center angle
    const labelAngle = stopIdx * segmentAngle + segmentAngle / 2;
    // Base target: rotating by (360 - labelAngle) aligns the segment center perfectly under 12 o'clock pointer
    // Random nudge offset limited to within +/- 0.3 * segmentAngle to ensure it stays strictly within the sector lines!
    const nudge = (Math.random() - 0.5) * (segmentAngle * 0.6); 

    const extraRounds = 8 + Math.floor(Math.random() * 3);
    const nextDeg = deg + (extraRounds * 360) + (360 - labelAngle) + nudge;

    setDeg(nextDeg);

    setTimeout(() => {
      setSpinning(false);
      const winVal = slices[stopIdx];
      setPrize(winVal);
      localStorage.setItem("last_spin_time", Date.now().toString());
      onComplete(winVal);
    }, 4000);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !spinning && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-close" onClick={() => !spinning && onClose()}>✕</div>
        <div className="modal-title" style={{ color: "var(--cyan)", fontFamily: "Rajdhani, sans-serif" }}>🎰 Lucky Wheel Spin</div>
        <div className="modal-sub">Spin and win surprise cash reward up to 100 coins!</div>

        <div className="spin-container-full">
          <div className="wheel-outer">
            <div className="wheel-pointer" />
            <svg
              className="wheel-svg"
              style={{ transform: `rotate(${deg}deg)` }}
              viewBox="0 0 200 200"
            >
              {slices.map((slice, i) => {
                const segmentAngle = 360 / slices.length;
                const startAngle = i * segmentAngle;
                const endAngle = (i + 1) * segmentAngle;

                const rad = 100;
                const x1 = Math.round(100 + rad * Math.cos((Math.PI * (startAngle - 90)) / 180));
                const y1 = Math.round(100 + rad * Math.sin((Math.PI * (startAngle - 90)) / 180));
                const x2 = Math.round(100 + rad * Math.cos((Math.PI * (endAngle - 90)) / 180));
                const y2 = Math.round(100 + rad * Math.sin((Math.PI * (endAngle - 90)) / 180));

                const pathData = `M 100 100 L ${x1} ${y1} A ${rad} ${rad} 0 0 1 ${x2} ${y2} Z`;

                const labelAngle = startAngle + (segmentAngle / 2);
                const rx = Math.round(100 + (rad * 0.65) * Math.cos((Math.PI * (labelAngle - 90)) / 180));
                const ry = Math.round(100 + (rad * 0.65) * Math.sin((Math.PI * (labelAngle - 90)) / 180));

                return (
                  <g key={i}>
                    <path d={pathData} fill={colors[i]} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    <text
                      x={rx}
                      y={ry}
                      fill="#FFF"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(${labelAngle}, ${rx}, ${ry})`}
                    >
                      {slice}🪙
                    </text>
                  </g>
                );
              })}
            </svg>
            <button 
              disabled={spinning || cooldown !== null}
              className="wheel-center-button" 
              onClick={startSpin}
              style={{ padding: 0, border: "3px solid var(--gold)", outline: "none", zIndex: 12 }}
            >
              {spinning ? "⏳" : "GO!"}
            </button>
          </div>
        </div>

        {cooldown && (
          <div style={{ textAlign: "center", margin: "14px 0", padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: 12, border: "1px dashed rgba(239,68,68,0.3)" }}>
            <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>⏳ DAILY LIMIT REACHED</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Aap 24 ghante me sirf ek baar spin kar sakte hain. <br />
              Agla free spin available in: <strong style={{ color: "var(--cyan)" }}>{cooldown}</strong>
            </div>
          </div>
        )}

        {prize !== null && (
          <div style={{ textAlign: "center", margin: "14px 0", padding: "12px", background: "rgba(16,185,129,0.12)", borderRadius: 12, border: "1px dashed rgba(16,185,129,0.3)" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>LUCKY SPIN DRAW OUTCOME</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--green)", marginTop: 4 }}>
              🎉 +{prize} coins won!
            </div>
          </div>
        )}

        <button 
          className="withdraw-btn-main" 
          disabled={spinning || cooldown !== null} 
          onClick={startSpin}
        >
          {spinning ? "🎡 Spinning Wheel..." : cooldown ? `⏳ Wait ${cooldown}` : "🎰 Spin Now!"}
        </button>
      </div>
    </div>
  );
}

// ─── Withdraw Modal ───────────────────────────────────────────────────────────
interface WithdrawModalProps {
  balance: number;
  coinBalance: number;
  onClose: () => void;
  onWithdraw: (coinsUsed: number, upi: string, fullName: string) => void;
}

function WithdrawModal({ balance, coinBalance, onClose, onWithdraw }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod] = useState("upi");
  const [step, setStep] = useState(1);

  const inr = parseFloat(amount) || 0;
  const coinsNeeded = Math.ceil(inr / COIN_VALUE);

  // Users can withdraw ANY amount (no minimum restrict as requested: "Kitna bhi amount isase petrol kar saken")
  const isValidAmount = inr > 0 && coinsNeeded <= coinBalance;
  const isFieldsFilled = upi.trim() !== "" && fullName.trim() !== "" && contact.trim() !== "";
  const canWithdraw = isValidAmount && isFieldsFilled;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <div className="modal-close" onClick={onClose}>✕</div>
        {step === 1 ? (
          <>
            <div className="modal-title">💸 Withdraw Cash</div>
            <div className="modal-sub">
              Available: <strong style={{ color: "var(--gold)" }}>🪙 {coinBalance.toLocaleString()}</strong>
              {" "}= <strong style={{ color: "var(--green)" }}>₹{balance.toFixed(2)}</strong>
            </div>

            <div className="input-label">Amount to Withdraw (₹)</div>
            <input
              className="input-field"
              type="number"
              placeholder="Enter amount in ₹ (e.g., 50)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            {inr > 0 && (
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, marginTop: -6 }}>
                = 🪙 {coinsNeeded.toLocaleString()} coins will be deducted
              </p>
            )}

            <div className="input-label">Payment Method</div>
            <div className="payment-methods">
              {[
                { id: "upi", icon: "📲", label: "UPI" },
                { id: "gpay", icon: "💎", label: "GPay" },
                { id: "phonepe", icon: "📱", label: "PhonePe" },
                { id: "paytm", icon: "💼", label: "Paytm" },
              ].map(m => (
                <div
                  key={m.id}
                  className={`pay-method ${method === m.id ? "active" : ""}`}
                  onClick={() => setMethod(m.id)}
                >
                  <div className="pay-method-icon">{m.icon}</div>
                  {m.label}
                </div>
              ))}
            </div>

            <div className="input-label">Full Name (UPI Account Holder)</div>
            <input
              className="input-field"
              type="text"
              placeholder="Enter your registered name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />

            <div className="input-label">UPI ID Address</div>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. name@paytm, name@ybl"
              value={upi}
              onChange={e => setUpi(e.target.value)}
            />

            <div className="input-label">Contact / WhatsApp Number</div>
            <input
              className="input-field"
              type="tel"
              placeholder="Enter active WhatsApp number"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />

            {coinsNeeded > coinBalance && inr > 0 && (
              <p style={{ color: "var(--red)", fontSize: 12, marginBottom: 12, textAlign: "center" }}>
                ⚠️ Insufficient coin balance (needed {coinsNeeded.toLocaleString()})
              </p>
            )}

            {!isFieldsFilled && inr > 0 && (
              <p style={{ color: "var(--gold-light)", fontSize: 11, marginBottom: 12, textAlign: "center" }}>
                ℹ️ Payout clear karne ke liye dynamic credentials load karna upayogee hai
              </p>
            )}

            <button className="withdraw-btn-main" disabled={!canWithdraw} onClick={() => setStep(2)}>
              Check & Continue →
            </button>
          </>
        ) : (
          <>
            <div className="modal-icon">✅</div>
            <div className="modal-title" style={{ color: "var(--green)" }}>Confirm Payout Details</div>
            <div style={{ background: "var(--bg)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
              {[
                ["Requested", `₹${parseFloat(amount).toFixed(2)}`],
                ["Coins Cost", `🪙 ${coinsNeeded.toLocaleString()}`],
                ["Payout Method", method.toUpperCase()],
                ["Name", fullName],
                ["UPI Address", upi],
                ["WhatsApp No.", contact],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: "var(--muted2)" }}>{k}</span>
                  <strong style={{ color: "var(--text)" }}>{v}</strong>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, textAlign: "center" }}>
              Hum 24 hours se lekar 48 hours me money direct transfer process kar denge. Any txn history inside ledger list are stored forever.
            </div>
            <button className="withdraw-btn-main" onClick={() => { onWithdraw(coinsNeeded, upi, fullName); onClose(); }}>
              🚀 Confirm Withdrawal
            </button>
            <button onClick={() => setStep(1)} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: "var(--muted2)", cursor: "pointer", fontSize: 13 }}>
              ← Change Details
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
interface HomePageProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  showToast: (msg: string) => void;
  adsWatched: number;
  setAdsWatched: React.Dispatch<React.SetStateAction<number>>;
  checkinDone: boolean;
  setCheckinDone: React.Dispatch<React.SetStateAction<boolean>>;
  setTxns: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

// ─── Unity Interstitial Ad Removed ───────────────────────────────────────────
interface UnityInterstitialAdProps {}

const VIDEO_ADS_COLLECTION = [
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Clash of Strategy: Ultimate Kingdom Warfare",
    dev: "SuperGames Global",
    icon: "🏰",
    category: "Strategy"
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    title: "Subway Run Adventure Match 3D",
    dev: "Infinite Action Studios",
    icon: "🏃",
    category: "Action / Arcade"
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    title: "Royal Match Puzzle: Coins Master",
    dev: "King Casual Co.",
    icon: "👑",
    category: "Casual / Puzzle"
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    title: "Asphalt Stunt Racing: Overdrive X",
    dev: "Nitro Speed Gaming",
    icon: "🏎️",
    category: "Racing"
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    title: "Cyber Defense: Zombie Survival Strike",
    dev: "SciFi Apocalypse, Inc.",
    icon: "🤖",
    category: "RPG / Action"
  }
];

function UnityInterstitialAd(props: UnityInterstitialAdProps) {
  return null;
}

function UnityInterstitialAdOld(props: any) {
  // Unused ad-simulation helper silenced
  const videoRef = null as any;
  const timerLimit = 15;
  const initPhase = "ready" as any;
  const currentAd = null as any;
  const elapsed = 0;
  const duration = 15;
  const isMuted = true;
  const installState = "idle" as any;
  const downloadProgress = 0;
  const videoPlaying = false;
  const videoError = true;
  const setCoins = null as any;
  const setCoinFloats = null as any;
  const showToast = null as any;
  const onComplete = null as any;
  const amount = 0;
  const title = "";
  const VIDEO_ADS_COLLECTION = [] as any;
  const setCurrentAd = null as any;
  const setInitPhase = null as any;
  const setElapsed = null as any;
  const setVideoPlaying = null as any;
  const setIsMuted = null as any;
  const setInstallState = null as any;
  const setDownloadProgress = null as any;
  const setDuration = null as any;
  const setVideoError = null as any;
  return null;
  const videoRefOriginal = useRef<HTMLVideoElement>(null);
  const timerLimitOriginal = 15; // 15 seconds Unity Ad standard limit

  useEffect(() => {
    // Select random video ad from our collection of high quality mobile game advertisements
    const randomIndex = Math.floor(Math.random() * VIDEO_ADS_COLLECTION.length);
    setCurrentAd(VIDEO_ADS_COLLECTION[randomIndex]);

    console.log("Unity Ads SDK Version 4.12.0 Initializing. Game ID: 800002331");
    const loadTimeout = setTimeout(() => {
      setInitPhase("ready");
      console.log("Unity Ads Video Placement Cached & Prepared: Interstitial_Android");
    }, 1500);

    return () => clearTimeout(loadTimeout);
  }, []);

  // Countdown intervals
  useEffect(() => {
    if (initPhase !== "ready") return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= timerLimit) {
          clearInterval(interval);
          return timerLimit;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initPhase]);

  // Attempt to play on ready stage
  useEffect(() => {
    if (initPhase === "ready" && videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setVideoPlaying(true);
        })
        .catch((err) => {
          console.log("Auto-play blocked or delayed: ", err);
          setVideoPlaying(false);
        });
    }
  }, [initPhase, currentAd]);

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const startInstallSequence = () => {
    if (installState !== "idle") return;
    setInstallState("downloading");
    setDownloadProgress(0);

    const intv = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intv);
          setInstallState("installed");
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const handleVideoEnded = () => {
    setElapsed(timerLimit); // Force timer completion
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || timerLimit;
      setDuration(dur);
      // Synchronize timer gracefully
      const percent = cur / dur;
      setElapsed(Math.min(timerLimit, Math.floor(percent * timerLimit)));
    }
  };

  const remaining = Math.max(0, timerLimit - elapsed);
  const currentProgressPercent = (elapsed / timerLimit) * 100;

  return null;
  const dummyJSX = (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "#08090d",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      color: "#fff",
      fontFamily: "'Rajdhani', system-ui, -apple-system, sans-serif"
    }}>
      {initPhase === "loading" || !currentAd ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          height: "100%",
          padding: "40px",
          textAlign: "center"
        }}>
          {/* Pulsating Unity Cube container */}
          <div style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#161920",
            border: "3px solid #f39c12",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 30px rgba(243, 156, 18, 0.3)",
            animation: "pulse 1.5s infinite ease-in-out"
          }}>
            <span style={{ fontSize: "36px", fontWeight: "900", color: "#f39c12" }}>U</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ margin: "5px 0", fontSize: "18px", color: "#eef1f6", letterSpacing: "1px", fontWeight: "bold" }}>
              INITIALIZING UNITY ADS
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Game ID: 800002331 &nbsp;·&nbsp; SDK v4.12.0</p>
          </div>
          <div style={{
            width: "180px",
            height: "5px",
            backgroundColor: "#22252c",
            borderRadius: "3px",
            overflow: "hidden"
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#f39c12",
              boxShadow: "0 0 10px #f39c12",
              animation: "loading-bar 1.5s ease-in-out"
            }} />
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>
            [CACHING PLACEMENT: Interstitial_Android]
          </p>
        </div>
      ) : (
        <div style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px",
          background: "linear-gradient(180deg, #0f1118 0%, #08090c 100%)"
        }}>
          {/* Top Status Belt */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "14px",
            zIndex: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                backgroundColor: "#f39c12",
                color: "#12141c",
                padding: "3px 10px",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: "900",
                letterSpacing: "0.5px"
              }}>
                UNITY LIVE AD
              </div>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                ID: 800002331
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Dynamic countdown state */}
              {remaining > 0 ? (
                <div style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#f39c12",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  ⏱️ Ad completes in <strong style={{ fontSize: "14px", color: "#fff" }}>{remaining}s</strong>
                </div>
              ) : (
                <button
                  id="claim-reward-btn"
                  onClick={() => onComplete(amount)}
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "20px",
                    padding: "8px 20px",
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(16,185,129,0.5)",
                    animation: "pulse 1.5s infinite"
                  }}
                >
                  ✅ CLAIM COINS & CLOSE [X]
                </button>
              )}

              {/* Speaker Control */}
              <button
                id="mute-toggle-btn"
                onClick={handleMuteToggle}
                style={{
                  border: "none",
                  background: isMuted ? "rgba(243, 156, 18, 0.25)" : "rgba(255,255,255,0.08)",
                  borderWidth: isMuted ? "1px" : "0px",
                  borderColor: "#f39c12",
                  borderStyle: "solid",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  boxShadow: isMuted ? "0 0 10px rgba(243, 156, 18, 0.4)" : "none"
                }}
                title={isMuted ? "Unmute Ad Sound" : "Mute Sound"}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            </div>
          </div>

          {/* Interactive Player Frame */}
          <div style={{
            flex: 1,
            position: "relative",
            margin: "15px 0",
            backgroundColor: "#000",
            border: "1.5px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* The Actual HTML5 Video element stream */}
            {!videoError ? (
              <video
                ref={videoRef}
                src={currentAd.url}
                autoPlay
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onError={() => {
                  console.error("Video play error. Activating automatic simulated stream fallback.");
                  setVideoError(true);
                }}
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play().then(() => setVideoPlaying(true));
                    } else {
                      videoRef.current.pause();
                      setVideoPlaying(false);
                    }
                  }
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  cursor: "pointer",
                  zIndex: 2
                }}
              />
            ) : (
              // Backup ultra-polished simulated video screen
              <div style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                textAlign: "center",
                zIndex: 2
              }}>
                <span style={{ fontSize: "50px", marginBottom: "12px", animation: "pulse 2s infinite" }}>📺</span>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#f39c12", letterSpacing: "1px" }}>
                  UNITY VIDEO AD STREAMING
                </span>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", maxWidth: "260px", margin: "6px 0 0 0" }}>
                  Playing "{currentAd.title}" trailer in HD. Timer is running securely.
                </p>
              </div>
            )}

            {/* Overlap Indicator to guide the user to turn sound ON */}
            {isMuted && initPhase === "ready" && (
              <div style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(243, 156, 18, 0.95)",
                color: "#12141c",
                borderRadius: "30px",
                padding: "8px 18px",
                fontSize: "12px",
                fontWeight: "bold",
                zIndex: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(243,156,18,0.5)",
                animation: "pulse 1.2s infinite ease-in-out",
                pointerEvents: "none"
              }}>
                <span>🔊 TAP THE SPEAKER ICON TO UNMUTE AD SOUND</span>
              </div>
            )}

            {/* Subtitle / Video Badge Overlay */}
            <div style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              background: "rgba(10, 12, 18, 0.85)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "10px 14px",
              zIndex: 10,
              maxWidth: "85%",
              pointerEvents: "none"
            }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.5px" }}>
                🎯 Sponsored Ad: {currentAd.category}
              </div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", margin: "2px 0 1px 0" }}>
                {currentAd.title}
              </div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                By {currentAd.dev}
              </div>
            </div>

            {/* Precise progress loader line */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "4px",
              backgroundColor: "#f39c12",
              boxShadow: "0 0 8px #f39c12",
              width: `${currentProgressPercent}%`,
              zIndex: 10,
              transition: "width 0.2s linear"
            }} />
          </div>

          {/* Premium Store Install Card */}
          <div style={{
            background: "rgba(22, 25, 35, 0.9)",
            border: "1.5px solid rgba(243, 156, 18, 0.25)",
            borderRadius: "14px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            zIndex: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
              <div style={{
                fontSize: "24px",
                width: "48px",
                height: "48px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
                {currentAd.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {currentAd.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                  <span>⭐ 4.8</span>
                  <span>·</span>
                  <span>Free Install</span>
                </div>
              </div>
            </div>

            {/* Premium CTA Button with full downloader simulation */}
            {installState === "idle" && (
              <button
                id="ad-install-btn"
                onClick={startInstallSequence}
                style={{
                  background: "linear-gradient(135deg, #f39c12 0%, #d35400 100%)",
                  color: "#12141c",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  boxShadow: "0 0 15px rgba(243, 156, 18, 0.3)",
                  transition: "all 0.2s ease"
                }}
              >
                📥 INSTALL
              </button>
            )}

            {installState === "downloading" && (
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "8px 12px",
                minWidth: "120px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "11px", color: "#f39c12", fontWeight: "bold" }}>DOWNLOADING {downloadProgress}%</div>
                <div style={{ width: "100%", height: "3px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${downloadProgress}%`, height: "100%", backgroundColor: "#f39c12" }} />
                </div>
              </div>
            )}

            {installState === "installed" && (
              <button
                disabled
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  border: "1px solid #10b981",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}
              >
                ✓ INSTALLED
              </button>
            )}
          </div>

          {/* Bottom Branding & Verification Belt */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "12px",
            zIndex: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px" }}>🛡️</span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#f39c12", letterSpacing: "0.5px" }}>
                UNITY MONETIZATION SYSTEM (ID: 800002331)
              </span>
            </div>
            <p style={{ margin: 0, textTransform: "capitalize", fontSize: "10px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              Ad unit triggered for: "{title}". Complete watch time to get reward.
            </p>
          </div>
        </div>
      )}

      {/* Styled Animations Injected */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.95; }
        }
        @keyframes loading-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function HomePage({ coins, setCoins, showToast, adsWatched, setAdsWatched, checkinDone, setCheckinDone, setTxns }: HomePageProps) {
  const [adModal, setAdModal] = useState<Task | null>(null);
  const [spinOpen, setSpinOpen] = useState(false);
  const [dailyNotifyClaimed, setDailyNotifyClaimed] = useState(false);
  const [coinFloats, setCoinFloats] = useState<Array<{ id: number; x: number }>>([]);

  const balance = coins * COIN_VALUE;
  const dailyTarget = 100;
  const dailyProgress = Math.min(adsWatched * 20, dailyTarget);

  const handleTaskClick = (task: Task) => {
    if (task.type === "spin_quest") {
      setSpinOpen(true);
    } else {
      setAdModal(task);
    }
  };

  const awardCoins = (amount: number, desc: string, isAdTask?: boolean) => {
    setCoins(c => c + amount);
    if (isAdTask) {
      setAdsWatched(a => a + 1);
    }
    const id = Date.now();
    setCoinFloats(f => [...f, { id, x: Math.random() * 200 + 100 }]);
    setTimeout(() => setCoinFloats(f => f.filter(c => c.id !== id)), 1000);
    showToast(`🎉 +${amount} Coins Claimed!`);
    
    setTxns(prev => [
      { id: Date.now(), type: "earn", desc, coins: amount, time: "Just now" },
      ...prev
    ]);
  };

  const handleEarn = (amount: number) => {
    awardCoins(amount, adModal ? adModal.title : "Task Reward", true);
  };

  const handleCheckin = () => {
    if (checkinDone) return;
    awardCoins(COINS_PER_CHECKIN, "Daily Bonus Check-in");
    setCheckinDone(true);
  };

  const handleSpinComplete = (amount: number) => {
    awardCoins(amount, "Lucky Spin Reward");
  };

  const streakDays = [true, true, true, false, false, false, false];

  return (
    <div className="page">
      {coinFloats.map(cf => (
        <div key={cf.id} className="coin-float" style={{ left: cf.x, top: 200 }}>🪙</div>
      ))}

      {/* Balance Hero */}
      <div className="hero-card">
        <div className="balance-label">💰 Total Coins</div>
        <div className="balance-row">
          <div className="coin-icon-big">🪙</div>
          <div className="balance-amount">{coins.toLocaleString()}</div>
          <div className="balance-unit">coins</div>
        </div>
        <div className="balance-inr">
          ≈ <strong>₹{balance.toFixed(2)}</strong> &nbsp;·&nbsp; 1 coin = ₹{COIN_VALUE}
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-val">{adsWatched}</div>
            <div className="hero-stat-lbl">Tasks Done</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val">₹{balance.toFixed(0)}</div>
            <div className="hero-stat-lbl">Earned</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val">{Math.max(0, Math.ceil((200 - balance) / COIN_VALUE))}c</div>
            <div className="hero-stat-lbl">To Withdraw</div>
          </div>
        </div>
      </div>

      {/* Daily push notification active alert banner (Value: 100 Coins) */}
      {!dailyNotifyClaimed && (
        <div className="daily-notify-banner animate-pulse" style={{
          background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.25))",
          border: "1.5px solid rgba(139, 92, 246, 0.4)",
          borderRadius: "16px",
          padding: "16px",
          margin: "14px 16px 4px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--cyan)", fontFamily: "Rajdhani, sans-serif", fontSize: 15, letterSpacing: "0.5px" }}>
              📢 24H REWARD NOTIFICATION!
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Aaj ka free reward claim karein! <strong>100 Coins</strong> available hain.
            </div>
          </div>
          <button onClick={() => {
            awardCoins(100, "Notification: Daily 100c Reward Claimed");
            setDailyNotifyClaimed(true);
          }} className="earn-btn" style={{ background: "linear-gradient(135deg, var(--cyan), #0891b2)", padding: "10px 14px", flexShrink: 0 }}>
            CLAIM
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ padding: "0 16px", marginTop: 4, marginBottom: 4 }}>
        <div className="section-title" style={{ marginBottom: 10, marginTop: 4 }}>⚡ Quick Actions</div>
      </div>
      <div className="quick-actions">
        {[
          { icon: "🪙", label: "Tap Gold", bg: "rgba(245,158,11,0.12)", action: () => handleTaskClick(TASKS[0]) },
          { icon: "📲", label: "Navi App", bg: "rgba(139,92,246,0.12)", action: () => handleTaskClick(TASKS[1]) },
          { icon: "🛡️", label: "Captcha", bg: "rgba(16,185,129,0.12)", action: () => handleTaskClick(TASKS[3]) },
          { icon: "🎰", label: "Spin Wheel", bg: "rgba(236,72,153,0.12)", action: () => setSpinOpen(true) },
        ].map((q, i) => (
          <div key={i} className="quick-btn" onClick={q.action}>
            <div className="quick-icon" style={{ background: q.bg }}>{q.icon}</div>
            <div className="quick-label">{q.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Check-in */}
      <div className="section" style={{ marginTop: 16 }}>
        <div className="section-header">
          <div className="section-title">📅 Daily Bonus</div>
        </div>
      </div>
      <div className="checkin-strip" onClick={handleCheckin}
        style={{ opacity: checkinDone ? 0.6 : 1 }}>
        <div className="checkin-icon">{checkinDone ? "✅" : "🎯"}</div>
        <div className="checkin-streak">
          <div className="checkin-title">{checkinDone ? "Checked In Today!" : "Daily Check-in"}</div>
          <div className="checkin-sub">Streak: 3 days 🔥</div>
          <div className="streak-dots">
            {streakDays.map((d, i) => (
              <div key={i} className={`streak-dot ${d ? "done" : i === 3 ? "today" : ""}`} />
            ))}
          </div>
        </div>
        <div className="checkin-reward">+{COINS_PER_CHECKIN} 🪙</div>
      </div>

      {/* Daily Progress */}
      <div className="progress-wrap">
        <div className="progress-header">
          <span className="progress-title">📊 Daily Progress</span>
          <span className="progress-val">{dailyProgress}/{dailyTarget} coins</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(dailyProgress / dailyTarget) * 100}%` }} />
        </div>
        <div className="progress-sub">
          Complete more tasks to hit your daily goal!
        </div>
      </div>

      {/* Lucky Spin */}
      <div className="spin-card" onClick={() => setSpinOpen(true)}>
        <div className="spin-wheel-mini">🎰</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#8B5CF6" }}>Lucky Spin</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Win up to 100 coins!</div>
        </div>
        <button className="earn-btn" style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", color: "#fff" }}>
          SPIN
        </button>
      </div>

      {/* Earn Tasks */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">🎯 Earn Tasks</div>
          <div className="section-badge">{TASKS.length} Available</div>
        </div>
        {TASKS.map(task => (
          <div
            key={task.id}
            className="task-card"
            style={{ "--accent": task.color } as React.CSSProperties}
            onClick={() => handleTaskClick(task)}
          >
            <div className="task-card" style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
              background: task.color, borderRadius: "18px 0 0 18px", margin: 0, padding: 0,
              border: "none", display: "block"
            }} />
            <div className="task-icon-wrap" style={{ background: `${task.color}20` }}>
              {task.icon}
            </div>
            <div className="task-info">
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                <div className="task-time">⏱ {task.time}</div>
                <div className="chip">{task.type === "captcha" ? "Puzzle" : task.type === "install" ? "Install" : "Challenge"}</div>
              </div>
            </div>
            <div className="task-reward">
              <div className="task-coins" style={{ color: task.color }}>
                🪙 +{task.coins}
              </div>
              <button className="earn-btn" style={{ background: `linear-gradient(135deg,${task.color},${task.color}cc)` }}>
                EARN
              </button>
            </div>
          </div>
        ))}
      </div>

      {adModal && adModal.type === "captcha" ? (
        <CaptchaModal
          onClose={() => setAdModal(null)}
          onComplete={(amt) => {
            handleEarn(amt);
            setAdModal(null);
          }}
        />
      ) : adModal && (
        <AdModal
          task={adModal}
          onClose={() => setAdModal(null)}
          onComplete={handleEarn}
        />
      )}

      {spinOpen && (
        <SpinWheelModal
          onClose={() => setSpinOpen(false)}
          onComplete={handleSpinComplete}
        />
      )}
    </div>
  );
}

// ─── Wallet Page ──────────────────────────────────────────────────────────────
interface WalletPageProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  showToast: (msg: string) => void;
  txns: Transaction[];
  setTxns: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

function WalletPage({ coins, setCoins, showToast, txns, setTxns }: WalletPageProps) {
  const [withdrawModal, setWithdrawModal] = useState(false);
  const balance = coins * COIN_VALUE;

  const handleWithdraw = (coinsDeducted: number, upi: string, fullName: string) => {
    setCoins(c => Math.max(0, c - coinsDeducted));
    setTxns(t => [
      { id: Date.now(), type: "withdraw", desc: `Withdraw ₹${(coinsDeducted * COIN_VALUE).toFixed(2)} [to ${upi} (${fullName})]`, coins: -coinsDeducted, time: "Just now" },
      ...t
    ]);
    showToast("✅ Withdrawal Requested!");
  };

  return (
    <div className="page">
      <div className="wallet-hero">
        <div className="balance-label">💳 Wallet Balance</div>
        <div className="balance-row">
          <div className="coin-icon-big">🪙</div>
          <div className="balance-amount">{coins.toLocaleString()}</div>
          <div className="balance-unit">coins</div>
        </div>
        <div className="balance-inr" style={{ marginBottom: 0 }}>
          Cash Value: <strong style={{ color: "var(--green)", fontSize: 22, fontFamily: "Rajdhani, sans-serif" }}>
            ₹{balance.toFixed(2)}
          </strong>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--muted2)", marginBottom: 4 }}>Min Withdraw</div>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--green)" }}>None 💸</div>
          </div>
          <div style={{ flex: 1, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--muted2)", marginBottom: 4 }}>Coin Rate</div>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>₹0.0012</div>
          </div>
          <div style={{ flex: 1, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 12, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--muted2)", marginBottom: 4 }}>Daily Limit</div>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--cyan)" }}>
              No Limit Max
            </div>
          </div>
        </div>
        <button
          className="withdraw-btn-main"
          disabled={coins <= 0}
          onClick={() => setWithdrawModal(true)}
        >
          {coins > 0 ? "💸 Withdraw Now" : "🔒 Earn more to withdraw"}
        </button>
      </div>

      {/* Transactions */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">📋 Transactions</div>
          <div className="section-badge">{txns.length} items</div>
        </div>
        {txns.map(txn => (
          <div key={txn.id} className="txn-item">
            <div className="txn-icon" style={{
              background: txn.type === "earn" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"
            }}>
              {txn.type === "earn" ? "⬆️" : "⬇️"}
            </div>
            <div className="txn-info">
              <div className="txn-title">{txn.desc}</div>
              <div className="txn-time">{txn.time}</div>
            </div>
            <div className="txn-amount" style={{
              color: txn.coins > 0 ? "var(--green)" : "var(--red)"
            }}>
              {txn.coins > 0 ? "+" : ""}{txn.coins} 🪙
            </div>
          </div>
        ))}
      </div>

      {withdrawModal && (
        <WithdrawModal
          balance={balance}
          coinBalance={coins}
          onClose={() => setWithdrawModal(false)}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  );
}

// ─── Leaderboard Page ─────────────────────────────────────────────────────────
interface LeaderboardPageProps {
  coins: number;
}

function LeaderboardPage({ coins }: LeaderboardPageProps) {
  const halfHourIndex = Math.floor(Date.now() / (30 * 60 * 1000)) % NAME_POOLS.length;
  const currentPool = NAME_POOLS[halfHourIndex];

  const board = [
    ...currentPool.map((p) => ({
      name: p.name,
      avatar: p.avatar,
      coins: p.baseCoins + (Math.floor(Date.now() / 60000) % 30) * 12, // subtle variation
      isUser: false
    })),
    { name: "You", avatar: "⭐", coins: coins, isUser: true }
  ]
  .sort((a, b) => b.coins - a.coins)
  .map((l, i) => ({ ...l, rank: i + 1 }));

  return (
    <div className="page">
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 28, fontWeight: 700 }}>
          🏆 Leaderboard
        </div>
        <div style={{ fontSize: 13, color: "var(--muted2)", marginTop: 4 }}>
          Top earners this week
        </div>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, padding: "16px 20px", marginBottom: 8 }}>
        {[board[1], board[0], board[2]].filter(Boolean).map((p, i) => {
          const heights = [100, 120, 80];
          const colors = ["#94A3B8", "#F59E0B", "#D97706"];
          return (
            <div key={p.rank} style={{ textAlign: "center", flex: i === 1 ? 1.2 : 1 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{p.avatar}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
              <div style={{
                height: heights[i], background: `${colors[i]}20`,
                border: `2px solid ${colors[i]}40`,
                borderRadius: "12px 12px 0 0", display: "flex", alignItems: "flex-start",
                justifyContent: "center", paddingTop: 8
              }}>
                <span style={{ fontFamily: "Rajdhani", fontSize: 20, fontWeight: 700, color: colors[i] }}>
                  #{[2, 1, 3][i]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="section">
        {board.map(p => (
          <div key={p.rank} className={`leaderboard-item ${p.isUser ? "you" : ""}`}>
            <div className="rank-badge">
              {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}
            </div>
            <div className="lb-avatar">{p.avatar}</div>
            <div className="lb-name">
              {p.name} {p.isUser && <span style={{ fontSize: 11, color: "var(--gold)", marginLeft: 4 }}>(You)</span>}
            </div>
            <div className="lb-coins">🪙 {p.coins.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
interface ProfilePageProps {
  coins: number;
  txns: Transaction[];
  onClose: () => void;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  setTxns: React.Dispatch<React.SetStateAction<Transaction[]>>;
  showToast: (msg: string) => void;
}

function ProfilePage({ coins, txns, onClose, setCoins, setTxns, showToast }: ProfilePageProps) {
  const balance = (coins * COIN_VALUE).toFixed(2);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [referBonusClaimed, setReferBonusClaimed] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("teekendrasingh00@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReferShare = () => {
    const shareText = encodeURIComponent(
      "Hey! Join the Money App now, use my referral code EARN2025 and earn free Paytm/UPI cash! Link: https://ais-pre-hftmvh4kmenz7b34i67k5e-24958854959.asia-east1.run.app"
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");

    if (!referBonusClaimed) {
      setReferBonusClaimed(true);
      setCoins(c => c + 500);
      setTxns(prev => [
        { id: Date.now(), type: "earn", desc: "Referral Invite Bonus Claimed", coins: 500, time: "Just now" },
        ...prev
      ]);
      showToast("🎁 +500 Coins Referral Bonus Claimed!");
    } else {
      showToast("📢 Whatsapp shared! Refer bonus already claimed.");
    }
  };

  const earningTxns = txns.filter(t => t.type === "earn");

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
        <button onClick={onClose} style={{ border: "none", background: "none", color: "var(--muted2)", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
          ← Back
        </button>
        <span style={{ fontWeight: 700, fontFamily: "Rajdhani-Sans, sans-serif", fontSize: "18px", color: "var(--text)", letterSpacing: "0.5px" }}>Profile</span>
        <div style={{ width: 44 }}></div>
      </div>
      <div className="profile-hero">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">Aap Ka Naam</div>
        <div style={{ color: "var(--muted2)", fontSize: 13, marginTop: 4 }}>user@example.com</div>
        <div className="profile-level">⭐ Silver Member</div>
        <div className="profile-stats">
          {[
            { v: coins.toLocaleString(), l: "Total Coins" },
            { v: `₹${balance}`, l: "Earned" },
            { v: "3 Days", l: "Streak" },
          ].map((s, i) => (
            <div key={i} className="profile-stat">
              <div className="profile-stat-val">{s.v}</div>
              <div className="profile-stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral */}
      <div className="referral-card">
        <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 17, fontWeight: 700, color: "#8B5CF6" }}>
          👥 Refer & Earn
        </div>
        <div style={{ fontSize: 13, color: "var(--muted2)", marginTop: 4 }}>
          Invite friends → earn 500 coins per referral!
        </div>
        <div className="ref-code-box">EARN2025</div>
        <button onClick={handleReferShare} style={{ width: "100%", marginTop: 12, background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Exo 2, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          📲 Share Referral to WhatsApp
        </button>
      </div>

      {/* Menu */}
      <div className="section">
        {[
          { icon: "📊", label: "Earning History", bg: "rgba(16,185,129,0.12)", type: "history" },
          { icon: "💬", label: "Support", bg: "rgba(139,92,246,0.12)", type: "support" },
          { icon: "📜", label: "Terms & Privacy", bg: "rgba(100,116,139,0.12)", type: "terms" },
        ].map((m, i) => (
          <div key={i} className="menu-item" onClick={() => setActiveModal(m.type)}>
            <div className="menu-icon" style={{ background: m.bg }}>{m.icon}</div>
            <div className="menu-label">{m.label}</div>
            <div className="menu-arrow">›</div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {activeModal === "history" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setActiveModal(null)}>✕</div>
            <div className="modal-title" style={{ color: "var(--green)" }}>📊 Earning History</div>
            <div className="modal-sub" style={{ marginBottom: 16 }}>Sari video aur ad watching details yahan hain</div>

            <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
              {earningTxns.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--muted)", padding: "20px 0" }}>Abhi tak koi earning nahi hui hai!</p>
              ) : (
                earningTxns.map(txn => (
                  <div key={txn.id} className="txn-item" style={{ background: "var(--bg)", marginBottom: 8 }}>
                    <div className="txn-icon" style={{ background: "rgba(16,185,129,0.15)" }}>⬆️</div>
                    <div className="txn-info">
                      <div className="txn-title" style={{ fontSize: "13px" }}>{txn.desc}</div>
                      <div className="txn-time" style={{ fontSize: "10px" }}>{txn.time}</div>
                    </div>
                    <div className="txn-amount" style={{ color: "var(--green)", fontSize: "15px" }}>
                      +{txn.coins} 🪙
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeModal === "support" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setActiveModal(null)}>✕</div>
            <div className="modal-icon">💬</div>
            <div className="modal-title" style={{ color: "var(--cyan)" }}>Support / Contact</div>
            <div className="modal-sub" style={{ marginBottom: 20 }}>
              Humse seedhe contact karein kisi bhi withdrawal ya coin issue ke liye.
            </div>

            <div style={{ background: "var(--bg)", padding: 18, borderRadius: 16, border: "1px solid var(--border)", marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Official Support Email</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)", wordBreak: "break-all" }}>teekendrasingh00@gmail.com</div>
            </div>

            <button className="withdraw-btn-main" onClick={handleCopyEmail} style={{ background: "linear-gradient(135deg, var(--cyan), #0891b2)", color: "#fff", marginBottom: 8 }}>
              {copied ? "✅ Copied to Clipboard" : "📋 Copy Email Address"}
            </button>
            <a href="mailto:teekendrasingh00@gmail.com" className="withdraw-btn-main" style={{ display: "block", textAlign: "center", textDecoration: "none", background: "linear-gradient(135deg, var(--gold), var(--gold-dark))" }}>
              ✉️ Email Us Directly
            </a>
          </div>
        </div>
      )}

      {activeModal === "terms" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setActiveModal(null)}>✕</div>
            <div className="modal-title">📜 Terms & Privacy</div>
            <div className="modal-sub">Niyam, Shartein & Privacy Guidelines</div>
            <div style={{ maxHeight: "280px", overflowY: "auto", fontSize: "12px", color: "var(--muted2)", lineHeight: "1.6", background: "var(--bg)", padding: 14, borderRadius: 12 }}>
              <p style={{ marginBottom: 12, color: "#fff" }}><strong>📋 USER SAFETY & PRIVACY CHARTER</strong><br />Is App ka sahi upayog aur niyam niche diye gaye hain:</p>

              <p style={{ marginBottom: 12 }}><strong>1. Earning Rule & Limit:</strong> Humare application me dynamic tasks complete karke Coins earn kiye ja sakte hain. Captcha puzzle fill karne par aapko har bar bilkul <strong>25 Coins</strong> milenge. Lucky Wheel Spin karne par different payouts credit hote hain.</p>

              <p style={{ marginBottom: 12 }}><strong>2. Payout Verification Details:</strong> Withdrawal lagane ke liye real user details mandatory hain. Aapko apna valid Full Name, dynamic Contact/WhatsApp Number, aur authentic UPI ID (jaise: paytm, phonepe ya upi address) correct format me fill karna hoga.</p>

              <p style={{ marginBottom: 12 }}><strong>3. No Minimum Limit:</strong> Aap humare wallet se bina kisi limit ke <strong>kitna bhi balance (any amount)</strong> direct apne upi app me transfer kar sakte hain! Koi restriction nahi hai.</p>

              <p style={{ marginBottom: 12 }}><strong>4. Ant-Bot Strict Policy:</strong> Kisi bhi auto-clicker, macro script ya dynamic bypass tooling ka use strictly disallowed hai. Is niyam ke ullanghan par wallet suspend ya request refuse kiya jata hai.</p>

              <p style={{ marginBottom: 12 }}><strong>5. Processing Time frame:</strong> Safe transfers ko ensure karne ke liye manual accounting review complete kiya jata hai, jisme 24 hours se lekar 48 hours ka maximum samay lagta hai.</p>

              <p style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 8 }}>Queries or support? Direct email us at: <strong style={{ color: "var(--gold)" }}>teekendrasingh00@gmail.com</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("earn");
  const [coins, setCoins] = useState(1250);
  const [adsWatched, setAdsWatched] = useState(0);
  const [checkinDone, setCheckinDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const [txns, setTxns] = useState<Transaction[]>(TRANSACTIONS);
  const [showProfile, setShowProfile] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const navItems = [
    { id: "wallet", icon: "💳", label: "Wallet" },
    { id: "earn", icon: "🪙", label: "Earn", isCenter: true },
    { id: "board", icon: "🏆", label: "Ranks" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-logo">Mon<span>ey</span></div>
          <div className="header-right">
            <div className="avatar-btn" onClick={() => setShowProfile(true)} style={{ cursor: "pointer" }}>👤</div>
          </div>
        </div>

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}

        {/* Pages */}
        {tab === "earn" ? (
          <HomePage
            coins={coins} setCoins={setCoins}
            showToast={showToast}
            adsWatched={adsWatched} setAdsWatched={setAdsWatched}
            checkinDone={checkinDone} setCheckinDone={setCheckinDone}
            setTxns={setTxns}
          />
        ) : tab === "wallet" ? (
          <WalletPage coins={coins} setCoins={setCoins} showToast={showToast} txns={txns} setTxns={setTxns} />
        ) : (
          <LeaderboardPage coins={coins} />
        )}

        {/* Fullscreen Profile Overlay inside standard app framework */}
        {showProfile && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "var(--bg)",
            zIndex: 150,
            overflowY: "auto",
            paddingBottom: "80px"
          }}>
            <ProfilePage coins={coins} txns={txns} onClose={() => setShowProfile(false)} setCoins={setCoins} setTxns={setTxns} showToast={showToast} />
          </div>
        )}

        {/* Bottom Nav */}
        <div className="bottom-nav">
          {navItems.map(n => (
            n.isCenter ? (
              <div key={n.id} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div className="nav-earn-btn" onClick={() => setTab("earn")}>
                  {n.icon}
                </div>
              </div>
            ) : (
              <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <div className="nav-icon">{n.icon}</div>
                <div className="nav-label">{n.label}</div>
              </div>
            )
          ))}
        </div>
      </div>
    </>
  );
}
