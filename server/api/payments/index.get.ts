import prisma from '~~/server/db/prisma'
import { verifyToken } from '~~/server/utils/verify-token'

// Get all payments for the authenticated user
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const userId = await checkAccessToken(event);

    if (!userId)
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    const query = getQuery(event)
    const status = query.status as string | undefined
    const role = query.role as 'client' | 'freelancer' | undefined

    // Build where clause
    const whereClause: any = {
      OR: [
        { client_id: userId },
        { freelancer_id: userId }
      ]
    }

    // Filter by role if specified
    if (role === 'client') {
      whereClause.OR = undefined
      whereClause.client_id = userId
    } else if (role === 'freelancer') {
      whereClause.OR = undefined
      whereClause.freelancer_id = userId
    }

    // Filter by status if specified
    if (status) {
      whereClause.status = status
    }

    // Get payments
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        application: {
          include: {
            job: {
              select: {
                job_id: true,
                title: true,
                status: true,
                image_url: true,
                category: true
              }
            }
          }
        },
        client: {
          select: {
            user_id: true,
            name: true,
            image_url: true
          }
        },
        freelancer: {
          select: {
            user_id: true,
            name: true,
            image_url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Calculate totals
    const totals = {
      total_earned: 0,
      total_pending: 0,
      total_held: 0,
      total_paid: 0
    }

    const formattedPayments = payments.map(payment => {
      // Calculate totals based on user role in this payment
      if (payment.freelancer_id === userId) {
        if (payment.status === 'released') {
          totals.total_earned += payment.freelancer_amount
        } else if (payment.status === 'paid') {
          totals.total_held += payment.freelancer_amount
        } else if (payment.status === 'pending') {
          totals.total_pending += payment.freelancer_amount
        }
      }
      
      if (payment.client_id === userId) {
        if (payment.status === 'paid') {
          // For clients, show total held in escrow
          totals.total_held += payment.amount
        } else if (payment.status === 'pending') {
          totals.total_pending += payment.amount
        } else if (payment.status === 'released') {
          totals.total_paid += payment.amount
        }
      }

      return {
        payment_id: payment.payment_id,
        application_id: payment.application_id,
        amount: payment.amount / 100,
        platform_fee: payment.platform_fee / 100,
        freelancer_amount: payment.freelancer_amount / 100,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        paid_at: payment.paid_at,
        released_at: payment.released_at,
        refunded_at: payment.refunded_at,
        created_at: payment.created_at,
        job: payment.application.job,
        client: payment.client,
        freelancer: payment.freelancer,
        application_status: payment.application.status,
        is_client: payment.client_id === userId,
        is_freelancer: payment.freelancer_id === userId
      }
    })

    return {
      success: true,
      payments: formattedPayments,
      totals: {
        total_earned: totals.total_earned / 100,
        total_pending: totals.total_pending / 100,
        total_held: totals.total_held / 100,
        total_paid: totals.total_paid / 100
      },
      count: payments.length
    }
  } catch (error: any) {
    console.error('Get payments error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to get payments'
    })
  }
})
