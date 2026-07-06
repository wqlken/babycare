import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) {
    throw new Error("密码至少需要 8 个字符。");
  }

  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
