export type ServiceType = string;

export interface InventoryItem {
  id: string;
  service: ServiceType;
  account: string;
  credentials: string;
  status: 'available' | 'used';
  notes: string;
  profiles?: number;
  profilesUsed?: number;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  itemId: string;
  service: string;
  account: string;
  message: string;
  timestamp: number;
}
