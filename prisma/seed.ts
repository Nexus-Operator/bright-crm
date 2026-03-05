import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bright-crm.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@bright-crm.com",
      hashedPassword: adminPassword,
      role: "admin",
      onboarded: true,
      industry: "general",
    },
  });

  // Create demo user
  const demoPassword = await hash("demo123", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@bright-crm.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@bright-crm.com",
      hashedPassword: demoPassword,
      role: "user",
      onboarded: true,
      industry: "general",
    },
  });

  // Create default pipeline
  const pipeline = await prisma.pipeline.upsert({
    where: { id: "default-pipeline" },
    update: {},
    create: {
      id: "default-pipeline",
      name: "Sales Pipeline",
      isDefault: true,
    },
  });

  // Create stages
  const stages = [
    { name: "Prospecting", order: 1, probability: 10, color: "#6B7280" },
    { name: "Qualification", order: 2, probability: 20, color: "#3B82F6" },
    { name: "Proposal", order: 3, probability: 50, color: "#8B5CF6" },
    { name: "Negotiation", order: 4, probability: 75, color: "#F59E0B" },
    { name: "Closed Won", order: 5, probability: 100, color: "#10B981" },
    { name: "Closed Lost", order: 6, probability: 0, color: "#EF4444" },
  ];

  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { id: `stage-${stage.order}` },
      update: {},
      create: {
        id: `stage-${stage.order}`,
        pipelineId: pipeline.id,
        ...stage,
      },
    });
  }

  // Create sample accounts
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        name: "Acme Corporation",
        industry: "Technology",
        type: "Customer",
        website: "https://acme.example.com",
        phone: "(555) 100-1000",
        city: "San Francisco",
        state: "CA",
        employees: 500,
        annualRevenue: 50000000,
        ownerId: admin.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "Globex Industries",
        industry: "Manufacturing",
        type: "Prospect",
        website: "https://globex.example.com",
        phone: "(555) 200-2000",
        city: "Chicago",
        state: "IL",
        employees: 1200,
        annualRevenue: 120000000,
        ownerId: admin.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "Initech Solutions",
        industry: "Software",
        type: "Customer",
        website: "https://initech.example.com",
        phone: "(555) 300-3000",
        city: "Austin",
        state: "TX",
        employees: 200,
        annualRevenue: 25000000,
        ownerId: demo.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "Stark Enterprises",
        industry: "Energy",
        type: "Prospect",
        phone: "(555) 400-4000",
        city: "New York",
        state: "NY",
        employees: 5000,
        annualRevenue: 500000000,
        ownerId: admin.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "Wayne Industries",
        industry: "Finance",
        type: "Partner",
        phone: "(555) 500-5000",
        city: "Gotham",
        state: "NJ",
        employees: 3000,
        annualRevenue: 300000000,
        ownerId: demo.id,
      },
    }),
  ]);

  // Create sample contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@acme.example.com",
        phone: "(555) 100-1001",
        title: "VP of Engineering",
        department: "Engineering",
        accountId: accounts[0].id,
        city: "San Francisco",
        state: "CA",
        ownerId: admin.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@globex.example.com",
        phone: "(555) 200-2001",
        title: "Director of Operations",
        department: "Operations",
        accountId: accounts[1].id,
        city: "Chicago",
        state: "IL",
        ownerId: admin.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@initech.example.com",
        phone: "(555) 300-3001",
        title: "CTO",
        department: "Technology",
        accountId: accounts[2].id,
        city: "Austin",
        state: "TX",
        ownerId: demo.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@stark.example.com",
        phone: "(555) 400-4001",
        title: "Head of Procurement",
        department: "Procurement",
        accountId: accounts[3].id,
        city: "New York",
        state: "NY",
        ownerId: admin.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Robert",
        lastName: "Wilson",
        email: "robert.wilson@wayne.example.com",
        phone: "(555) 500-5001",
        title: "CFO",
        department: "Finance",
        accountId: accounts[4].id,
        city: "Gotham",
        state: "NJ",
        ownerId: demo.id,
      },
    }),
  ]);

  // Create sample leads
  await Promise.all([
    prisma.lead.create({
      data: {
        firstName: "Alice",
        lastName: "Martinez",
        email: "alice.martinez@newco.example.com",
        phone: "(555) 600-6001",
        company: "NewCo Startup",
        title: "CEO",
        status: "New",
        source: "Web",
        rating: "Hot",
        city: "Miami",
        state: "FL",
        ownerId: admin.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "David",
        lastName: "Thompson",
        email: "david.thompson@bigcorp.example.com",
        phone: "(555) 700-7001",
        company: "BigCorp Inc",
        title: "VP Sales",
        status: "Contacted",
        source: "Referral",
        rating: "Warm",
        city: "Boston",
        state: "MA",
        ownerId: admin.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "Jessica",
        lastName: "Brown",
        email: "jessica.brown@startup.example.com",
        phone: "(555) 800-8001",
        company: "Startup Labs",
        title: "Head of Growth",
        status: "Qualified",
        source: "Partner",
        rating: "Hot",
        city: "Denver",
        state: "CO",
        ownerId: demo.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "Kevin",
        lastName: "Lee",
        email: "kevin.lee@techfirm.example.com",
        company: "TechFirm Solutions",
        title: "Product Manager",
        status: "New",
        source: "Web",
        rating: "Cold",
        city: "Seattle",
        state: "WA",
        ownerId: demo.id,
      },
    }),
  ]);

  // Create sample deals
  await Promise.all([
    prisma.deal.create({
      data: {
        name: "Acme Platform License",
        amount: 75000,
        closeDate: new Date("2026-04-15"),
        probability: 75,
        type: "New Business",
        source: "Direct",
        stageId: "stage-4",
        pipelineId: pipeline.id,
        accountId: accounts[0].id,
        contactId: contacts[0].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Globex Enterprise Deal",
        amount: 250000,
        closeDate: new Date("2026-05-30"),
        probability: 50,
        type: "New Business",
        source: "Referral",
        stageId: "stage-3",
        pipelineId: pipeline.id,
        accountId: accounts[1].id,
        contactId: contacts[1].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Initech Renewal",
        amount: 45000,
        closeDate: new Date("2026-03-31"),
        probability: 90,
        type: "Existing Business",
        stageId: "stage-4",
        pipelineId: pipeline.id,
        accountId: accounts[2].id,
        contactId: contacts[2].id,
        ownerId: demo.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Stark Energy Platform",
        amount: 500000,
        closeDate: new Date("2026-07-15"),
        probability: 20,
        type: "New Business",
        source: "Web",
        stageId: "stage-2",
        pipelineId: pipeline.id,
        accountId: accounts[3].id,
        contactId: contacts[3].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Wayne Analytics Suite",
        amount: 120000,
        closeDate: new Date("2026-06-01"),
        probability: 10,
        type: "New Business",
        stageId: "stage-1",
        pipelineId: pipeline.id,
        accountId: accounts[4].id,
        contactId: contacts[4].id,
        ownerId: demo.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Acme Support Contract",
        amount: 30000,
        closeDate: new Date("2026-02-28"),
        probability: 100,
        type: "Existing Business",
        stageId: "stage-5",
        pipelineId: pipeline.id,
        accountId: accounts[0].id,
        contactId: contacts[0].id,
        ownerId: admin.id,
      },
    }),
  ]);

  console.log("Seed data created successfully!");
  console.log("Admin login: admin@bright-crm.com / admin123");
  console.log("Demo login:  demo@bright-crm.com / demo123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
