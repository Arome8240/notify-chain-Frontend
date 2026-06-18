// Mock data layer for Notify-Chain.
// All data is in-memory and stands in for the off-chain helper API.

export type Chain = "Ethereum" | "Base" | "Arbitrum" | "Optimism" | "Polygon";

export type EventStatus = "delivered" | "pending" | "failed";

export type ChannelType = "webhook" | "email" | "telegram" | "discord";

export type RuleStatus = "active" | "paused";

export interface ChainEvent {
  id: string;
  contract: string;
  contractAddress: string;
  eventName: string;
  chain: Chain;
  blockNumber: number;
  txHash: string;
  status: EventStatus;
  matchedRule: string | null;
  timestamp: string; // ISO
  args: Record<string, string>;
  // Reason the notification delivery failed — only present for failed events.
  failureReason?: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  contract: string;
  eventSignature: string;
  chain: Chain;
  condition: string;
  channels: ChannelType[];
  status: RuleStatus;
  triggered24h: number;
  lastTriggered: string | null;
}

export interface WatchedContract {
  id: string;
  name: string;
  address: string;
  chain: Chain;
  type: "ERC-20" | "ERC-721" | "DeFi" | "Governance" | "Custom";
  events: string[];
  eventsToday: number;
  addedAt: string;
  active: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: ChannelType;
  destination: string;
  connected: boolean;
  deliveries24h: number;
  successRate: number; // 0-100
  lastDelivery: string | null;
}

export const CHAINS: Chain[] = [
  "Ethereum",
  "Base",
  "Arbitrum",
  "Optimism",
  "Polygon",
];

export const chainColors: Record<Chain, string> = {
  Ethereum: "#6f7cff",
  Base: "#3b82f6",
  Arbitrum: "#5fb3f3",
  Optimism: "#f0506e",
  Polygon: "#9b7cff",
};

export const events: ChainEvent[] = [
  {
    id: "evt_9f2a",
    contract: "USDC",
    contractAddress: "0xA0b8...eB48",
    eventName: "Transfer",
    chain: "Ethereum",
    blockNumber: 21384712,
    txHash: "0x7b1c...a4e2",
    status: "delivered",
    matchedRule: "Large USDC transfers",
    timestamp: new Date(Date.now() - 1000 * 28).toISOString(),
    args: { from: "0x3c2f...91ab", to: "0x88dE...0f2c", value: "2,400,000" },
  },
  {
    id: "evt_8d71",
    contract: "Aave Pool",
    contractAddress: "0x8787...A3F2",
    eventName: "LiquidationCall",
    chain: "Ethereum",
    blockNumber: 21384709,
    txHash: "0x2af0...77bc",
    status: "delivered",
    matchedRule: "Aave liquidations",
    timestamp: new Date(Date.now() - 1000 * 64).toISOString(),
    args: { user: "0x9a01...c3de", debt: "182,400", collateral: "WETH" },
  },
  {
    id: "evt_7c40",
    contract: "Uniswap V3",
    contractAddress: "0xE592...1564",
    eventName: "Swap",
    chain: "Base",
    blockNumber: 18920341,
    txHash: "0x44bd...1a9f",
    status: "pending",
    matchedRule: "Whale swaps on Base",
    timestamp: new Date(Date.now() - 1000 * 119).toISOString(),
    args: { pool: "WETH/USDC", amount: "640,000", direction: "buy" },
  },
  {
    id: "evt_6b2e",
    contract: "ENS Registry",
    contractAddress: "0x00000...0aB3",
    eventName: "NameRegistered",
    chain: "Ethereum",
    blockNumber: 21384701,
    txHash: "0x91cc...e0d4",
    status: "delivered",
    matchedRule: null,
    timestamp: new Date(Date.now() - 1000 * 205).toISOString(),
    args: { name: "vault.eth", owner: "0x2b7a...44f1", years: "3" },
  },
  {
    id: "evt_5a18",
    contract: "Lido stETH",
    contractAddress: "0xae7a...A84F",
    eventName: "Submitted",
    chain: "Ethereum",
    blockNumber: 21384698,
    txHash: "0x0db2...5fac",
    status: "failed",
    matchedRule: "Lido deposits",
    timestamp: new Date(Date.now() - 1000 * 320).toISOString(),
    args: { sender: "0x77c1...9bd0", amount: "512 ETH" },
    failureReason:
      "Webhook endpoint returned 503 Service Unavailable after 3 retries.",
  },
  {
    id: "evt_4f93",
    contract: "Arbitrum Bridge",
    contractAddress: "0x4Dbd...9aE1",
    eventName: "DepositInitiated",
    chain: "Arbitrum",
    blockNumber: 271820114,
    txHash: "0xcd71...3e20",
    status: "delivered",
    matchedRule: "Bridge deposits",
    timestamp: new Date(Date.now() - 1000 * 488).toISOString(),
    args: { token: "USDC", amount: "94,000", to: "0x55ab...12cd" },
  },
  {
    id: "evt_3e07",
    contract: "Compound v3",
    contractAddress: "0xc3d6...77Bf",
    eventName: "Supply",
    chain: "Optimism",
    blockNumber: 128944210,
    txHash: "0x6610...bb47",
    status: "delivered",
    matchedRule: null,
    timestamp: new Date(Date.now() - 1000 * 612).toISOString(),
    args: { src: "0x12fa...8e90", amount: "38,200 USDC" },
  },
  {
    id: "evt_2d55",
    contract: "Governor Bravo",
    contractAddress: "0xc0Da...0F19",
    eventName: "ProposalCreated",
    chain: "Ethereum",
    blockNumber: 21384640,
    txHash: "0xa8f3...90c1",
    status: "delivered",
    matchedRule: "New governance proposals",
    timestamp: new Date(Date.now() - 1000 * 905).toISOString(),
    args: { id: "248", proposer: "0x4f0c...aa12" },
  },
  {
    id: "evt_1c33",
    contract: "Blur Marketplace",
    contractAddress: "0x0000...0001",
    eventName: "OrdersMatched",
    chain: "Ethereum",
    blockNumber: 21384611,
    txHash: "0x7d92...44ee",
    status: "pending",
    matchedRule: "NFT sales > 50 ETH",
    timestamp: new Date(Date.now() - 1000 * 1240).toISOString(),
    args: { collection: "Azuki", price: "62 ETH" },
  },
  {
    id: "evt_0c22",
    contract: "Maker DSR",
    contractAddress: "0x373a...A4f8",
    eventName: "Join",
    chain: "Ethereum",
    blockNumber: 21384588,
    txHash: "0xb904...12fe",
    status: "failed",
    matchedRule: "DSR deposits",
    timestamp: new Date(Date.now() - 1000 * 1420).toISOString(),
    args: { usr: "0x61aa...77c0", wad: "1,250,000 DAI" },
    failureReason:
      "Telegram API rate limit exceeded (429). Notification was not delivered.",
  },
  {
    id: "evt_0b11",
    contract: "Polygon PoS",
    contractAddress: "0xA0c6...5e2A",
    eventName: "Withdraw",
    chain: "Polygon",
    blockNumber: 64120877,
    txHash: "0x33aa...c7b0",
    status: "delivered",
    matchedRule: null,
    timestamp: new Date(Date.now() - 1000 * 1600).toISOString(),
    args: { user: "0x9911...23ab", amount: "12,000 MATIC" },
  },
];

