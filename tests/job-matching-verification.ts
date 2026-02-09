/**
 * Practical verification of job matching algorithm
 * Simulates real job recommendation scenarios
 * Run with: npx tsx tests/job-matching-verification.ts
 */

import {
  calculateWeightedSimilarity,
  calculateKeywordSimilarity,
  rankJobs
} from '../server/utils/ml-algorithms'

console.log('\n╔═══════════════════════════════════════════════════════════════╗')
console.log('║       JOB MATCHING ALGORITHM - PRACTICAL VERIFICATION        ║')
console.log('╚═══════════════════════════════════════════════════════════════╝\n')

// ==========================================
// SCENARIO 1: Match Full-Stack Developer
// ==========================================
console.log('┌─────────────────────────────────────────────────────────────┐')
console.log('│ SCENARIO 1: Full-Stack Developer Job Matching               │')
console.log('└─────────────────────────────────────────────────────────────┘')

const fullStackDev = {
  skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'REST API'],
  bio: 'Experienced full-stack developer with 4 years building web applications. Specialized in React for frontend and Node.js for backend development.'
}

const jobs = [
  {
    job_id: 1,
    title: 'Full-Stack Web Developer Needed',
    description: 'Build a modern e-commerce website with React frontend and Node.js backend. Must have experience with MongoDB and REST APIs.',
    requiredSkills: 'React, Node.js, MongoDB, Express.js'
  },
  {
    job_id: 2,
    title: 'Mobile App Developer',
    description: 'Create an iOS and Android mobile application using React Native. Experience with mobile development required.',
    requiredSkills: 'React Native, Swift, Kotlin, Firebase'
  },
  {
    job_id: 3,
    title: 'Frontend Developer for Dashboard',
    description: 'Design and implement an admin dashboard using React. TypeScript experience is a plus.',
    requiredSkills: 'React, TypeScript, CSS, HTML'
  },
  {
    job_id: 4,
    title: 'Backend Python Developer',
    description: 'Build REST APIs using Django and PostgreSQL for a data analytics platform.',
    requiredSkills: 'Python, Django, PostgreSQL, Docker'
  },
  {
    job_id: 5,
    title: 'UI/UX Designer',
    description: 'Create beautiful user interfaces using Figma and Adobe XD. Prototype and wireframe designs.',
    requiredSkills: 'Figma, Adobe XD, Photoshop, UI Design'
  }
]

console.log('\n📋 USER PROFILE:')
console.log(`   Skills: ${fullStackDev.skills.join(', ')}`)
console.log(`   Bio: ${fullStackDev.bio.substring(0, 80)}...`)

console.log('\n📊 JOB RANKINGS (Higher = Better Match):')
console.log('─'.repeat(60))

// Calculate scores for each job
const rankings = jobs.map(job => {
  const requiredSkills = job.requiredSkills.split(',').map(s => s.trim())
  const score = calculateWeightedSimilarity(
    fullStackDev.skills,
    fullStackDev.bio,
    requiredSkills,
    job.title,
    job.description
  )
  return { ...job, score, requiredSkills }
})

// Sort by score
rankings.sort((a, b) => b.score - a.score)

rankings.forEach((job, index) => {
  const bar = '█'.repeat(Math.round(job.score * 30))
  const scorePercent = (job.score * 100).toFixed(1)
  console.log(`\n   #${index + 1} ${job.title}`)
  console.log(`       Required: ${job.requiredSkills.join(', ')}`)
  console.log(`       Score: ${scorePercent}% ${bar}`)
})

// Verify ranking logic
console.log('\n✅ VERIFICATION CHECK:')
const topJob = rankings[0]
const bottomJob = rankings[rankings.length - 1]

const isCorrect = topJob.title.toLowerCase().includes('full-stack') || 
                  topJob.requiredSkills.some((s: string) => fullStackDev.skills.includes(s))

console.log(`   - Top match "${topJob.title}" (${(topJob.score * 100).toFixed(1)}%) should have relevant skills`)
console.log(`   - Bottom match "${bottomJob.title}" (${(bottomJob.score * 100).toFixed(1)}%) should be unrelated`)
console.log(`   - Algorithm correctly identified: ${isCorrect ? '✅ YES' : '❌ NO'}`)

