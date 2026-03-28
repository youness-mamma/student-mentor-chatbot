import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { staff } from "./schema";

config({ path: ".env.local" });

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

const seedStaff = [
  {
    name: "Dr. Sarah Mitchell",
    email: "s.mitchell@university.edu",
    role: "Professor of Mathematics",
    category: "academic" as const,
    contactMethod: "video-call" as const,
    department: "Mathematics",
    bio: "Specializes in helping students with calculus, linear algebra, and statistics. Office hours available for one-on-one tutoring.",
    language: "en",
  },
  {
    name: "Prof. Ahmed Benali",
    email: "a.benali@university.edu",
    role: "Professor of Computer Science",
    category: "academic" as const,
    contactMethod: "video-call" as const,
    department: "Computer Science",
    bio: "Expert in programming fundamentals, data structures, and algorithms. Happy to help students struggling with coding assignments.",
    language: "fr",
  },
  {
    name: "Dr. Layla Mansouri",
    email: "l.mansouri@university.edu",
    role: "School Psychologist",
    category: "psychological" as const,
    contactMethod: "video-call" as const,
    department: "Student Wellness Center",
    bio: "Licensed psychologist specializing in student mental health, stress management, anxiety, and adjustment issues. Confidential sessions available.",
    language: "fr",
  },
  {
    name: "James Cooper",
    email: "j.cooper@university.edu",
    role: "Student Counselor",
    category: "psychological" as const,
    contactMethod: "in-person" as const,
    department: "Student Wellness Center",
    bio: "Provides support for students dealing with personal challenges, homesickness, relationship issues, and academic burnout.",
    language: "en",
  },
  {
    name: "Maria Garcia",
    email: "m.garcia@university.edu",
    role: "Administrative Officer",
    category: "administrative" as const,
    contactMethod: "in-person" as const,
    department: "Student Services",
    bio: "Handles enrollment, transcripts, certificates, fee payments, and general administrative inquiries.",
    language: "en",
  },
  {
    name: "Fatima Zahra El Idrissi",
    email: "f.elidrissi@university.edu",
    role: "Administrative Assistant",
    category: "administrative" as const,
    contactMethod: "messaging" as const,
    department: "Registrar Office",
    bio: "Assists with document requests, enrollment verification, and student record updates. Available via messaging for quick questions.",
    language: "ar",
  },
  {
    name: "Dr. Robert Chen",
    email: "r.chen@university.edu",
    role: "Career Advisor",
    category: "career" as const,
    contactMethod: "video-call" as const,
    department: "Career Development Center",
    bio: "Helps students with career planning, resume building, interview preparation, and internship placement. 10+ years in career counseling.",
    language: "en",
  },
  {
    name: "Nadia Bouchard",
    email: "n.bouchard@university.edu",
    role: "Internship Coordinator",
    category: "career" as const,
    contactMethod: "video-call" as const,
    department: "Career Development Center",
    bio: "Connects students with internship opportunities, manages industry partnerships, and provides guidance on professional development.",
    language: "fr",
  },
];

async function seed() {
  console.log("Seeding staff data...");

  for (const member of seedStaff) {
    await db.insert(staff).values(member).onConflictDoNothing();
    console.log(`  Added: ${member.name} (${member.category})`);
  }

  console.log("Done! Seeded", seedStaff.length, "staff members.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
