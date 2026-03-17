// 会员系统 - 用户管理

export interface User {
  id: string;
  createdAt: number;
  // 会员状态
  isMember: boolean;
  memberExpiresAt: number | null;
  // 积分
  points: number;
  // 使用次数
  dailyOptimizeCount: number;
  dailyVersionCount: number;
  lastResetDate: string; // YYYY-MM-DD
  // 签到
  lastSignInDate: string | null;
  consecutiveSignInDays: number;
}

const STORAGE_KEY = "resume_user";

// 免费用户限制
export const FREE_LIMITS = {
  dailyOptimize: 5,
  dailyVersion: 1,
  historyCount: 10,
  templates: ["tech-simple", "fresh-graduate"],
};

// 会员限制
export const MEMBER_LIMITS = {
  dailyOptimize: Infinity,
  dailyVersion: Infinity,
  historyCount: 100,
  templates: "all", // 所有模板
};

// 获取今日日期字符串
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// 获取或创建用户
export function getUser(): User {
  if (typeof window === "undefined") {
    return createDefaultUser();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const user = JSON.parse(stored) as User;
    // 检查是否需要重置每日计数
    if (user.lastResetDate !== getTodayString()) {
      user.dailyOptimizeCount = 0;
      user.dailyVersionCount = 0;
      user.lastResetDate = getTodayString();
      saveUser(user);
    }
    // 检查会员是否过期
    if (user.isMember && user.memberExpiresAt && user.memberExpiresAt < Date.now()) {
      user.isMember = false;
      user.memberExpiresAt = null;
      saveUser(user);
    }
    return user;
  }

  const newUser = createDefaultUser();
  saveUser(newUser);
  return newUser;
}

function createDefaultUser(): User {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    isMember: false,
    memberExpiresAt: null,
    points: 0,
    dailyOptimizeCount: 0,
    dailyVersionCount: 0,
    lastResetDate: getTodayString(),
    lastSignInDate: null,
    consecutiveSignInDays: 0,
  };
}

export function saveUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

// 检查是否可以优化
export function canOptimize(user: User): { can: boolean; remaining: number; reason?: string } {
  if (user.isMember) {
    return { can: true, remaining: Infinity };
  }
  const remaining = FREE_LIMITS.dailyOptimize - user.dailyOptimizeCount;
  if (remaining <= 0) {
    return { can: false, remaining: 0, reason: "今日优化次数已用完，明天再来或开通会员" };
  }
  return { can: true, remaining };
}

// 检查是否可以生成多版本
export function canGenerateVersions(user: User): { can: boolean; reason?: string } {
  if (user.isMember) {
    return { can: true };
  }
  if (user.dailyVersionCount >= FREE_LIMITS.dailyVersion) {
    return { can: false, reason: "今日多版本生成次数已用完，明天再来或开通会员" };
  }
  return { can: true };
}

// 记录优化使用
export function recordOptimize(user: User): User {
  user.dailyOptimizeCount++;
  saveUser(user);
  return user;
}

// 记录多版本生成
export function recordVersionGenerate(user: User): User {
  user.dailyVersionCount++;
  saveUser(user);
  return user;
}

// 检查是否可以签到
export function canSignIn(user: User): boolean {
  return user.lastSignInDate !== getTodayString();
}

// 签到
export function doSignIn(user: User): { success: boolean; pointsEarned: number; message: string } {
  if (!canSignIn(user)) {
    return { success: false, pointsEarned: 0, message: "今日已签到" };
  }

  const today = getTodayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let pointsEarned = 10;
  let message = "签到成功，获得10积分";

  // 连续签到奖励
  if (user.lastSignInDate === yesterday) {
    user.consecutiveSignInDays++;
    if (user.consecutiveSignInDays >= 7) {
      pointsEarned = 50;
      message = "连续签到7天，获得50积分！";
      user.consecutiveSignInDays = 0; // 重置
    } else if (user.consecutiveSignInDays >= 3) {
      pointsEarned = 20;
      message = `连续签到${user.consecutiveSignInDays}天，获得20积分！`;
    }
  } else {
    user.consecutiveSignInDays = 1;
  }

  user.lastSignInDate = today;
  user.points += pointsEarned;
  saveUser(user);

  return { success: true, pointsEarned, message };
}

// 积分兑换会员
export function exchangePointsForMember(user: User, days: number): { success: boolean; message: string } {
  const requiredPoints = days * 100; // 100积分 = 1天

  if (user.points < requiredPoints) {
    return { success: false, message: `积分不足，需要${requiredPoints}积分` };
  }

  user.points -= requiredPoints;
  const expiresAt = user.isMember && user.memberExpiresAt
    ? user.memberExpiresAt + days * 86400000
    : Date.now() + days * 86400000;
  user.isMember = true;
  user.memberExpiresAt = expiresAt;
  saveUser(user);

  return { success: true, message: `成功兑换${days}天会员` };
}

// 激活会员
export function activateMembership(user: User, days: number): User {
  const expiresAt = user.isMember && user.memberExpiresAt
    ? user.memberExpiresAt + days * 86400000
    : Date.now() + days * 86400000;
  user.isMember = true;
  user.memberExpiresAt = expiresAt;
  saveUser(user);
  return user;
}

// 格式化会员到期时间
export function formatMemberExpiry(expiresAt: number | null): string {
  if (!expiresAt) return "";
  const date = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiresAt - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays <= 0) return "已过期";
  if (diffDays === 1) return "明天到期";
  if (diffDays <= 7) return `${diffDays}天后到期`;

  return `${date.getMonth() + 1}月${date.getDate()}日到期`;
}