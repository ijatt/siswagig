/**
 * Test file to verify ML algorithm accuracy
 * Run with: npx tsx tests/ml-algorithm.test.ts
 */

import {
  tokenize,
  calculateTermFrequency,
  calculateIDF,
  calculateTFIDF,
  cosineSimilarity,
  textSimilarity,
  calculateWeightedSimilarity,
  calculateKeywordSimilarity
} from '../server/utils/ml-algorithms'

// Test helper
function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✅ ${name}`)
  } catch (error: any) {
    console.log(`❌ ${name}: ${error.message}`)
  }
}

function assertEqual(actual: any, expected: any, tolerance = 0.001) {
  if (typeof actual === 'number' && typeof expected === 'number') {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`Expected ${expected}, got ${actual}`)
    }
  } else if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

console.log('\n========================================')
console.log('ML ALGORITHM VERIFICATION TESTS')
console.log('========================================\n')

// ============================================
// 1. TOKENIZATION TESTS
// ============================================
console.log('1. TOKENIZATION TESTS')
console.log('--------------------')

test('Tokenize removes special characters', () => {
  const result = tokenize("Hello, World! How are you?")
  assertEqual(result, ['hello', 'world', 'how', 'are', 'you'])
})

test('Tokenize handles multiple spaces', () => {
  const result = tokenize("React   Node.js   MongoDB")
  assertEqual(result, ['react', 'nodejs', 'mongodb'])
})

// ============================================
// 2. TERM FREQUENCY TESTS
// ============================================
console.log('\n2. TERM FREQUENCY TESTS')
console.log('------------------------')

test('TF calculates correct frequencies', () => {
  const tokens = ['react', 'react', 'node', 'mongodb']
  const tf = calculateTermFrequency(tokens)
  
  // react appears 2/4 = 0.5
  assertEqual(tf.get('react'), 0.5)
  // node appears 1/4 = 0.25
  assertEqual(tf.get('node'), 0.25)
})

// ============================================
// 3. IDF TESTS
// ============================================
console.log('\n3. IDF TESTS')
console.log('------------')

test('IDF calculates correct values', () => {
  const docs = [
    ['react', 'javascript'],
    ['react', 'node'],
    ['python', 'django']
  ]
  const idf = calculateIDF(docs)
  
  // 'react' appears in 2 of 3 docs: log(3/2) ≈ 0.405
  const reactIdf = idf.get('react') || 0
  assertEqual(reactIdf, Math.log(3/2), 0.01)
  
  // 'python' appears in 1 of 3 docs: log(3/1) ≈ 1.099
  const pythonIdf = idf.get('python') || 0
  assertEqual(pythonIdf, Math.log(3/1), 0.01)
})

// ============================================
// 4. COSINE SIMILARITY TESTS
// ============================================
console.log('\n4. COSINE SIMILARITY TESTS')
console.log('---------------------------')

test('Identical vectors have similarity 1.0', () => {
  const v1 = new Map([['a', 1], ['b', 2]])
  const v2 = new Map([['a', 1], ['b', 2]])
  const similarity = cosineSimilarity(v1, v2)
  assertEqual(similarity, 1.0)
})

test('Orthogonal vectors have similarity 0.0', () => {
  const v1 = new Map([['a', 1], ['b', 0]])
  const v2 = new Map([['a', 0], ['b', 1]])
  const similarity = cosineSimilarity(v1, v2)
  assertEqual(similarity, 0.0)
})

test('Known vectors produce correct similarity', () => {
  // v1 = [3, 4], v2 = [4, 3]
  // dot = 3*4 + 4*3 = 24
  // |v1| = sqrt(9+16) = 5, |v2| = sqrt(16+9) = 5
  // similarity = 24 / 25 = 0.96
  const v1 = new Map([['x', 3], ['y', 4]])
  const v2 = new Map([['x', 4], ['y', 3]])
  const similarity = cosineSimilarity(v1, v2)
  assertEqual(similarity, 0.96)
})

// ============================================
// 5. TEXT SIMILARITY TESTS
// ============================================
console.log('\n5. TEXT SIMILARITY TESTS')
console.log('-------------------------')

test('Similar texts have high similarity', () => {
  const text1 = "React JavaScript frontend development"
  const text2 = "JavaScript React web frontend"
  const similarity = textSimilarity(text1, text2)
  console.log(`   Similarity: ${(similarity * 100).toFixed(1)}%`)
  if (similarity < 0.5) throw new Error('Expected similarity > 50%')
})

test('Different texts have low similarity', () => {
  const text1 = "React JavaScript frontend web"
  const text2 = "Python Django backend server"
  const similarity = textSimilarity(text1, text2)
  console.log(`   Similarity: ${(similarity * 100).toFixed(1)}%`)
  if (similarity > 0.3) throw new Error('Expected similarity < 30%')
})

// ============================================
// 6. KEYWORD SIMILARITY TESTS
// ============================================
console.log('\n6. KEYWORD SIMILARITY TESTS')
console.log('----------------------------')

test('Exact skill match gives high score', () => {
  const userSkills = ['React', 'Node.js', 'MongoDB']
  const jobSkills = ['React', 'Node.js', 'MongoDB']
  const similarity = calculateKeywordSimilarity(userSkills, jobSkills)
  assertEqual(similarity, 1.0) // Perfect match
})

test('Partial skill match gives partial score', () => {
  const userSkills = ['React', 'Node.js', 'MongoDB']
  const jobSkills = ['React', 'Vue.js', 'PostgreSQL']
  const similarity = calculateKeywordSimilarity(userSkills, jobSkills)
  console.log(`   Similarity: ${(similarity * 100).toFixed(1)}%`)
  // Should be around 33% (1 of 3 exact match)
  if (similarity < 0.2 || similarity > 0.6) throw new Error('Expected similarity 20-60%')
})

test('Related skills get partial credit', () => {
  const userSkills = ['JavaScript', 'TypeScript']
  const jobSkills = ['React', 'Vue']  // Related via development category
  const similarity = calculateKeywordSimilarity(userSkills, jobSkills)
  console.log(`   Similarity: ${(similarity * 100).toFixed(1)}%`)
  // Should have some similarity due to related skills
})

// ============================================
// 7. WEIGHTED SIMILARITY TESTS
// ============================================
console.log('\n7. WEIGHTED SIMILARITY TESTS')
console.log('-----------------------------')

test('Perfect match scenario', () => {
  const userSkills = ['React', 'Node.js', 'MongoDB']
  const userBio = 'Full-stack developer experienced in React and Node.js development'
  const jobSkills = ['React', 'Node.js', 'MongoDB']
  const jobTitle = 'Full-stack React Developer'
  const jobDesc = 'Looking for a React and Node.js developer to build web applications'
  
  const score = calculateWeightedSimilarity(userSkills, userBio, jobSkills, jobTitle, jobDesc)
  console.log(`   Match Score: ${(score * 100).toFixed(1)}%`)
  if (score < 0.6) throw new Error('Expected high score for perfect match')
})

test('Mismatch scenario', () => {
  const userSkills = ['Python', 'Django', 'PostgreSQL']
  const userBio = 'Backend Python developer specializing in Django REST APIs'
  const jobSkills = ['React', 'Vue', 'Angular']
  const jobTitle = 'Frontend Developer'
  const jobDesc = 'Looking for a frontend developer with React experience'
  
  const score = calculateWeightedSimilarity(userSkills, userBio, jobSkills, jobTitle, jobDesc)
  console.log(`   Match Score: ${(score * 100).toFixed(1)}%`)
  if (score > 0.4) throw new Error('Expected low score for mismatch')
})

// ============================================
// 8. REAL-WORLD SCENARIOS
// ============================================
console.log('\n8. REAL-WORLD SCENARIO TESTS')
console.log('------------------------------')

test('Web Developer matching Website job', () => {
  const userSkills = ['HTML', 'CSS', 'JavaScript', 'React']
  const userBio = 'Frontend web developer with 3 years experience building responsive websites'
  const jobSkills = ['HTML', 'CSS', 'JavaScript']
  const jobTitle = 'Build Company Website'
  const jobDesc = 'Need a developer to create a responsive company website with modern design'
  
  const score = calculateWeightedSimilarity(userSkills, userBio, jobSkills, jobTitle, jobDesc)
  console.log(`   Match Score: ${(score * 100).toFixed(1)}%`)
  if (score < 0.4) throw new Error('Expected good match')
})

test('Mobile Developer should not match Web job well', () => {
  const userSkills = ['Swift', 'Kotlin', 'React Native']
  const userBio = 'Mobile app developer focused on iOS and Android applications'
  const jobSkills = ['PHP', 'MySQL', 'Laravel']
  const jobTitle = 'Backend PHP Developer'
  const jobDesc = 'Looking for a PHP developer to build REST APIs with Laravel'
  
  const score = calculateWeightedSimilarity(userSkills, userBio, jobSkills, jobTitle, jobDesc)
  console.log(`   Match Score: ${(score * 100).toFixed(1)}%`)
  if (score > 0.35) throw new Error('Expected poor match')
})

console.log('\n========================================')
console.log('ALL TESTS COMPLETED')
console.log('========================================\n')
