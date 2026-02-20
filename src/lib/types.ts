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