// ==========================================
// SCENARIO 2: Match Designer
// ==========================================
console.log('\n\n┌─────────────────────────────────────────────────────────────┐')
console.log('│ SCENARIO 2: UI/UX Designer Job Matching                      │')
console.log('└─────────────────────────────────────────────────────────────┘')

const designer = {
  skills: ['Figma', 'Adobe XD', 'Photoshop', 'UI/UX Design', 'Prototyping'],
  bio: 'Creative UI/UX designer with expertise in user interface design and prototyping. Experienced with Figma and Adobe Creative Suite.'
}

console.log('\n📋 USER PROFILE:')
console.log(`   Skills: ${designer.skills.join(', ')}`)
console.log(`   Bio: ${designer.bio.substring(0, 80)}...`)

console.log('\n📊 JOB RANKINGS:')
console.log('─'.repeat(60))

const designerRankings = jobs.map(job => {
  const requiredSkills = job.requiredSkills.split(',').map(s => s.trim())
  const score = calculateWeightedSimilarity(
    designer.skills,
    designer.bio,
    requiredSkills,
    job.title,
    job.description
  )
  return { ...job, score }
})

designerRankings.sort((a, b) => b.score - a.score)

designerRankings.forEach((job, index) => {
  const bar = '█'.repeat(Math.round(job.score * 30))
  const scorePercent = (job.score * 100).toFixed(1)
  console.log(`\n   #${index + 1} ${job.title}`)
  console.log(`       Score: ${scorePercent}% ${bar}`)
})

// Verify designer matching
const topDesignJob = designerRankings[0]
const isDesignCorrect = topDesignJob.title.toLowerCase().includes('design') || 
                        topDesignJob.title.toLowerCase().includes('ui')

console.log('\n✅ VERIFICATION CHECK:')
console.log(`   - Top match for designer is "${topDesignJob.title}"`)
console.log(`   - Algorithm correctly identifies design job: ${isDesignCorrect ? '✅ YES' : '❌ NO'}`)

// ==========================================
// KEYWORD SIMILARITY BREAKDOWN
// ==========================================
console.log('\n\n┌─────────────────────────────────────────────────────────────┐')
console.log('│ KEYWORD SIMILARITY - DETAILED BREAKDOWN                      │')
console.log('└─────────────────────────────────────────────────────────────┘')

const testCases = [
  { user: ['React', 'Node.js', 'MongoDB'], job: ['React', 'Node.js', 'MongoDB'], expected: 'High (100%)' },
  { user: ['React', 'Vue', 'Angular'], job: ['React', 'Svelte', 'Next.js'], expected: 'Medium (partial)' },
  { user: ['Python', 'Django'], job: ['Java', 'Spring'], expected: 'Low (related dev tools)' },
  { user: ['Figma', 'Photoshop'], job: ['React', 'Node.js'], expected: 'Very Low (different fields)' },
]

testCases.forEach((tc, i) => {
  const sim = calculateKeywordSimilarity(tc.user, tc.job)
  console.log(`\n   Test ${i + 1}: ${tc.user.join(', ')} vs ${tc.job.join(', ')}`)
  console.log(`   Expected: ${tc.expected}`)
  console.log(`   Actual: ${(sim * 100).toFixed(1)}%`)
})

// ==========================================
// ALGORITHM FORMULA DEMONSTRATION
// ==========================================
console.log('\n\n┌─────────────────────────────────────────────────────────────┐')
console.log('│ ALGORITHM FORMULA - HOW IT WORKS                             │')
console.log('└─────────────────────────────────────────────────────────────┘')

console.log(`
   The job matching score is calculated as:

   ┌──────────────────────────────────────────────────────────────┐
   │  Match Score = (Skill × 0.4) + (Bio × 0.25) +                │
   │                (Title × 0.15) + (Distance × 0.2)             │
   └──────────────────────────────────────────────────────────────┘

   Where:
   • Skill Match (40%): Uses keyword matching + TF-IDF
     - Exact matches = 1.0 point
     - Partial matches = 0.5 point
     - Related skills = 0.3 point

   • Bio Match (25%): TF-IDF + Cosine Similarity
     - Compares user bio with job title + description

   • Title Match (15%): TF-IDF + Cosine Similarity
     - Compares user skills with job title

   • Distance Match (20%): Geolocation scoring
     - < 25km = Full score
     - 25-50km = Partial score
     - > 50km = Lower score
`)

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('                  VERIFICATION COMPLETE                        ')
console.log('═══════════════════════════════════════════════════════════════\n')
