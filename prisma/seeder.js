import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Example: Ensure at least 1 user exists
  const user_id = 3;

  await prisma.job.createMany({
    data: [
      {
        title: "UI/UX Designer for Mobile App",
        description: "Design a student freelance marketplace mobile interface.",
        category: "Design",
        location: "Shah Alam",
        budget: 500,
        deadline: new Date("2025-01-20"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job1.jpg",
        requiredSkills: "UI/UX Design/Prototyping/Figma"
      },
      {
        title: "Front-End Developer Needed",
        description: "Build landing page using Nuxt and Tailwind.",
        category: "Development",
        location: "Kuala Lumpur",
        budget: 800,
        deadline: new Date("2025-01-30"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job2.jpg",
        requiredSkills: "Front End/JavaScript/Nuxt/TailwindCSS"
      },
      {
        title: "Poster Designer",
        description: "Design promotional poster for club event.",
        category: "Design",
        location: "UiTM Puncak Perdana",
        budget: 150,
        deadline: new Date("2025-02-05"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job3.jpg",
        requiredSkills: "Graphic Design/Canva/Adobe Photoshop"
      },
      {
        title: "UI/UX Designer for Mobile App",
        description:
          "Design a modern and intuitive UI/UX for a student freelance marketplace mobile app targeting university students. Create wireframes, high-fidelity mockups, and user flows.",
        category: "Design",
        location: "Shah Alam",
        budget: 500,
        deadline: new Date("2025-02-15"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job1.jpg",
        requiredSkills: "UI/UX Design/Figma/Prototyping/Wireframing"
      },
      {
        title: "Nuxt & Tailwind Front-End Developer",
        description:
          "Build responsive pages and components for SiswaGig using Nuxt 3 and Tailwind CSS. Work includes hero section, search bar, job listings, and modal components.",
        category: "Development",
        location: "Kuala Lumpur",
        budget: 900,
        deadline: new Date("2025-02-25"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job2.jpg",
        requiredSkills: "Front End/Nuxt/Tailwind CSS/JavaScript"
      },
      {
        title: "Event Poster & Social Media Designer",
        description:
          "Design three promotional posters and two Instagram story templates for a university club event. Must match the event's color theme and modern youth style.",
        category: "Design",
        location: "UiTM Puncak Perdana",
        budget: 180,
        deadline: new Date("2025-01-30"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job3.jpg",
        requiredSkills: "Graphic Design/Canva/Adobe Photoshop/Typography"
      },
      {
        title: "Laravel API Developer for Booking System",
        description:
          "Develop REST API endpoints for a room & equipment booking system. Includes availability checking, request validation, rate limiting, and authentication.",
        category: "Development",
        location: "Petaling Jaya",
        budget: 750,
        deadline: new Date("2025-03-05"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job4.jpg",
        requiredSkills: "Laravel/PHP/API Development/MySQL"
      },
      {
        title: "Video Editor for Short TikTok Clips",
        description:
          "Edit 10 TikTok videos (20–30s each) for an event recap. Must include captions, transitions, background music, and motion graphics.",
        category: "Video Editing",
        location: "Online",
        budget: 300,
        deadline: new Date("2025-01-25"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job5.jpg",
        requiredSkills: "Video Editing/CapCut/Premiere Pro/Motion Graphics"
      },
      {
        title: "Freelance Photographer for Convocation",
        description:
          "Take candid & portrait photos for a group of graduates during convocation. Deliver 50 edited photos within 5 days.",
        category: "Photography",
        location: "UiTM Shah Alam",
        budget: 250,
        deadline: new Date("2025-02-10"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job6.jpg",
        requiredSkills: "Photography/Lightroom/Basic Retouching"
      },
      {
        title: "Article Writer – Student Lifestyle Blog",
        description:
          "Write 4 SEO-friendly articles (600–800 words) about productivity tips, study hacks, budgeting, and campus life.",
        category: "Writing",
        location: "Online",
        budget: 200,
        deadline: new Date("2025-02-01"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job7.jpg",
        requiredSkills: "Writing/SEO/Editing/Research"
      },
      {
        title: "Basic Logo Design for Start-Up",
        description:
          "Create a simple but professional logo for a new student start-up. Deliver vector logo + color palette + brand guidelines.",
        category: "Design",
        location: "Seri Iskandar",
        budget: 120,
        deadline: new Date("2025-01-28"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job8.jpg",
        requiredSkills:
          "Graphic Design/Adobe Illustrator/Branding/Logo Design"
      },
      {
        title: "React Native Developer for Attendance App",
        description:
          "Develop QR-based attendance scanning with camera integration and API submission. App must support offline caching.",
        category: "Development",
        location: "Online",
        budget: 1100,
        deadline: new Date("2025-03-12"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job9.jpg",
        requiredSkills: "React Native/Mobile Development/TypeScript/API"
      },
      {
        title: "Data Analyst for Survey Report",
        description:
          "Analyze survey data (150 responses) and generate insights + charts for a club research report. Deliver CSV cleaning + PDF summary.",
        category: "Data",
        location: "Online",
        budget: 220,
        deadline: new Date("2025-02-08"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job10.jpg",
        requiredSkills: "Data Analysis/Excel/Google Sheets/Visualization"
      },
      {
        title: "Social Media Manager for Monthly Campaign",
        description:
          "Plan and schedule 12 Instagram posts and 8 stories for a monthly awareness campaign. Provide captions and design templates.",
        category: "Marketing",
        location: "Online",
        budget: 350,
        deadline: new Date("2025-02-18"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job11.jpg",
        requiredSkills: "Social Media/Content Planning/Copywriting/Design"
      },
      {
        title: "Backend Developer – Chat Messaging Feature",
        description:
          "Implement chat functionality using WebSockets. Must include read receipts, typing indicators, and message history retrieval.",
        category: "Development",
        location: "Cyberjaya",
        budget: 1300,
        deadline: new Date("2025-03-20"),
        status: "open",
        user_id: user_id,
        image_url: "https://example.com/job12.jpg",
        requiredSkills: "Node.js/WebSockets/Express/Real-Time Systems"
      }
    ]
  });

  console.log("Job seeds inserted!");
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
