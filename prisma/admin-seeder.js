// Admin Seeder Script
// Run with: node prisma/admin-seeder.js

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting admin user creation...')

  // Hash password
  const hashedPassword = await bcrypt.hash('password', 10)

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@siswagig.com' },
    update: {
      role: 'admin',
      password: hashedPassword
    },
    create: {
      name: 'System Administrator',
      email: 'admin@siswagig.com',
      password: hashedPassword,
      role: 'admin',
      bio: 'System Administrator for SiswaGig platform',
      profile_completed: true
    }
  })

  console.log('✅ Admin user created/updated successfully!')
  console.log('📧 Email: admin@siswagig.com')
  console.log('🔑 Password: password')
  console.log('👤 User ID:', admin.user_id)
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
