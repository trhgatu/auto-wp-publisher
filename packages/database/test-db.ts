import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const logs = await prisma.apiLog.findMany({
      where: { statusCode: { in: [200, 201] } },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    console.log("Found successful logs:", logs.length);
    for (const log of logs) {
      console.log(`Endpoint: ${log.method} ${log.endpoint}`);
      if (log.responseBody) {
        try {
          const body = JSON.parse(log.responseBody);
          console.log("Keys in response body:", Object.keys(body));
          if (body.brands) {
            console.log("Found brands field:", body.brands);
          }
          // Print potential taxonomy fields:
          const customFields = Object.keys(body).filter(
            (k) => k.includes("brand") || k.includes("tax"),
          );
          console.log("Custom brand/tax fields:", customFields);
          if (customFields.length > 0) {
            customFields.forEach((cf) => console.log(`${cf}:`, body[cf]));
          }
        } catch (e) {
          console.log("Could not parse response body as JSON");
        }
      }
    }
  } catch (e) {
    console.error("Query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
