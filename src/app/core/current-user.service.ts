import { computed, Injectable, signal } from '@angular/core';

export interface SelectedUser {
  _id: string;
  name: string;
}

const STORAGE_KEY = 'dreamsaver.currentUser';

function isSelectedUser(value: unknown): value is SelectedUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    typeof value._id === 'string' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}


@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly selected = signal<SelectedUser | null>(this.read());

  readonly user = this.selected.asReadonly();
  readonly userId = computed(() => this.selected()?._id ?? null);

  select(user: SelectedUser): void {
    const value: SelectedUser = { _id: user._id, name: user.name };
    this.selected.set(value);
    this.write(value);
  }

  clear(): void {
    this.selected.set(null);
    this.write(null);
  }

  private read(): SelectedUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return isSelectedUser(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private write(value: SelectedUser | null): void {
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
     
    }
  }
}
