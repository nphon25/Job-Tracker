import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      name: "Demo User",
      role: "USER",
    },
    create: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
      role: "USER",
    },
  });

  // Create demo admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin User",
      role: "ADMIN",
    },
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create some sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: "Remote" },
      update: {},
      create: { name: "Remote", color: "#3B82F6" },
    }),
    prisma.tag.upsert({
      where: { name: "Full-time" },
      update: {},
      create: { name: "Full-time", color: "#10B981" },
    }),
    prisma.tag.upsert({
      where: { name: "Startup" },
      update: {},
      create: { name: "Startup", color: "#F59E0B" },
    }),
    prisma.tag.upsert({
      where: { name: "High Salary" },
      update: {},
      create: { name: "High Salary", color: "#EF4444" },
    }),
  ]);

  // Create sample jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: "Senior Frontend Developer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        description: "Building modern web applications with React and TypeScript",
        salary: "$120k - $150k",
        url: "https://techcorp.com/careers",
        stage: "APPLIED",
        priority: "HIGH",
        userId: demoUser.id,
        appliedAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.job.create({
      data: {
        title: "Full Stack Engineer",
        company: "Startup Inc",
        location: "Remote",
        description: "Join our fast-growing startup and build amazing products",
        salary: "$90k - $120k",
        url: "https://startupinc.com/jobs",
        stage: "INTERVIEW",
        priority: "MEDIUM",
        userId: demoUser.id,
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(),
      },
    }),
    prisma.job.create({
      data: {
        title: "DevOps Engineer",
        company: "Enterprise Solutions",
        location: "New York, NY",
        description: "Manage cloud infrastructure and deployment pipelines",
        salary: "$130k - $160k",
        url: "https://enterprise.com/careers",
        stage: "OFFER",
        priority: "URGENT",
        userId: demoUser.id,
        appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create sample notes
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        content: "Applied through LinkedIn. Company seems to have good work-life balance.",
        jobId: jobs[0].id,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.note.create({
      data: {
        content: "First interview scheduled for next week. Need to prepare for React questions.",
        jobId: jobs[1].id,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.note.create({
      data: {
        content: "Received offer! Great benefits package and growth opportunities.",
        jobId: jobs[2].id,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Associate tags with jobs
  await Promise.all([
    prisma.jobTag.create({
      data: {
        jobId: jobs[0].id,
        tagId: tags[0].id, // Remote
      },
    }),
    prisma.jobTag.create({
      data: {
        jobId: jobs[0].id,
        tagId: tags[1].id, // Full-time
      },
    }),
    prisma.jobTag.create({
      data: {
        jobId: jobs[1].id,
        tagId: tags[2].id, // Startup
      },
    }),
    prisma.jobTag.create({
      data: {
        jobId: jobs[2].id,
        tagId: tags[3].id, // High Salary
      },
    }),
  ]);

  console.log("Database seeded successfully!");
  console.log("Demo user:", demoUser.email, "(Password: demo123)");
  console.log("Admin user:", adminUser.email, "(Password: demo123)");
  console.log("Created", jobs.length, "jobs");
  console.log("Created", notes.length, "notes");
  console.log("Created", tags.length, "tags");
}

main()
  .catch((e) => {
    try {
      console.error("Seed failed:", e?.message ?? e);
      console.error("Error keys:", Object.getOwnPropertyNames(e));
      console.error("Full error:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    } catch (err) {
      console.error("Failed to serialize error:", err, e);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