export const rules: NotificationRule[] = [
  {
    id: "rule_01",
    name: "Large USDC transfers",
    description: "Alert when a single USDC transfer exceeds $1M",
    contract: "USDC",
    eventSignature: "Transfer(address,address,uint256)",
    chain: "Ethereum",
    condition: "value > 1,000,000",
    channels: ["webhook", "telegram"],
    status: "active",
    triggered24h: 42,
    lastTriggered: new Date(Date.now() - 1000 * 28).toISOString(),
  },
  {
    id: "rule_02",
    name: "Aave liquidations",
    description: "Notify on every liquidation call in the Aave v3 pool",
    contract: "Aave Pool",
    eventSignature: "LiquidationCall(address,address,uint256)",
    chain: "Ethereum",
    condition: "any",
    channels: ["discord", "email"],
    status: "active",
    triggered24h: 11,
    lastTriggered: new Date(Date.now() - 1000 * 64).toISOString(),
  },
  {
    id: "rule_03",
    name: "Whale swaps on Base",
    description: "Track swaps over $500k on Uniswap V3 (Base)",
    contract: "Uniswap V3",
    eventSignature: "Swap(address,address,int256,int256)",
    chain: "Base",
    condition: "amountUSD > 500,000",
    channels: ["webhook"],
    status: "active",
    triggered24h: 7,
    lastTriggered: new Date(Date.now() - 1000 * 119).toISOString(),
  },
  {
    id: "rule_04",
    name: "New governance proposals",
    description: "Watch for new proposals across governor contracts",
    contract: "Governor Bravo",
    eventSignature: "ProposalCreated(uint256,address)",
    chain: "Ethereum",
    condition: "any",
    channels: ["telegram", "discord"],
    status: "active",
    triggered24h: 2,
    lastTriggered: new Date(Date.now() - 1000 * 905).toISOString(),
  },
  {
    id: "rule_05",
    name: "NFT sales > 50 ETH",
    description: "High-value NFT settlements on Blur and OpenSea",
    contract: "Blur Marketplace",
    eventSignature: "OrdersMatched(bytes32,bytes32)",
    chain: "Ethereum",
    condition: "price > 50 ETH",
    channels: ["webhook", "email"],
    status: "paused",
    triggered24h: 0,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
  },
  {
    id: "rule_06",
    name: "Bridge deposits",
    description: "Monitor large deposits into canonical L2 bridges",
    contract: "Arbitrum Bridge",
    eventSignature: "DepositInitiated(address,address,uint256)",
    chain: "Arbitrum",
    condition: "amount > 50,000",
    channels: ["webhook"],
    status: "active",
    triggered24h: 19,
    lastTriggered: new Date(Date.now() - 1000 * 488).toISOString(),
  },
];

