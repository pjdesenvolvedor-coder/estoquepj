export type ServiceType = 'Netflix' | 'Disney+' | 'HBO Max' | 'Prime Video' | 'Spotify' | 'Youtube' | 'Crunchyroll' | 'Outro';

export interface InventoryItem {
  id: string;
  service: ServiceType;
  account: string;
  credentials: string;
  status: 'available' | 'used';
  notes: string;
  profiles?: number;
  profilesUsed?: number; // Contador para saber quantos perfis já foram vendidos
  createdAt: number;
}
