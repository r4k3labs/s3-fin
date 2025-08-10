import { eq } from "drizzle-orm";
import { db } from "../db";
import { members, users } from "../db/schema";

export async function getActiveOrganization(userId: string) {
  const result = await db
    .select({
      organizationId: members.organizationId,
    })
    .from(users)
    .leftJoin(members, eq(users.id, members.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}
