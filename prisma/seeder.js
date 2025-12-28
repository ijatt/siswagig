import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Add comprehensive freelancing industry skills
  const skills = [
    // Design Skills
    "UI/UX Design",
    "Graphic Design",
    "Web Design",
    "Logo Design",
    "Branding",
    "Figma",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Adobe XD",
    "Canva",
    "Wireframing",
    "Prototyping",
    "Mobile App Design",
    "Responsive Design",
    "Typography",
    "Color Theory",
    "Icon Design",
    "Illustration",
    "3D Design",
    "Animation Design",
    
    // Development - Frontend
    "Front End Development",
    "JavaScript",
    "TypeScript",
    "React",
    "React Native",
    "Vue.js",
    "Nuxt",
    "Angular",
    "HTML/CSS",
    "Tailwind CSS",
    "Bootstrap",
    "Next.js",
    "Svelte",
    "Web Development",
    "Responsive Web Design",
    "Progressive Web Apps",
    "jQuery",
    "SASS/SCSS",
    "CSS Grid",
    "Flexbox",
    
    // Development - Backend
    "Backend Development",
    "Node.js",
    "Express.js",
    "Laravel",
    "PHP",
    "Python",
    "Django",
    "Flask",
    "Ruby on Rails",
    "Java",
    "Spring Boot",
    "C#",
    ".NET",
    "Go",
    "REST API",
    "GraphQL",
    "WebSockets",
    "Real-Time Systems",
    "Microservices",
    
    // Database
    "Database Design",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Firebase",
    "Redis",
    "Oracle Database",
    "Database Optimization",
    "Data Modeling",
    
    // Mobile Development
    "Mobile Development",
    "iOS Development",
    "Android Development",
    "Flutter",
    "Kotlin",
    "Swift",
    "Objective-C",
    "Cross-Platform Development",
    "App Store Optimization",
    
    // Video & Media
    "Video Editing",
    "Video Production",
    "Adobe Premiere Pro",
    "Final Cut Pro",
    "CapCut",
    "DaVinci Resolve",
    "Motion Graphics",
    "After Effects",
    "Video Animation",
    "Photography",
    "Photo Editing",
    "Lightroom",
    "Photo Retouching",
    "Portrait Photography",
    "Product Photography",
    "Video Shooting",
    "Cinematography",
    "Audio Editing",
    "Sound Design",
    
    // Writing & Content
    "Content Writing",
    "Copywriting",
    "SEO Writing",
    "Blog Writing",
    "Technical Writing",
    "Editing",
    "Proofreading",
    "Translation",
    "Content Strategy",
    "Research",
    "Creative Writing",
    "Journalistic Writing",
    "Grant Writing",
    "Speech Writing",
    
    // Marketing & Social Media
    "Social Media Marketing",
    "Social Media Management",
    "Content Planning",
    "Instagram Marketing",
    "Facebook Marketing",
    "Twitter Marketing",
    "LinkedIn Marketing",
    "TikTok Marketing",
    "Digital Marketing",
    "Email Marketing",
    "Marketing Strategy",
    "Brand Management",
    "Influencer Marketing",
    "Community Management",
    "Paid Advertising",
    "Google Ads",
    "Facebook Ads",
    "Growth Hacking",
    
    // SEO & Analytics
    "SEO",
    "SEM",
    "Google Analytics",
    "Keyword Research",
    "Link Building",
    "Technical SEO",
    "On-Page SEO",
    "Off-Page SEO",
    "Data Analytics",
    "Business Analytics",
    "Google Search Console",
    
    // E-Commerce
    "E-Commerce Development",
    "Shopify",
    "WooCommerce",
    "Magento",
    "E-Commerce Design",
    "Product Listing",
    "Inventory Management",
    
    // CMS & Web Platforms
    "WordPress",
    "Drupal",
    "Joomla",
    "Wix",
    "Squarespace",
    "Webflow",
    "Static Site Generators",
    "Hugo",
    
    // Cloud & DevOps
    "AWS",
    "Google Cloud",
    "Azure",
    "Docker",
    "Kubernetes",
    "DevOps",
    "CI/CD",
    "GitHub",
    "GitLab",
    "Server Management",
    "Linux",
    "Cloud Architecture",
    
    // Data Science & AI
    "Data Science",
    "Machine Learning",
    "AI",
    "Python Data Science",
    "R Programming",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "TensorFlow",
    "Data Visualization",
    "Statistical Analysis",
    "Predictive Modeling",
    
    // Business & Strategy
    "Business Strategy",
    "Project Management",
    "Agile",
    "Scrum",
    "Consulting",
    "Business Analysis",
    "Financial Modeling",
    "Excel",
    "Google Sheets",
    "Data Visualization",
    "Tableau",
    "Power BI",
    
    // Other Technical Skills
    "API Integration",
    "System Architecture",
    "Software Development",
    "Code Review",
    "QA Testing",
    "Automation Testing",
    "Manual Testing",
    "Bug Tracking",
    "Version Control",
    "Git",
    "Debugging",
    "Performance Optimization",
    "Security",
    "Cybersecurity",
    "Blockchain",
    "Smart Contracts",
    "Solidity",
    
    // Soft Skills & General
    "Communication",
    "Presentation",
    "Project Coordination",
    "Time Management",
    "Problem Solving",
    "Critical Thinking",
    "Teamwork",
    "Leadership",
    "Customer Service",
    "Negotiation",
    "Research Skills",
    "Documentation"
  ];

  try {
    // Clear existing skills first
    await prisma.skill.deleteMany({});
    
    // Insert all skills
    await prisma.skill.createMany({
      data: skills.map(name => ({ name }))
    });
    
    console.log(`✓ ${skills.length} skills inserted successfully!`);
  } catch (error) {
    console.error("Error inserting skills:", error);
  }

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
