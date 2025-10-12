<template>
  <UPageHero
    title="Connect. Collaborate. Succeed."
    description="A freelance platform tailored by UiTM for UiTM."
    orientation="horizontal"
  >
    <img
      src="https://ipsis.uitm.edu.my/images/landingicon/graduationexploreus.jpg"
      class="rounded-lg shadow-2xl ring ring-default"
      alt=""
    />
  </UPageHero>
  <UPageSection 
   title="Empowering UiTM Students to Freelance Smartly"
    description="SiswaGig offers AI-driven job matching, location-based search, and secure collaboration — designed exclusively for UiTM students."
    :features="features"
  />
  <UPageSection
    title="Explore Opportunities"
    description="Find freelance jobs or discover talented UiTM students."  
  >
  <UBlogPosts :posts="jobs"/>
  <UPageGrid>
      <UPageCard
        v-for="(freelancer, i) in freelancers"
        :key="i"
        :title="freelancer.name"
        :description="freelancer.bio"
        spotlight
        reverse
        variant="ghost"
      >
        <img :src="freelancer.image" class="rounded-full w-40 h-40 mx-auto object-cover" />
      </UPageCard>
    </UPageGrid>
</UPageSection>

  <UPageCTA
  title="Start Your Freelance Journey Today"
  description="Join SiswaGig and turn your skills into income."
  align="center"
  :links="[
    { label: 'Get Started', to: '/auth', icon: 'i-lucide-user-plus' },
    { label: 'Explore Now', to: '/explore', variant: 'subtle' }
  ]"
/>

</template>

<script lang="ts" setup>
const features = ref([
  {
    title: 'Smart Job Matching',
    description: 'AI recommends freelance jobs that fit your skills, preferences, and location for better matching.',
    icon: 'i-lucide-brain',
    to: '/features/ai-matching'
  },
  {
    title: 'Location-Based Projects',
    description: 'Find nearby projects using geolocation to collaborate easily with clients in your area.',
    icon: 'i-lucide-map-pin',
    to: '/features/location'
  },
  {
    title: 'Secure Collaboration',
    description: 'Built-in chat and project management tools help students and clients work together seamlessly.',
    icon: 'i-lucide-message-circle',
    to: '/features/chat'
  }
])
const jobs = ref([
  {
    title: "Design a UiTM Event Poster",
    description:
      "Looking for a creative student to design an A3 poster for an upcoming UiTM event.",
    date: '2025-08-22',
    image: 'https://picsum.photos/400/300'
  },
  {
    title: "Build a Faculty Blog Website",
    description:
      "Need a frontend developer to create a simple Nuxt site for our faculty news.",
    date: '2025-08-21',
    image: 'https://picsum.photos/400/300'
  },
  {
    title: "Proofread Final Year Project Report",
    description:
      "Seeking a detail-oriented student to proofread grammar and formatting for a 50-page FYP report.",
    date: '2025-09-01',
    image: 'https://picsum.photos/400/300'
  }
  ]);

  const freelancers = [
  {
    name: "Aina Rahman",
    skill: "Graphic Designer",
    bio: "Experienced in poster and banner design. Canva, Figma, Photoshop.",
    location: "UiTM Puncak Alam",
    image:
      "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
  },
  {
    name: "Hakim Aiman",
    skill: "Web Developer",
    bio: "Frontend dev familiar with Nuxt, Tailwind, and Firebase.",
    location: "UiTM Shah Alam",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D-focus-photography-of-woman-outdoor-during-day-rDEOVtE7vOs",
  },
];


</script>
