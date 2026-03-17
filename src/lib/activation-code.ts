// 激活码系统

export interface ActivationCode {
  code: string;
  days: number; // 会员天数
  used: boolean;
  usedBy?: string;
  usedAt?: number;
  createdAt: number;
}

const CODES_STORAGE_KEY = "resume_activation_codes";

// 预设激活码（管理员可手动添加）
// 实际使用时应该存在后端，这里简化为本地存储
const PRESET_CODES: ActivationCode[] = [
  // 示例激活码，实际部署时删除或更换
  { code: "VIP2024TEST", days: 7, used: false, createdAt: Date.now() },
];

// 获取所有激活码
export function getAllCodes(): ActivationCode[] {
  if (typeof window === "undefined") return PRESET_CODES;

  const stored = localStorage.getItem(CODES_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // 首次使用，初始化预设激活码
  localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(PRESET_CODES));
  return PRESET_CODES;
}

// 保存激活码列表
function saveCodes(codes: ActivationCode[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));
}

// 验证激活码
export function validateCode(code: string): { valid: boolean; days?: number; message: string } {
  const codes = getAllCodes();
  const found = codes.find(c => c.code.toUpperCase() === code.toUpperCase());

  if (!found) {
    return { valid: false, message: "激活码无效" };
  }

  if (found.used) {
    return { valid: false, message: "激活码已被使用" };
  }

  return { valid: true, days: found.days, message: `激活码有效，可激活${found.days}天会员` };
}

// 使用激活码
export function useCode(code: string, userId: string): { success: boolean; days?: number; message: string } {
  const codes = getAllCodes();
  const found = codes.find(c => c.code.toUpperCase() === code.toUpperCase());

  if (!found) {
    return { success: false, message: "激活码无效" };
  }

  if (found.used) {
    return { success: false, message: "激活码已被使用" };
  }

  // 标记为已使用
  found.used = true;
  found.usedBy = userId;
  found.usedAt = Date.now();
  saveCodes(codes);

  return { success: true, days: found.days, message: `激活成功，获得${found.days}天会员` };
}

// 添加新激活码（管理员功能）
export function addCode(code: string, days: number): boolean {
  const codes = getAllCodes();

  // 检查是否已存在
  if (codes.some(c => c.code.toUpperCase() === code.toUpperCase())) {
    return false;
  }

  codes.push({
    code: code.toUpperCase(),
    days,
    used: false,
    createdAt: Date.now(),
  });

  saveCodes(codes);
  return true;
}

// 批量生成激活码
export function generateCodes(count: number, days: number): string[] {
  const codes = getAllCodes();
  const newCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    let code: string;
    do {
      code = generateRandomCode();
    } while (codes.some(c => c.code === code));

    codes.push({
      code,
      days,
      used: false,
      createdAt: Date.now(),
    });
    newCodes.push(code);
  }

  saveCodes(codes);
  return newCodes;
}

// 生成随机激活码
function generateRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 排除容易混淆的字符
  let code = "VIP";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 获取未使用的激活码列表（管理员查看）
export function getUnusedCodes(): ActivationCode[] {
  const codes = getAllCodes();
  return codes.filter(c => !c.used);
}