import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.note.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create Kati's admin account
  const katiPassword = await hash("demo123", 12);
  const kati = await prisma.user.create({
    data: {
      name: "Kati",
      email: "kati@bright-crm.com",
      hashedPassword: katiPassword,
      role: "admin",
      onboarded: true,
      industry: "hrt_supplements",
    },
  });

  // Create assistant user
  const assistantPassword = await hash("demo123", 12);
  const assistant = await prisma.user.create({
    data: {
      name: "Sarah (Patient Coordinator)",
      email: "sarah@bright-crm.com",
      hashedPassword: assistantPassword,
      role: "user",
      onboarded: true,
      industry: "hrt_supplements",
    },
  });

  // Create HRT Patient Pipeline
  const pipeline = await prisma.pipeline.create({
    data: {
      name: "Patient Pipeline",
      isDefault: true,
    },
  });

  const stageData = [
    { name: "Outreach", order: 1, probability: 10, color: "#6366F1" },
    { name: "Lab Work Follow-up", order: 2, probability: 25, color: "#8B5CF6" },
    { name: "Labs In", order: 3, probability: 40, color: "#3B82F6" },
    { name: "Consultation Scheduled", order: 4, probability: 60, color: "#0EA5E9" },
    { name: "Consultation Complete", order: 5, probability: 80, color: "#F59E0B" },
    { name: "New Patient", order: 6, probability: 100, color: "#10B981" },
    { name: "Lost", order: 7, probability: 0, color: "#EF4444" },
  ];

  const stages: Record<string, string> = {};
  for (const s of stageData) {
    const stage = await prisma.stage.create({
      data: { ...s, pipelineId: pipeline.id },
    });
    stages[s.name] = stage.id;
  }

  // Create accounts (Clinics / Supplement Suppliers / Referral Sources)
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        name: "Vitality Wellness Clinic",
        industry: "Healthcare - HRT",
        type: "Customer",
        website: "https://vitalitywellness.example.com",
        phone: "(561) 555-0101",
        city: "Boca Raton",
        state: "FL",
        description: "Primary HRT treatment facility. Full lab services on-site.",
        employees: 15,
        ownerId: kati.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "BioBalance Labs",
        industry: "Lab Services",
        type: "Partner",
        phone: "(561) 555-0202",
        city: "Fort Lauderdale",
        state: "FL",
        description: "Preferred lab partner for hormone panels and bloodwork.",
        employees: 30,
        ownerId: kati.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "PureForm Supplements",
        industry: "Supplements",
        type: "Vendor",
        website: "https://pureform.example.com",
        phone: "(800) 555-0303",
        city: "Tampa",
        state: "FL",
        description: "Pharmaceutical-grade supplement supplier. DHEA, Pregnenolone, Vitamin D3.",
        employees: 50,
        ownerId: kati.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "Palm Beach Integrative Medicine",
        industry: "Healthcare - Integrative",
        type: "Partner",
        phone: "(561) 555-0404",
        city: "West Palm Beach",
        state: "FL",
        description: "Referral partner. Sends patients needing hormone optimization.",
        employees: 8,
        ownerId: kati.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "Optimal Health Direct",
        industry: "Telehealth - HRT",
        type: "Customer",
        website: "https://optimalhealthdirect.example.com",
        phone: "(305) 555-0505",
        city: "Miami",
        state: "FL",
        description: "Telehealth HRT provider. Remote consultations and prescription management.",
        employees: 10,
        ownerId: assistant.id,
      },
    }),
  ]);

  // Create contacts (Patients)
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: "Marcus",
        lastName: "Rivera",
        email: "marcus.rivera@example.com",
        phone: "(561) 555-1001",
        title: "Patient",
        department: "TRT Program",
        accountId: accounts[0].id,
        city: "Boca Raton",
        state: "FL",
        description: "Male, 45. Low T symptoms: fatigue, low libido, brain fog. Referred by Dr. Patel.",
        ownerId: kati.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Jennifer",
        lastName: "Walsh",
        email: "jennifer.walsh@example.com",
        phone: "(561) 555-1002",
        title: "Patient",
        department: "Female HRT",
        accountId: accounts[0].id,
        city: "Delray Beach",
        state: "FL",
        description: "Female, 52. Perimenopause symptoms: hot flashes, mood swings, insomnia. Interested in bioidentical hormones.",
        ownerId: kati.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "David",
        lastName: "Okonkwo",
        email: "david.okonkwo@example.com",
        phone: "(954) 555-1003",
        title: "Patient",
        department: "TRT Program",
        accountId: accounts[0].id,
        city: "Fort Lauderdale",
        state: "FL",
        description: "Male, 38. Fitness enthusiast. Experiencing recovery issues and low energy. Labs show suboptimal T levels.",
        ownerId: kati.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Lisa",
        lastName: "Thompson",
        email: "lisa.thompson@example.com",
        phone: "(561) 555-1004",
        title: "Patient",
        department: "Thyroid Optimization",
        accountId: accounts[3].id,
        city: "West Palm Beach",
        state: "FL",
        description: "Female, 41. Referred from Palm Beach Integrative. Thyroid and adrenal fatigue concerns.",
        ownerId: assistant.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Robert",
        lastName: "Chen",
        email: "robert.chen@example.com",
        phone: "(305) 555-1005",
        title: "Patient",
        department: "TRT Program",
        accountId: accounts[4].id,
        city: "Miami",
        state: "FL",
        description: "Male, 55. Executive. Telehealth patient. Wants comprehensive hormone panel and optimization plan.",
        ownerId: assistant.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Amanda",
        lastName: "Foster",
        email: "amanda.foster@example.com",
        phone: "(561) 555-1006",
        title: "Patient",
        department: "Female HRT",
        accountId: accounts[0].id,
        city: "Boca Raton",
        state: "FL",
        description: "Female, 48. Post-hysterectomy. Needs full hormone replacement. Currently on suboptimal treatment from PCP.",
        ownerId: kati.id,
      },
    }),
  ]);

  // Create leads (Potential patients from outreach)
  await Promise.all([
    prisma.lead.create({
      data: {
        firstName: "Tony",
        lastName: "Morales",
        email: "tony.morales@example.com",
        phone: "(561) 555-2001",
        company: "Self",
        title: "Prospective Patient",
        status: "New",
        source: "Web",
        rating: "Hot",
        city: "Coconut Creek",
        state: "FL",
        description: "Filled out website form. Male, 42. Interested in TRT. Reports fatigue and weight gain.",
        ownerId: kati.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "Rachel",
        lastName: "Kim",
        email: "rachel.kim@example.com",
        phone: "(954) 555-2002",
        company: "Self",
        title: "Prospective Patient",
        status: "Contacted",
        source: "Referral",
        rating: "Hot",
        city: "Pompano Beach",
        state: "FL",
        description: "Referred by Jennifer Walsh. Female, 49. Perimenopause. Wants bioidentical hormone consultation.",
        ownerId: kati.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "Greg",
        lastName: "Patterson",
        email: "greg.patterson@example.com",
        phone: "(561) 555-2003",
        company: "Self",
        title: "Prospective Patient",
        status: "New",
        source: "Phone",
        rating: "Warm",
        city: "Boynton Beach",
        state: "FL",
        description: "Called office. Male, 50. Doctor told him his testosterone was low but didn't offer treatment. Wants options.",
        ownerId: assistant.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "Michelle",
        lastName: "Adams",
        email: "michelle.adams@example.com",
        phone: "(561) 555-2004",
        company: "Self",
        title: "Prospective Patient",
        status: "Contacted",
        source: "Web",
        rating: "Warm",
        city: "Lake Worth",
        state: "FL",
        description: "Downloaded hormone guide from website. Female, 55. Post-menopausal. Currently on synthetic HRT, wants to switch to bioidentical.",
        ownerId: kati.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "James",
        lastName: "Hoffman",
        email: "james.hoffman@example.com",
        phone: "(954) 555-2005",
        company: "Self",
        title: "Prospective Patient",
        status: "New",
        source: "Partner",
        rating: "Hot",
        city: "Coral Springs",
        state: "FL",
        description: "Referred by Palm Beach Integrative Medicine. Male, 47. Low T confirmed by outside labs. Ready to start treatment.",
        ownerId: kati.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "Diane",
        lastName: "Russo",
        email: "diane.russo@example.com",
        company: "Self",
        title: "Prospective Patient",
        status: "New",
        source: "Web",
        rating: "Cold",
        city: "Jupiter",
        state: "FL",
        description: "Signed up for newsletter. No direct inquiry yet. Female, unknown age.",
        ownerId: assistant.id,
      },
    }),
  ]);

  // Create deals (Patient cases at various pipeline stages)
  const deals = await Promise.all([
    // Outreach stage
    prisma.deal.create({
      data: {
        name: "Tony Morales - TRT Evaluation",
        amount: 350,
        closeDate: new Date("2026-04-01"),
        probability: 10,
        type: "New Business",
        source: "Web",
        description: "Initial outreach. Sent lab order request and welcome packet.",
        stageId: stages["Outreach"],
        pipelineId: pipeline.id,
        accountId: accounts[0].id,
        ownerId: kati.id,
      },
    }),
    // Lab Work Follow-up
    prisma.deal.create({
      data: {
        name: "Rachel Kim - Female HRT Consult",
        amount: 450,
        closeDate: new Date("2026-03-25"),
        probability: 25,
        type: "New Business",
        source: "Referral",
        description: "Lab order sent. Waiting for patient to complete bloodwork at BioBalance Labs. Follow up in 5 days.",
        stageId: stages["Lab Work Follow-up"],
        pipelineId: pipeline.id,
        accountId: accounts[0].id,
        contactId: contacts[1].id,
        ownerId: kati.id,
      },
    }),
    // Labs In
    prisma.deal.create({
      data: {
        name: "David Okonkwo - TRT Protocol",
        amount: 300,
        closeDate: new Date("2026-03-20"),
        probability: 40,
        type: "New Business",
        source: "Web",
        description: "Labs received. Total T: 285 ng/dL (low). Free T: 5.2 pg/mL (low). SHBG elevated. E2 normal. Ready for consultation.",
        stageId: stages["Labs In"],
        pipelineId: pipeline.id,
        accountId: accounts[0].id,
        contactId: contacts[2].id,
        ownerId: kati.id,
      },
    }),
    // Consultation Scheduled
    prisma.deal.create({
      data: {
        name: "Lisa Thompson - Thyroid Optimization",
        amount: 400,
        closeDate: new Date("2026-03-18"),
        probability: 60,
        type: "New Business",
        source: "Referral",
        description: "Consultation booked for March 12. Labs show subclinical hypothyroid + low cortisol morning. Comprehensive treatment plan to discuss.",
        stageId: stages["Consultation Scheduled"],
        pipelineId: pipeline.id,
        accountId: accounts[3].id,
        contactId: contacts[3].id,
        ownerId: assistant.id,
      },
    }),
    // Consultation Complete
    prisma.deal.create({
      data: {
        name: "Amanda Foster - HRT Switch",
        amount: 500,
        closeDate: new Date("2026-03-15"),
        probability: 80,
        type: "New Business",
        source: "Web",
        description: "Consultation completed. Patient wants to switch from Premarin to bioidentical estradiol + progesterone. Rx being prepared. Follow-up labs in 6 weeks.",
        stageId: stages["Consultation Complete"],
        pipelineId: pipeline.id,
        accountId: accounts[0].id,
        contactId: contacts[5].id,
        ownerId: kati.id,
      },
    }),
    // New Patient (Won)
    prisma.deal.create({
      data: {
        name: "Marcus Rivera - TRT Program",
        amount: 350,
        closeDate: new Date("2026-02-28"),
        probability: 100,
        type: "New Business",
        source: "Referral",
        description: "Active patient. On weekly testosterone cypionate 200mg + anastrozole. First follow-up labs due in 8 weeks. Supplement stack: Vitamin D3, Zinc, Magnesium.",
        stageId: stages["New Patient"],
        pipelineId: pipeline.id,
        accountId: accounts[0].id,
        contactId: contacts[0].id,
        ownerId: kati.id,
      },
    }),
    // Another New Patient
    prisma.deal.create({
      data: {
        name: "Robert Chen - Executive TRT (Telehealth)",
        amount: 550,
        closeDate: new Date("2026-02-15"),
        probability: 100,
        type: "New Business",
        source: "Web",
        description: "Premium telehealth patient. On comprehensive protocol: TRT + DHEA + thyroid support + supplement stack. Monthly check-ins scheduled.",
        stageId: stages["New Patient"],
        pipelineId: pipeline.id,
        accountId: accounts[4].id,
        contactId: contacts[4].id,
        ownerId: assistant.id,
      },
    }),
    // Lost
    prisma.deal.create({
      data: {
        name: "Greg Patterson - TRT Evaluation",
        amount: 350,
        closeDate: new Date("2026-03-01"),
        probability: 0,
        type: "New Business",
        source: "Phone",
        description: "Patient decided to try natural remedies first. Left door open for future. Set 90-day follow-up reminder.",
        stageId: stages["Lost"],
        pipelineId: pipeline.id,
        accountId: accounts[0].id,
        ownerId: assistant.id,
      },
    }),
  ]);

  // Create activities
  await Promise.all([
    prisma.activity.create({
      data: {
        type: "call",
        subject: "Initial outreach call - Tony Morales",
        description: "Left voicemail. Will follow up via email with lab order.",
        status: "Completed",
        priority: "High",
        dealId: deals[0].id,
        ownerId: kati.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "email",
        subject: "Lab order sent - Rachel Kim",
        description: "Sent BioBalance lab requisition for comprehensive female hormone panel.",
        status: "Completed",
        priority: "Medium",
        dealId: deals[1].id,
        contactId: contacts[1].id,
        ownerId: kati.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        subject: "Follow up on lab results - Rachel Kim",
        description: "Check if patient has completed bloodwork. Call if no results in 3 days.",
        status: "Open",
        dueDate: new Date("2026-03-10"),
        priority: "High",
        dealId: deals[1].id,
        ownerId: kati.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        subject: "Review labs and prepare consultation notes - David Okonkwo",
        description: "Total T: 285, Free T: 5.2, SHBG: 58. Prepare treatment protocol recommendation.",
        status: "Open",
        dueDate: new Date("2026-03-08"),
        priority: "High",
        dealId: deals[2].id,
        contactId: contacts[2].id,
        ownerId: kati.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "meeting",
        subject: "Consultation - Lisa Thompson",
        description: "Virtual consultation. Discuss thyroid labs and treatment plan. Patient prefers natural thyroid (Armour) if possible.",
        status: "Open",
        dueDate: new Date("2026-03-12"),
        priority: "High",
        dealId: deals[3].id,
        contactId: contacts[3].id,
        ownerId: assistant.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        subject: "Send Rx to pharmacy - Amanda Foster",
        description: "Bioidentical estradiol cream 0.5mg + micronized progesterone 200mg. Compound pharmacy: PureForm.",
        status: "Open",
        dueDate: new Date("2026-03-07"),
        priority: "High",
        dealId: deals[4].id,
        contactId: contacts[5].id,
        ownerId: kati.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        subject: "8-week follow-up labs - Marcus Rivera",
        description: "Order follow-up panel: Total T, Free T, E2, CBC, CMP, PSA. Check treatment efficacy.",
        status: "Open",
        dueDate: new Date("2026-04-25"),
        priority: "Medium",
        dealId: deals[5].id,
        contactId: contacts[0].id,
        ownerId: kati.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "call",
        subject: "Monthly check-in - Robert Chen",
        description: "Telehealth monthly review. Patient reports improved energy and sleep. Review supplement compliance.",
        status: "Open",
        dueDate: new Date("2026-03-15"),
        priority: "Medium",
        dealId: deals[6].id,
        contactId: contacts[4].id,
        ownerId: assistant.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        subject: "90-day follow-up - Greg Patterson",
        description: "Patient chose natural remedies. Check back in to see if symptoms improved or if they want to reconsider TRT.",
        status: "Open",
        dueDate: new Date("2026-05-30"),
        priority: "Low",
        dealId: deals[7].id,
        ownerId: assistant.id,
      },
    }),
  ]);

  // Create notes
  await Promise.all([
    prisma.note.create({
      data: {
        body: "Patient very motivated. Has done research on TRT. Wants to feel like himself again. Good candidate - will likely convert quickly once labs confirm.",
        dealId: deals[0].id,
        ownerId: kati.id,
      },
    }),
    prisma.note.create({
      data: {
        body: "Lab results summary:\n- Total Testosterone: 285 ng/dL (ref: 300-1000)\n- Free Testosterone: 5.2 pg/mL (ref: 8.7-25.1)\n- SHBG: 58 nmol/L (elevated)\n- Estradiol: 22 pg/mL (normal)\n- PSA: 0.8 (normal)\n- CBC: All normal\n\nRecommendation: TRT with anastrozole for SHBG management.",
        dealId: deals[2].id,
        contactId: contacts[2].id,
        ownerId: kati.id,
      },
    }),
    prisma.note.create({
      data: {
        body: "Treatment protocol started:\n- Testosterone Cypionate 200mg/week (split into 2x 100mg injections)\n- Anastrozole 0.5mg 2x/week\n- Vitamin D3 5000 IU daily\n- Zinc 30mg daily\n- Magnesium Glycinate 400mg nightly\n\nPatient educated on self-injection technique. Comfortable with IM injection.",
        dealId: deals[5].id,
        contactId: contacts[0].id,
        ownerId: kati.id,
      },
    }),
    prisma.note.create({
      data: {
        body: "Switching from Premarin (conjugated estrogen) to bioidentical. Patient reports breast tenderness and bloating on current medication. Discussed benefits of bioidentical estradiol + micronized progesterone. Patient very relieved to have options.",
        dealId: deals[4].id,
        contactId: contacts[5].id,
        ownerId: kati.id,
      },
    }),
  ]);

  console.log("\nHRT & Supplements Demo Data Seeded Successfully!");
  console.log("================================================");
  console.log("Login as Kati:   kati@bright-crm.com / demo123");
  console.log("Login as Sarah:  sarah@bright-crm.com / demo123");
  console.log("");
  console.log("Pipeline: Patient Pipeline");
  console.log("Stages: Outreach → Lab Work Follow-up → Labs In → Consultation Scheduled → Consultation Complete → New Patient → Lost");
  console.log("");
  console.log("Sample data includes:");
  console.log("  - 5 accounts (clinics, labs, suppliers, referral partners)");
  console.log("  - 6 patient contacts with treatment details");
  console.log("  - 6 leads (prospective patients)");
  console.log("  - 8 deals across all pipeline stages");
  console.log("  - 9 activities (tasks, calls, emails, meetings)");
  console.log("  - 4 clinical notes with lab results and protocols");
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
