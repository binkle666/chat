// 硬编码的用户数据
export const USERS = [
  { id: 1, username: 'user1', password: 'password1', displayName: '用户一' },
  { id: 2, username: 'user2', password: 'password2', displayName: '用户二' },
  { id: 3, username: 'admin', password: 'admin123', displayName: '管理员' },
  { id: 4, username: 'guest', password: 'guest123', displayName: '访客' },
];

export interface User {
  id: number;
  username: string;
  displayName: string;
}

export function validateUser(username: string, password: string): User | null {
  const user = USERS.find(
    (u) => u.username === username && u.password === password,
  );
  if (user) {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    };
  }
  return null;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function setCurrentUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
  }
}