export const watchlist: WatchedContract[] = [
  {
    id: "wc_01",
    name: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chain: "Ethereum",
    type: "ERC-20",
    events: ["Transfer", "Approval"],
    eventsToday: 18420,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    active: true,
  },
  {
    id: "wc_02",
    name: "Aave v3 Pool",
    address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA3F2",
    chain: "Ethereum",
    type: "DeFi",
    events: ["Supply", "Borrow", "LiquidationCall"],
    eventsToday: 1240,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    active: true,
  },
  {
    id: "wc_03",
    name: "Uniswap V3 Router",
    address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    chain: "Base",
    type: "DeFi",
    events: ["Swap", "Mint", "Burn"],
    eventsToday: 9821,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    active: true,
  },
  {
    id: "wc_04",
    name: "Azuki",
    address: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
    chain: "Ethereum",
    type: "ERC-721",
    events: ["Transfer", "OrdersMatched"],
    eventsToday: 312,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    active: true,
  },
  {
    id: "wc_05",
    name: "Compound Governor",
    address: "0xc0Da02939E1441F497fd74F78cE7Decb17B66529",
    chain: "Ethereum",
    type: "Governance",
    events: ["ProposalCreated", "VoteCast"],
    eventsToday: 24,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    active: false,
  },
  {
    id: "wc_06",
    name: "Arbitrum Bridge",
    address: "0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3F",
    chain: "Arbitrum",
    type: "Custom",
    events: ["DepositInitiated", "WithdrawalFinalized"],
    eventsToday: 880,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    active: true,
  },
];

export const channels: NotificationChannel[] = [
  {
    id: "ch_01",
    name: "Ops Webhook",
    type: "webhook",
    destination: "https://api.acme.xyz/hooks/notify-chain",
    connected: true,
    deliveries24h: 1284,
    successRate: 99.7,
    lastDelivery: new Date(Date.now() - 1000 * 28).toISOString(),
  },
  {
    id: "ch_02",
    name: "Trading Telegram",
    type: "telegram",
    destination: "@acme_alerts",
    connected: true,
    deliveries24h: 642,
    successRate: 100,
    lastDelivery: new Date(Date.now() - 1000 * 119).toISOString(),
  },
  {
    id: "ch_03",
    name: "Risk Discord",
    type: "discord",
    destination: "#liquidations",
    connected: true,
    deliveries24h: 211,
    successRate: 98.1,
    lastDelivery: new Date(Date.now() - 1000 * 64).toISOString(),
  },
  {
    id: "ch_04",
    name: "On-call Email",
    type: "email",
    destination: "alerts@acme.xyz",
    connected: false,
    deliveries24h: 0,
    successRate: 0,
    lastDelivery: null,
  },
];

// 24h sparkline / area chart series — events captured per hour.
export const eventVolume = [
  { hour: "00:00", events: 820, matched: 180 },
  { hour: "02:00", events: 640, matched: 132 },
  { hour: "04:00", events: 510, matched: 98 },
  { hour: "06:00", events: 720, matched: 164 },
  { hour: "08:00", events: 1180, matched: 286 },
  { hour: "10:00", events: 1640, matched: 402 },
  { hour: "12:00", events: 1980, matched: 511 },
  { hour: "14:00", events: 2240, matched: 588 },
  { hour: "16:00", events: 2010, matched: 503 },
  { hour: "18:00", events: 1720, matched: 441 },
  { hour: "20:00", events: 1380, matched: 332 },
  { hour: "22:00", events: 1040, matched: 248 },
];

export const dashboardStats = {
  eventsToday: 31840,
  eventsTodayDelta: 12.4,
  notificationsSent: 4218,
  notificationsDelta: 8.1,
  activeRules: rules.filter((r) => r.status === "active").length,
  watchedContracts: watchlist.length,
  deliverySuccess: 99.2,
  avgLatencyMs: 840,
};

export const channelLabels: Record<ChannelType, string> = {
  webhook: "Webhook",
  email: "Email",
  telegram: "Telegram",
  discord: "Discord",
};

export function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
