import { PrismaClient } from "@prisma/client";

const database = new PrismaClient();

async function main() {
  try {
    await database.categories.createMany({
      data: [
        { name: "Computer Science" },
        { name: "Music" },
        { name: "Fitness" },
        { name: "Photography" },
        { name: "Accounting" },
        { name: "Engineering" },
        { name: "Filming" },
      ]
    });
    console.log("Success seeding")
  } catch(error) {
    console.log("Error seeding database ", error);
  } finally {
    await database.$disconnect();
  }
};

main();