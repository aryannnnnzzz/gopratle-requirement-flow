import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import { Requirement } from "../models/Requirement";

let mongod: MongoMemoryServer;

// Ensure process.env.MONGODB_URI is wiped so tests NEVER touch Atlas or remote databases
delete process.env.MONGODB_URI;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

describe("Requirement Posting API - End-to-End Test Suite", () => {
  // 1. Health check
  describe("GET /health", () => {
    it("returns 200 with status ok and db connected state", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "ok",
        db: "connected",
      });
    });
  });

  // 2. Valid Submissions per Category
  describe("POST /api/requirements - Valid Submissions", () => {
    it("creates a valid Planner requirement", async () => {
      const payload = {
        eventName: "Annual Gala 2027",
        eventType: "Corporate",
        dateType: "range",
        startDate: "2027-04-10",
        endDate: "2027-04-12",
        location: "Mumbai, Maharashtra",
        venue: "Taj Lands End",
        category: "planner",
        details: {
          services: ["decor", "catering", "AV"],
          guestCount: 500,
          theme: "Royal Elegance",
          budgetMin: 1500000,
          budgetMax: 2500000,
          planningDeadline: "2027-03-01",
          notes: "Need premium AV setup",
        },
      };

      const res = await request(app).post("/api/requirements").send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.category).toBe("planner");
      expect(res.body.data.details.guestCount).toBe(500);
    });

    it("creates a valid Performer requirement", async () => {
      const payload = {
        eventName: "College Fest Rock Night",
        eventType: "Concert",
        dateType: "single",
        startDate: "2027-05-15",
        location: "Pune, Maharashtra",
        category: "performer",
        details: {
          performerType: "Band",
          genre: "Rock / Fusion",
          performanceDurationMins: 90,
          numberOfPerformers: 4,
          equipmentProvidedByHost: true,
          budgetPerPerformance: 75000,
          travelAccommodationCovered: true,
        },
      };

      const res = await request(app).post("/api/requirements").send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.category).toBe("performer");
      expect(res.body.data.details.genre).toBe("Rock / Fusion");
    });

    it("creates a valid Crew requirement", async () => {
      const payload = {
        eventName: "City Marathon Expo",
        eventType: "Festival",
        dateType: "single",
        startDate: "2027-06-01",
        location: "Delhi NCR",
        category: "crew",
        details: {
          roles: [
            { role: "Stage", count: 2 },
            { role: "Security", count: 8 },
          ],
          shiftHours: 10,
          experienceLevel: "Intermediate",
          dailyRate: 3500,
          callTime: "06:30",
          requiredCertifications: ["First Aid"],
        },
      };

      const res = await request(app).post("/api/requirements").send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.category).toBe("crew");
      expect(res.body.data.details.roles).toHaveLength(2);
    });
  });

  // 3. Validation & Business Rule Enforcement
  describe("POST /api/requirements - Validation & Error Handling", () => {
    it("rejects payload missing required base fields (eventName, location)", async () => {
      const res = await request(app).post("/api/requirements").send({
        eventType: "Corporate",
        dateType: "single",
        startDate: "2027-04-10",
        category: "planner",
        details: {
          services: ["decor"],
          guestCount: 50,
          budgetMin: 10000,
          budgetMax: 20000,
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      const paths = res.body.errors.map((e: { path: string }) => e.path);
      expect(paths).toContain("eventName");
      expect(paths).toContain("location");
    });

    it("rejects payload missing category details required field", async () => {
      const res = await request(app).post("/api/requirements").send({
        eventName: "Private Party",
        eventType: "Birthday",
        dateType: "single",
        startDate: "2027-04-10",
        location: "Goa",
        category: "performer",
        details: {
          performerType: "DJ",
          genre: "House",
          // missing performanceDurationMins, numberOfPerformers, equipmentProvidedByHost, budgetPerPerformance, travelAccommodationCovered
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it("rejects wrong details shape for category (mismatched category & details)", async () => {
      const res = await request(app).post("/api/requirements").send({
        eventName: "Mismatched Test",
        eventType: "Concert",
        dateType: "single",
        startDate: "2027-04-10",
        location: "Mumbai",
        category: "performer",
        details: {
          services: ["AV"], // planner field, not performer
          guestCount: 100,
          budgetMin: 5000,
          budgetMax: 10000,
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects unknown extra fields with strict validation", async () => {
      const res = await request(app).post("/api/requirements").send({
        eventName: "Valid Name",
        eventType: "Birthday",
        dateType: "single",
        startDate: "2027-04-10",
        location: "Bangalore",
        category: "planner",
        extraUnknownField: "not allowed",
        details: {
          services: ["decor"],
          guestCount: 20,
          budgetMin: 1000,
          budgetMax: 2000,
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const messages = res.body.errors.map((e: { message: string }) => e.message);
      expect(messages.some((m: string) => m.includes("Unknown fields"))).toBe(true);
    });

    it("rejects range dateType when endDate is before startDate", async () => {
      const res = await request(app).post("/api/requirements").send({
        eventName: "Date Range Fail",
        eventType: "Wedding",
        dateType: "range",
        startDate: "2027-08-15",
        endDate: "2027-08-10",
        location: "Jaipur",
        category: "planner",
        details: {
          services: ["catering"],
          guestCount: 100,
          budgetMin: 50000,
          budgetMax: 100000,
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const paths = res.body.errors.map((e: { path: string }) => e.path);
      expect(paths).toContain("endDate");
    });

    it("rejects past startDate", async () => {
      const res = await request(app).post("/api/requirements").send({
        eventName: "Past Event",
        eventType: "Birthday",
        dateType: "single",
        startDate: "2020-01-01",
        location: "Delhi",
        category: "planner",
        details: {
          services: ["decor"],
          guestCount: 30,
          budgetMin: 5000,
          budgetMax: 10000,
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const errors = res.body.errors.filter((e: { path: string }) => e.path === "startDate");
      expect(errors[0].message).toContain("Start date cannot be in the past");
    });

    it("rejects planner details when planningDeadline is after event startDate", async () => {
      const res = await request(app).post("/api/requirements").send({
        eventName: "Deadline Inversion",
        eventType: "Corporate",
        dateType: "single",
        startDate: "2027-04-10",
        location: "Mumbai",
        category: "planner",
        details: {
          services: ["AV"],
          guestCount: 50,
          budgetMin: 10000,
          budgetMax: 20000,
          planningDeadline: "2027-04-15", // After startDate!
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const paths = res.body.errors.map((e: { path: string }) => e.path);
      expect(paths).toContain("details.planningDeadline");
    });

    it("rejects planner details when budgetMax is less than budgetMin", async () => {
      const res = await request(app).post("/api/requirements").send({
        eventName: "Budget Inversion",
        eventType: "Corporate",
        dateType: "single",
        startDate: "2027-04-10",
        location: "Mumbai",
        category: "planner",
        details: {
          services: ["AV"],
          guestCount: 50,
          budgetMin: 50000,
          budgetMax: 20000, // Less than min!
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const paths = res.body.errors.map((e: { path: string }) => e.path);
      expect(paths).toContain("details.budgetMax");
    });
  });

  // 4. GET Requirements & ID Handling
  describe("GET /api/requirements/:id", () => {
    it("returns 200 with the single requirement document", async () => {
      const created = await Requirement.create({
        eventName: "Single Fetch Test",
        eventType: "Wedding",
        dateType: "single",
        startDate: new Date("2027-07-07"),
        location: "Udaipur",
        category: "planner",
        details: {
          services: ["decor"],
          guestCount: 150,
          budgetMin: 200000,
          budgetMax: 400000,
        },
      });

      const res = await request(app).get(`/api/requirements/${created._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.eventName).toBe("Single Fetch Test");
    });

    it("returns 404 for a valid ObjectId that does not exist", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toHexString();
      const res = await request(app).get(`/api/requirements/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: "Requirement not found",
      });
    });

    it("returns 400 with standard error shape for an invalid ObjectId format", async () => {
      const res = await request(app).get("/api/requirements/not-a-valid-id-123");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid requirement ID",
        errors: [{ path: "id", message: "Invalid ObjectId format" }],
      });
    });
  });

  // 5. List Filtering & Pagination
  describe("GET /api/requirements - Filtering & Pagination", () => {
    beforeEach(async () => {
      await Requirement.create([
        {
          eventName: "Planner Event 1",
          eventType: "Wedding",
          dateType: "single",
          startDate: new Date("2027-05-01"),
          location: "Goa",
          category: "planner",
          details: { services: ["catering"], guestCount: 100, budgetMin: 1000, budgetMax: 2000 },
        },
        {
          eventName: "Planner Event 2",
          eventType: "Birthday",
          dateType: "single",
          startDate: new Date("2027-05-02"),
          location: "Goa",
          category: "planner",
          details: { services: ["decor"], guestCount: 50, budgetMin: 500, budgetMax: 1000 },
        },
        {
          eventName: "Performer Event 1",
          eventType: "Concert",
          dateType: "single",
          startDate: new Date("2027-05-03"),
          location: "Mumbai",
          category: "performer",
          details: {
            performerType: "Singer",
            genre: "Classical",
            performanceDurationMins: 60,
            numberOfPerformers: 1,
            equipmentProvidedByHost: false,
            budgetPerPerformance: 25000,
            travelAccommodationCovered: true,
          },
        },
      ]);
    });

    it("filters requirements by category", async () => {
      const res = await request(app).get("/api/requirements?category=planner");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every((r: { category: string }) => r.category === "planner")).toBe(true);
      expect(res.body.pagination.total).toBe(2);
    });

    it("supports pagination parameters (limit and page)", async () => {
      const res = await request(app).get("/api/requirements?page=1&limit=2");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toEqual({
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
      });
    });
  });

  // 6. DB Disconnection Resilience
  describe("Database Disconnected Handling", () => {
    it("returns 503 with standard error shape when database is disconnected", async () => {
      // Disconnect mongoose intentionally to test 503 guard
      await mongoose.disconnect();

      const res = await request(app).get("/api/requirements");
      expect(res.status).toBe(503);
      expect(res.body).toEqual({
        success: false,
        message: "Database service is currently unavailable. Please try again shortly.",
        errors: [
          {
            path: "database",
            message: "Database connection is not ready",
          },
        ],
      });

      // Reconnect for any subsequent hooks
      const uri = mongod.getUri();
      await mongoose.connect(uri);
    });
  });
});
