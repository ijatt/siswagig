import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const { id } = event.context.params as { id: string }
    const userId = Number(id)

    const body = await readBody<{ 
      name?: string
      bio?: string
      location?: string
      image_url?: string
      skills?: number[]
      bank_name?: string | null
      bank_account_no?: string | null
      bank_account_holder?: string | null
    }>(event)

    if (!body) return createError({ statusCode: 400, statusMessage: 'No data provided' })

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.location !== undefined) updateData.location = body.location
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.bank_name !== undefined) updateData.bank_name = body.bank_name
    if (body.bank_account_no !== undefined) updateData.bank_account_no = body.bank_account_no
    if (body.bank_account_holder !== undefined) updateData.bank_account_holder = body.bank_account_holder

    // Update user
    const user = await prisma.user.update({
      where: { user_id: userId },
      data: updateData,
    })

    // Update skills relation if provided
    if (Array.isArray(body.skills)) {
      // simple approach: remove existing and add provided
      await prisma.userSkill.deleteMany({ where: { user_id: userId } })
      const connect = body.skills.map((sid) => ({ skill_id: sid, user_id: userId }))
      if (connect.length) {
        await prisma.userSkill.createMany({ data: connect })
      }
    }

    return { success: true, user }
  } catch (err) {
    return createError({ statusCode: 500, statusMessage: 'Unable to update user' })
  }
})
