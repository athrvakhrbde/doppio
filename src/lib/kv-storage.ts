interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

interface Cafe {
  id: string;
  name: string;
  coords: [number, number];
  amenities?: string[];
  coworkers: { name: string, intent: 'body-double' | 'focus' | 'social' }[];
  hasDouble?: boolean;
}

// Type definition for Cloudflare KV namespace
interface KVNamespace {
  get(key: string): Promise<string | null>;
  get(key: string, type: 'json'): Promise<any>;
  put(key: string, value: string): Promise<void>;
}

class KVStorage {
  private usersKV: KVNamespace | null;
  private cafesKV: KVNamespace | null;

  constructor() {
    // In production, these will be bound by Cloudflare
    this.usersKV = (globalThis as any).USERS_KV || null;
    this.cafesKV = (globalThis as any).CAFES_KV || null;
  }

  // User operations
  async getUsers(): Promise<User[]> {
    try {
      if (this.usersKV) {
        const users = await this.usersKV.get('users', 'json');
        return users || [];
      }
    } catch {
      // Fall through to localStorage
    }
    
    // Fallback to localStorage for development
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('users');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  async saveUsers(users: User[]): Promise<void> {
    try {
      if (this.usersKV) {
        await this.usersKV.put('users', JSON.stringify(users));
        return;
      }
    } catch {
      // Fall through to localStorage
    }
    
    // Fallback to localStorage for development
    if (typeof window !== 'undefined') {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  async createUser(user: User): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    await this.saveUsers(users);
  }

  // Cafe operations
  async getCafes(): Promise<Cafe[]> {
    try {
      if (this.cafesKV) {
        const cafes = await this.cafesKV.get('cafes', 'json');
        return cafes || [];
      }
    } catch {
      // Fall through to localStorage
    }
    
    // Fallback to localStorage for development
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cafes');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  async saveCafes(cafes: Cafe[]): Promise<void> {
    try {
      if (this.cafesKV) {
        await this.cafesKV.put('cafes', JSON.stringify(cafes));
        return;
      }
    } catch {
      // Fall through to localStorage
    }
    
    // Fallback to localStorage for development
    if (typeof window !== 'undefined') {
      localStorage.setItem('cafes', JSON.stringify(cafes));
    }
  }

  async addCafe(cafe: Cafe): Promise<void> {
    const cafes = await this.getCafes();
    cafes.push(cafe);
    await this.saveCafes(cafes);
  }

  async updateCafe(cafeId: string, updates: Partial<Cafe>): Promise<void> {
    const cafes = await this.getCafes();
    const index = cafes.findIndex(c => c.id === cafeId);
    if (index !== -1) {
      cafes[index] = { ...cafes[index], ...updates };
      await this.saveCafes(cafes);
    }
  }
}

export const kvStorage = new KVStorage();
