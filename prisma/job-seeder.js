import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Job Seeder for Student Freelancing Platform
 * All jobs belong to user_id: 3
 * Locations are around UiTM campuses in Malaysia
 */

// UiTM Campus Coordinates
const UITM_LOCATIONS = {
  shahAlam: { name: "UiTM Shah Alam", lat: 3.0957, lng: 101.5934 },
  puncakAlam: { name: "UiTM Puncak Alam", lat: 3.2341, lng: 101.5528 },
  bandaraya: { name: "UiTM Kampus Bandaraya, KL", lat: 3.1395, lng: 101.6932 },
  perak: { name: "UiTM Perak", lat: 4.3872, lng: 100.9726 },
  penang: { name: "UiTM Pulau Pinang", lat: 5.3524, lng: 100.4696 },
  johor: { name: "UiTM Johor", lat: 2.0374, lng: 102.8082 },
  sarawak: { name: "UiTM Sarawak", lat: 1.5533, lng: 110.3592 },
  sabah: { name: "UiTM Sabah", lat: 5.9788, lng: 118.1752 },
  // Nearby areas
  cyberjaya: { name: "Cyberjaya", lat: 2.9264, lng: 101.6964 },
  subangJaya: { name: "Subang Jaya", lat: 3.0697, lng: 101.5940 },
  petaling: { name: "Petaling Jaya", lat: 3.1078, lng: 101.5880 },
  klcc: { name: "KLCC, Kuala Lumpur", lat: 3.1578, lng: 101.6755 },
  setiaAlam: { name: "Setia Alam", lat: 3.0722, lng: 101.5225 },
  sunway: { name: "Sunway", lat: 3.0723, lng: 101.5931 },
};

const USER_ID = 3;

