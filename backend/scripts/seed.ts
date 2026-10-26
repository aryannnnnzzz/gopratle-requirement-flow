import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  PlannerRequirement,
  PerformerRequirement,
  CrewRequirement,
} from "../src/models/Requirement";

dotenv.config();

const runSeed = async () => {
  // Safety gate: Require explicit --confirm flag
  if (!process.argv.includes("--confirm")) {
    console.error("\n=======================================================");
    console.error(" [SAFETY CHECK] Database seed was aborted.");
    console.error(" To seed the database with realistic sample requirements,");
    console.error(" you must pass the explicit --confirm flag:");
    console.error("   npm run seed -- --confirm");
    console.error("=======================================================\n");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("[FATAL] MONGODB_URI is not set in environment or .env file.");
    process.exit(1);
  }

  console.log(`[Seed] Connecting to MongoDB: ${uri.replace(/\/\/.*@/, "//@***:***@")} ...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("[Seed] Connected successfully. Inserting 6 sample requirements (2 per category)...");

    // 1. Planner 1: Destination Wedding
    const planner1 = await PlannerRequirement.create({
      eventName: "Royal Heritage Sangeet & Reception",
      eventType: "Wedding",
      dateType: "range",
      startDate: new Date("2027-11-18"),
      endDate: new Date("2027-11-20"),
      location: "Jaipur, Rajasthan",
      venue: "Rambagh Palace Grounds",
      category: "planner",
      details: {
        services: ["decor", "catering", "AV", "photography", "logistics"],
        guestCount: 450,
        theme: "Traditional Rajasthani Royal Heritage",
        budgetMin: 800000,
        budgetMax: 1500000,
        planningDeadline: new Date("2027-10-15"),
        notes: "Requires coordination with palace heritage team for multi-day live catering and fireworks permit.",
      },
    });

    // 2. Planner 2: Corporate Conference
    const planner2 = await PlannerRequirement.create({
      eventName: "FinTech Horizons India Expo 2027",
      eventType: "Corporate",
      dateType: "single",
      startDate: new Date("2027-09-24"),
      location: "Bengaluru, Karnataka",
      venue: "BIEC Hall 3",
      category: "planner",
      details: {
        services: ["AV", "logistics", "other"],
        guestCount: 1200,
        theme: "Futuristic Modern Minimalist",
        budgetMin: 1200000,
        budgetMax: 2500000,
        planningDeadline: new Date("2027-08-30"),
        notes: "Hybrid conference setup with live dual-language interpretation, VIP lounge, and delegate badging.",
      },
    });

    // 3. Performer 1: Live Fusion Band
    const performer1 = await PerformerRequirement.create({
      eventName: "Bollywood Sufi Fusion Night",
      eventType: "Concert",
      dateType: "single",
      startDate: new Date("2027-12-15"),
      location: "Mumbai, Maharashtra",
      venue: "Jio World Garden",
      category: "performer",
      details: {
        performerType: "Band",
        genre: "Bollywood Sufi Rock",
        performanceDurationMins: 120,
        numberOfPerformers: 5,
        equipmentProvidedByHost: true,
        technicalRequirements: "5 in-ear monitor transmitters, drum shield, and direct DI inputs for sitar and keys.",
        budgetPerPerformance: 175000,
        travelAccommodationCovered: true,
      },
    });

    // 4. Performer 2: Electronic / Club DJ
    const performer2 = await PerformerRequirement.create({
      eventName: "Sunsets & Waves EDM Showcase",
      eventType: "Festival",
      dateType: "range",
      startDate: new Date("2027-12-28"),
      endDate: new Date("2027-12-30"),
      location: "Goa",
      venue: "Vagator Beach Arena",
      category: "performer",
      details: {
        performerType: "DJ",
        genre: "Deep Progressive House & Techno",
        performanceDurationMins: 180,
        numberOfPerformers: 1,
        equipmentProvidedByHost: true,
        technicalRequirements: "Pioneer CDJ-3000 (x3) and DJM-V10 mixer with booth monitor.",
        budgetPerPerformance: 65000,
        travelAccommodationCovered: true,
      },
    });

    // 5. Crew 1: Concert Audio & Stage
    const crew1 = await CrewRequirement.create({
      eventName: "Metropolis Rock Carnival 2028",
      eventType: "Concert",
      dateType: "single",
      startDate: new Date("2028-01-20"),
      location: "New Delhi",
      venue: "Jawaharlal Nehru Stadium",
      category: "crew",
      details: {
        roles: [
          { role: "Sound", count: 4 },
          { role: "Stage", count: 6 },
          { role: "Lighting", count: 4 },
        ],
        shiftHours: 12,
        experienceLevel: "Expert",
        dailyRate: 3500,
        callTime: "07:30",
        requiredCertifications: ["Dante Audio Level 2", "Rigging Safety Certified"],
      },
    });

    // 6. Crew 2: Film Festival Video & Photo
    const crew2 = await CrewRequirement.create({
      eventName: "Indie Cinema & Documentary Conclave",
      eventType: "Festival",
      dateType: "single",
      startDate: new Date("2028-02-14"),
      location: "Pune, Maharashtra",
      venue: "FTII Main Auditorium",
      category: "crew",
      details: {
        roles: [
          { role: "Videography", count: 3 },
          { role: "Photography", count: 2 },
          { role: "Security", count: 4 },
        ],
        shiftHours: 8,
        experienceLevel: "Intermediate",
        dailyRate: 2800,
        callTime: "08:30",
        requiredCertifications: ["First Aid & CPR Certified"],
      },
    });

    console.log("\n[Seed] Successfully seeded 6 requirements:");
    console.log(`  1. [Planner] ${planner1.eventName} (ID: ${planner1._id})`);
    console.log(`  2. [Planner] ${planner2.eventName} (ID: ${planner2._id})`);
    console.log(`  3. [Performer] ${performer1.eventName} (ID: ${performer1._id})`);
    console.log(`  4. [Performer] ${performer2.eventName} (ID: ${performer2._id})`);
    console.log(`  5. [Crew] ${crew1.eventName} (ID: ${crew1._id})`);
    console.log(`  6. [Crew] ${crew2.eventName} (ID: ${crew2._id})`);

    await mongoose.disconnect();
    console.log("\n[Seed] Disconnected from MongoDB. Seed complete.\n");
    process.exit(0);
  } catch (err) {
    console.error("[Seed Error]", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runSeed();
