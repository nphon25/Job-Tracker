import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [email, newPassword] = process.argv.slice(2);
  if (!email || !newPassword) {
    console.error("Usage: npx tsx scripts/change-password.ts <email> <newPassword>");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });
    console.log("Updated password for", user.email);
  } catch (e) {
    console.error("Failed to update password:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