async function seedJobs() {
  console.log("🚀 Starting job seeder for student freelancing platform...");
  console.log(`📌 All jobs will be assigned to user_id: ${USER_ID}`);

  const jobs = [
    // ===== DESIGN JOBS =====
    {
      title: "Design Poster for Campus Event",
      description: "Need a creative poster design for our faculty's annual dinner event. The poster should include event details, venue information, and follow the faculty's color scheme (maroon and gold). Deliverables: A3 poster in PDF and PNG format, editable source file (Canva/Figma/AI).",
      category: "Design",
      location: UITM_LOCATIONS.shahAlam.name,
      latitude: UITM_LOCATIONS.shahAlam.lat,
      longitude: UITM_LOCATIONS.shahAlam.lng,
      budget: 80,
      deadline: new Date("2025-02-15"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400",
      requiredSkills: "Graphic Design/Canva/Adobe Illustrator/Poster Design"
    },
    {
      title: "UI/UX Design for Student Marketplace App",
      description: "Looking for a UI/UX designer to create wireframes and high-fidelity mockups for a student marketplace mobile app. The app will allow students to buy/sell used textbooks, notes, and study materials. Need 8-10 screens including onboarding, home, search, product detail, cart, and profile pages.",
      category: "Design",
      location: UITM_LOCATIONS.puncakAlam.name,
      latitude: UITM_LOCATIONS.puncakAlam.lat,
      longitude: UITM_LOCATIONS.puncakAlam.lng,
      budget: 450,
      deadline: new Date("2025-03-01"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400",
      requiredSkills: "UI/UX Design/Figma/Mobile App Design/Wireframing/Prototyping"
    },
    {
      title: "Logo Design for Student Club",
      description: "Our newly formed Entrepreneurship Club needs a professional logo. The logo should represent innovation, youth, and business. Provide 3 initial concepts with 2 revision rounds. Final deliverables: Vector files (AI, SVG, EPS), PNG with transparent background, and brand color palette.",
      category: "Design",
      location: UITM_LOCATIONS.bandaraya.name,
      latitude: UITM_LOCATIONS.bandaraya.lat,
      longitude: UITM_LOCATIONS.bandaraya.lng,
      budget: 150,
      deadline: new Date("2025-02-10"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
      requiredSkills: "Logo Design/Branding/Adobe Illustrator/Graphic Design"
    },
    {
      title: "Instagram Feed Design (12 Posts)",
      description: "Design 12 cohesive Instagram posts for a student-run online bakery business. Posts should include product showcases, testimonials, and promotional content. Provide editable Canva templates so we can reuse the style for future posts.",
      category: "Design",
      location: UITM_LOCATIONS.sunway.name,
      latitude: UITM_LOCATIONS.sunway.lat,
      longitude: UITM_LOCATIONS.sunway.lng,
      budget: 200,
      deadline: new Date("2025-02-20"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",
      requiredSkills: "Social Media Design/Canva/Instagram/Content Creation"
    },

    // ===== DEVELOPMENT JOBS =====
    {
      title: "Build Simple Portfolio Website",
      description: "Need a responsive portfolio website for showcasing my photography work. Requirements: Gallery with lightbox, about page, contact form, and social media links. Prefer Next.js or Nuxt.js. Must be mobile-friendly and fast loading. Hosting will be on Vercel.",
      category: "Development",
      location: UITM_LOCATIONS.cyberjaya.name,
      latitude: UITM_LOCATIONS.cyberjaya.lat,
      longitude: UITM_LOCATIONS.cyberjaya.lng,
      budget: 350,
      deadline: new Date("2025-02-28"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      requiredSkills: "Web Development/Next.js/Vue.js/Responsive Design/Tailwind CSS"
    },
    {
      title: "Develop Event Registration System",
      description: "Create a web-based event registration system for university events. Features needed: Event listing, registration form, QR code generation for tickets, attendance tracking dashboard, and email notifications. Tech stack: Node.js + PostgreSQL or Firebase.",
      category: "Development",
      location: UITM_LOCATIONS.shahAlam.name,
      latitude: UITM_LOCATIONS.shahAlam.lat,
      longitude: UITM_LOCATIONS.shahAlam.lng,
      budget: 800,
      deadline: new Date("2025-03-15"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
      requiredSkills: "Node.js/PostgreSQL/React/REST API/Firebase"
    },
    {
      title: "Flutter App for Study Group Finder",
      description: "Build a Flutter mobile app that helps students find and join study groups. Features: User authentication, create/join study groups, in-app chat, schedule meetups, location-based search. Backend can use Firebase or Supabase.",
      category: "Development",
      location: UITM_LOCATIONS.petaling.name,
      latitude: UITM_LOCATIONS.petaling.lat,
      longitude: UITM_LOCATIONS.petaling.lng,
      budget: 1200,
      deadline: new Date("2025-04-01"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
      requiredSkills: "Flutter/Firebase/Mobile Development/Dart/UI Design"
    },
    {
      title: "WordPress Website for Tuition Center",
      description: "Create a WordPress website for a home tuition center near campus. Pages needed: Home, About, Courses, Tutors, Contact, and Blog. Include online inquiry form and WhatsApp integration. Must be SEO-friendly.",
      category: "Development",
      location: UITM_LOCATIONS.subangJaya.name,
      latitude: UITM_LOCATIONS.subangJaya.lat,
      longitude: UITM_LOCATIONS.subangJaya.lng,
      budget: 400,
      deadline: new Date("2025-02-25"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400",
      requiredSkills: "WordPress/Web Development/SEO/PHP/Elementor"
    },
    {
      title: "Python Script for Data Scraping",
      description: "Need a Python script to scrape job listings from 5 Malaysian job portals (JobStreet, Indeed MY, etc.). Extract: job title, company, location, salary, requirements. Output to CSV and JSON. Include documentation and error handling.",
      category: "Development",
      location: UITM_LOCATIONS.klcc.name,
      latitude: UITM_LOCATIONS.klcc.lat,
      longitude: UITM_LOCATIONS.klcc.lng,
      budget: 250,
      deadline: new Date("2025-02-18"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
      requiredSkills: "Python/Web Scraping/BeautifulSoup/Selenium/Data Processing"
    },

    // ===== WRITING & CONTENT JOBS =====
    {
      title: "Write 10 Blog Articles on Study Tips",
      description: "Looking for a content writer to write 10 SEO-optimized blog articles (800-1000 words each) about study tips, time management, and productivity for university students. Topics include: effective note-taking, exam preparation, managing assignments, etc.",
      category: "Writing",
      location: UITM_LOCATIONS.perak.name,
      latitude: UITM_LOCATIONS.perak.lat,
      longitude: UITM_LOCATIONS.perak.lng,
      budget: 300,
      deadline: new Date("2025-03-10"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
      requiredSkills: "Content Writing/SEO/Blogging/Research/Copywriting"
    },
    {
      title: "Proofread Final Year Project Report",
      description: "Need proofreading and editing for my FYP report (approximately 80 pages). Check for grammar, spelling, punctuation, formatting consistency, and academic writing style. The report is in English, topic is related to Information Technology.",
      category: "Writing",
      location: UITM_LOCATIONS.puncakAlam.name,
      latitude: UITM_LOCATIONS.puncakAlam.lat,
      longitude: UITM_LOCATIONS.puncakAlam.lng,
      budget: 120,
      deadline: new Date("2025-02-08"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400",
      requiredSkills: "Proofreading/Editing/Academic Writing/English/Research"
    },
    {
      title: "Create Product Descriptions for E-commerce",
      description: "Write engaging product descriptions for 50 fashion items (hijab, modest wear) for a student's online boutique. Each description should be 50-100 words, highlighting features, materials, and styling tips. Must be in both English and Bahasa Malaysia.",
      category: "Writing",
      location: UITM_LOCATIONS.penang.name,
      latitude: UITM_LOCATIONS.penang.lat,
      longitude: UITM_LOCATIONS.penang.lng,
      budget: 180,
      deadline: new Date("2025-02-22"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
      requiredSkills: "Copywriting/E-commerce/Bilingual/Creative Writing/Marketing"
    },

    // ===== VIDEO & MEDIA JOBS =====
    {
      title: "Edit YouTube Video (10-15 minutes)",
      description: "Edit a raw footage (45 mins) into a polished 10-15 minute YouTube video about campus life vlog. Add jump cuts, background music, subtitles, transitions, and intro/outro. Provide thumbnail design as well. Format: 1080p MP4.",
      category: "Video",
      location: UITM_LOCATIONS.shahAlam.name,
      latitude: UITM_LOCATIONS.shahAlam.lat,
      longitude: UITM_LOCATIONS.shahAlam.lng,
      budget: 180,
      deadline: new Date("2025-02-12"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400",
      requiredSkills: "Video Editing/Adobe Premiere Pro/CapCut/Thumbnail Design/YouTube"
    },
    {
      title: "Create Promotional Video for Club Recruitment",
      description: "Produce a 1-2 minute promotional video for our Photography Club's recruitment drive. We'll provide raw clips and photos. Need motion graphics, text animations, and energetic music. Must capture the club's fun and creative vibe.",
      category: "Video",
      location: UITM_LOCATIONS.johor.name,
      latitude: UITM_LOCATIONS.johor.lat,
      longitude: UITM_LOCATIONS.johor.lng,
      budget: 280,
      deadline: new Date("2025-02-28"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400",
      requiredSkills: "Video Production/Motion Graphics/After Effects/Video Editing"
    },
    {
      title: "Record and Edit Podcast Episode",
      description: "Need someone to help record (via Zoom/Discord) and edit a 30-minute podcast episode about student entrepreneurship. Tasks: Audio cleanup, remove filler words, add intro music, normalize audio levels, export to MP3 and WAV.",
      category: "Audio",
      location: UITM_LOCATIONS.bandaraya.name,
      latitude: UITM_LOCATIONS.bandaraya.lat,
      longitude: UITM_LOCATIONS.bandaraya.lng,
      budget: 100,
      deadline: new Date("2025-02-14"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400",
      requiredSkills: "Audio Editing/Podcast Production/Audacity/Adobe Audition"
    },

    // ===== DATA & RESEARCH JOBS =====
    {
      title: "Data Entry for Survey Results",
      description: "Enter survey data from 200 physical questionnaire forms into Google Sheets. The survey has 25 questions (mostly multiple choice with some open-ended). Need accurate data entry with proper coding for analysis. Deadline is tight.",
      category: "Data",
      location: UITM_LOCATIONS.sarawak.name,
      latitude: UITM_LOCATIONS.sarawak.lat,
      longitude: UITM_LOCATIONS.sarawak.lng,
      budget: 100,
      deadline: new Date("2025-02-05"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      requiredSkills: "Data Entry/Google Sheets/Excel/Attention to Detail"
    },
    {
      title: "SPSS Analysis for Research Project",
      description: "Perform statistical analysis using SPSS for my final year research. Need: Descriptive statistics, reliability test, correlation analysis, and regression analysis. Provide interpretation of results and methodology section write-up.",
      category: "Data",
      location: UITM_LOCATIONS.puncakAlam.name,
      latitude: UITM_LOCATIONS.puncakAlam.lat,
      longitude: UITM_LOCATIONS.puncakAlam.lng,
      budget: 200,
      deadline: new Date("2025-02-20"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      requiredSkills: "SPSS/Statistical Analysis/Research/Data Analysis/Academic Writing"
    },
    {
      title: "Create Dashboard in Power BI",
      description: "Build an interactive Power BI dashboard to visualize sales data for a student-run online business. Data is in Excel format. Dashboard should show: Sales trends, top products, customer demographics, and monthly comparisons.",
      category: "Data",
      location: UITM_LOCATIONS.cyberjaya.name,
      latitude: UITM_LOCATIONS.cyberjaya.lat,
      longitude: UITM_LOCATIONS.cyberjaya.lng,
      budget: 250,
      deadline: new Date("2025-02-25"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      requiredSkills: "Power BI/Data Visualization/Excel/Dashboard Design/Analytics"
    },

    // ===== MARKETING & SOCIAL MEDIA JOBS =====
    {
      title: "Social Media Manager (1 Month)",
      description: "Manage Instagram and TikTok accounts for a student food delivery service for 1 month. Tasks: Create content calendar, post 5x/week on each platform, respond to DMs and comments, provide monthly analytics report.",
      category: "Marketing",
      location: UITM_LOCATIONS.setiaAlam.name,
      latitude: UITM_LOCATIONS.setiaAlam.lat,
      longitude: UITM_LOCATIONS.setiaAlam.lng,
      budget: 400,
      deadline: new Date("2025-03-01"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",
      requiredSkills: "Social Media Marketing/Instagram/TikTok/Content Creation/Analytics"
    },
    {
      title: "Run Facebook Ads Campaign",
      description: "Set up and manage Facebook/Instagram ads for a 2-week campaign promoting online tutoring services. Budget: RM300. Need: Ad creative design, audience targeting, A/B testing, and performance report. Target: Malaysian students aged 18-25.",
      category: "Marketing",
      location: UITM_LOCATIONS.shahAlam.name,
      latitude: UITM_LOCATIONS.shahAlam.lat,
      longitude: UITM_LOCATIONS.shahAlam.lng,
      budget: 200,
      deadline: new Date("2025-02-28"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400",
      requiredSkills: "Facebook Ads/Digital Marketing/Social Media Advertising/Analytics"
    },

    // ===== TRANSLATION & LANGUAGE JOBS =====
    {
      title: "Translate Document BM to English",
      description: "Translate a 20-page academic document from Bahasa Malaysia to English. The document is about Malaysian economic development. Need accurate translation maintaining academic tone. Deadline is flexible.",
      category: "Translation",
      location: UITM_LOCATIONS.sabah.name,
      latitude: UITM_LOCATIONS.sabah.lat,
      longitude: UITM_LOCATIONS.sabah.lng,
      budget: 150,
      deadline: new Date("2025-02-18"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
      requiredSkills: "Translation/Bahasa Malaysia/English/Academic Writing/Proofreading"
    },
    {
      title: "Subtitle YouTube Videos (5 Videos)",
      description: "Add English subtitles to 5 YouTube videos (each 8-12 minutes) about Malaysian street food. Videos are in mixed Malay/English. Need accurate timing and translation. Deliver SRT files.",
      category: "Translation",
      location: UITM_LOCATIONS.penang.name,
      latitude: UITM_LOCATIONS.penang.lat,
      longitude: UITM_LOCATIONS.penang.lng,
      budget: 120,
      deadline: new Date("2025-02-15"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400",
      requiredSkills: "Subtitling/Translation/Video/English/Bahasa Malaysia"
    },

    // ===== TUTORING & EDUCATION JOBS =====
    {
      title: "Create PowerPoint Presentation for Assignment",
      description: "Need a professional PowerPoint presentation (15-20 slides) for my Marketing subject group presentation. Topic: Digital Marketing Strategies for Small Businesses. Include graphics, charts, and speaker notes.",
      category: "Education",
      location: UITM_LOCATIONS.johor.name,
      latitude: UITM_LOCATIONS.johor.lat,
      longitude: UITM_LOCATIONS.johor.lng,
      budget: 80,
      deadline: new Date("2025-02-10"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
      requiredSkills: "PowerPoint/Presentation Design/Research/Marketing Knowledge"
    },
    {
      title: "Online Math Tutor (10 Sessions)",
      description: "Looking for an online tutor to help with Calculus II. Need 10 sessions (1 hour each) over 5 weeks via Google Meet. Topics: Integration techniques, differential equations, and series. Must be patient and explain clearly.",
      category: "Education",
      location: UITM_LOCATIONS.sarawak.name,
      latitude: UITM_LOCATIONS.sarawak.lat,
      longitude: UITM_LOCATIONS.sarawak.lng,
      budget: 300,
      deadline: new Date("2025-03-15"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
      requiredSkills: "Mathematics/Tutoring/Calculus/Teaching/Online Education"
    },

    // ===== PHOTOGRAPHY JOBS =====
    {
      title: "Product Photography for Online Store",
      description: "Take professional product photos for 30 handmade jewelry items. Requirements: White background, multiple angles, lifestyle shots. Provide edited high-res images. Equipment and editing included. Can do at my place or yours.",
      category: "Photography",
      location: UITM_LOCATIONS.petaling.name,
      latitude: UITM_LOCATIONS.petaling.lat,
      longitude: UITM_LOCATIONS.petaling.lng,
      budget: 250,
      deadline: new Date("2025-02-20"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400",
      requiredSkills: "Product Photography/Photo Editing/Lightroom/Studio Photography"
    },
    {
      title: "Event Photography - Club Gathering",
      description: "Photograph our Computer Science Club's semester-end gathering (3 hours). Expected 50+ attendees. Need candid shots, group photos, and event highlights. Deliver 100+ edited photos within 1 week.",
      category: "Photography",
      location: UITM_LOCATIONS.shahAlam.name,
      latitude: UITM_LOCATIONS.shahAlam.lat,
      longitude: UITM_LOCATIONS.shahAlam.lng,
      budget: 200,
      deadline: new Date("2025-02-22"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      requiredSkills: "Event Photography/Photo Editing/Portrait Photography/Lightroom"
    },

    // ===== MISCELLANEOUS JOBS =====
    {
      title: "Virtual Assistant (Part-Time, 2 Weeks)",
      description: "Need a virtual assistant to help manage emails, schedule meetings, do research, and organize Google Drive files. 2-3 hours per day for 2 weeks. Must be responsive and organized. Perfect for students with flexible schedules.",
      category: "Admin",
      location: UITM_LOCATIONS.klcc.name,
      latitude: UITM_LOCATIONS.klcc.lat,
      longitude: UITM_LOCATIONS.klcc.lng,
      budget: 300,
      deadline: new Date("2025-02-28"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400",
      requiredSkills: "Virtual Assistant/Google Workspace/Organization/Communication/Research"
    },
    {
      title: "Create Resume and Cover Letter",
      description: "Help me create a professional resume and cover letter for internship applications in the IT industry. I'll provide my details and experiences. Need ATS-friendly format and industry-specific keywords.",
      category: "Writing",
      location: UITM_LOCATIONS.puncakAlam.name,
      latitude: UITM_LOCATIONS.puncakAlam.lat,
      longitude: UITM_LOCATIONS.puncakAlam.lng,
      budget: 60,
      deadline: new Date("2025-02-08"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
      requiredSkills: "Resume Writing/Career Counseling/Copywriting/HR Knowledge"
    },
    {
      title: "3D Model for Architecture Assignment",
      description: "Create a 3D model of a small cafe interior design for my Architecture assignment. Software: SketchUp or Blender. Include furniture, lighting, and basic textures. Provide source file and rendered images from multiple angles.",
      category: "Design",
      location: UITM_LOCATIONS.perak.name,
      latitude: UITM_LOCATIONS.perak.lat,
      longitude: UITM_LOCATIONS.perak.lng,
      budget: 350,
      deadline: new Date("2025-03-01"),
      status: "open",
      user_id: USER_ID,
      image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      requiredSkills: "3D Modeling/SketchUp/Blender/Interior Design/Rendering"
    },
  ];

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { user_id: USER_ID }
    });

    if (!user) {
      console.error(`❌ Error: User with ID ${USER_ID} not found. Please create the user first.`);
      return;
    }

    console.log(`✅ Found user: ${user.name} (ID: ${user.user_id})`);

    // Insert jobs
    const result = await prisma.job.createMany({
      data: jobs,
      skipDuplicates: true
    });

    console.log(`\n✅ Successfully inserted ${result.count} jobs!`);
    console.log(`\n📍 Job locations cover these UiTM campuses and nearby areas:`);
    
    const locationCounts = {};
    jobs.forEach(job => {
      locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
    });
    
    Object.entries(locationCounts).forEach(([location, count]) => {
      console.log(`   - ${location}: ${count} jobs`);
    });

    console.log(`\n📊 Jobs by category:`);
    const categoryCounts = {};
    jobs.forEach(job => {
      categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} jobs`);
    });

  } catch (error) {
    console.error("❌ Error seeding jobs:", error);
    throw error;
  }
}

seedJobs()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n🎉 Job seeding completed!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
