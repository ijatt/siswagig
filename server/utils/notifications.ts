import { PrismaClient } from '@prisma/client'
import { getSocketServer } from '../plugins/socket.io.server'

export interface CreateNotificationParams {
  userId: number
  type: 'message' | 'application' | 'status_update' | 'system'
  title: string
  message: string
  link?: string
  relatedUserId?: number
  relatedJobId?: number
  relatedApplicationId?: number
}

export async function createNotification(params: CreateNotificationParams) {
  const prisma = new PrismaClient()
  
  try {
    const notification = await prisma.notification.create({
      data: {
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        related_user_id: params.relatedUserId,
        related_job_id: params.relatedJobId,
        related_application_id: params.relatedApplicationId
      }
    })

    // Emit real-time notification via Socket.io
    const socketServer = getSocketServer()
    if (socketServer) {
      socketServer.to(`user_${params.userId}`).emit('new-notification', notification)
      console.log(`Emitted notification to user_${params.userId}:`, notification.title)
    }

    return notification
  } catch (err) {
    console.error('Error creating notification:', err)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

// Helper functions for common notification types
export function createMessageNotification(
  recipientId: number,
  senderName: string,
  conversationId: number
) {
  return createNotification({
    userId: recipientId,
    type: 'message',
    title: 'New Message',
    message: `${senderName} sent you a message`,
    link: `/inbox?conversationId=${conversationId}`
  })
}

export function createApplicationNotification(
  clientId: number,
  freelancerName: string,
  jobTitle: string,
  jobId: number,
  applicationId: number
) {
  return createNotification({
    userId: clientId,
    type: 'application',
    title: 'New Application',
    message: `${freelancerName} applied to "${jobTitle}"`,
    link: `/applications/${applicationId}`,
    relatedJobId: jobId,
    relatedApplicationId: applicationId
  })
}

export function createStatusNotification(
  freelancerId: number,
  status: string,
  jobTitle: string,
  jobId: number,
  applicationId: number
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    'Interview': {
      title: 'Interview Scheduled',
      message: `You've been invited to interview for "${jobTitle}"`
    },
    'Hired': {
      title: '🎉 You\'re Hired!',
      message: `Congratulations! You've been hired for "${jobTitle}"`
    },
    'Rejected': {
      title: 'Application Update',
      message: `Your application for "${jobTitle}" was not selected`
    },
    'In Progress': {
      title: 'Work Started',
      message: `Work has begun on "${jobTitle}"`
    },
    'Submitted': {
      title: 'Work Submitted',
      message: `Work has been submitted for "${jobTitle}"`
    },
    'Completed': {
      title: '✅ Project Completed',
      message: `"${jobTitle}" has been marked as completed!`
    },
    'Revision': {
      title: 'Revision Requested',
      message: `The client has requested revisions for "${jobTitle}"`
    }
  }

  const statusInfo = statusMessages[status] || {
    title: 'Status Update',
    message: `Your application status for "${jobTitle}" has changed to ${status}`
  }

  return createNotification({
    userId: freelancerId,
    type: 'status_update',
    title: statusInfo.title,
    message: statusInfo.message,
    link: `/applications/my-jobs`,
    relatedJobId: jobId,
    relatedApplicationId: applicationId
  })
}

// Notification for client when freelancer submits work
export function createWorkSubmittedNotification(
  clientId: number,
  freelancerName: string,
  jobTitle: string,
  applicationId: number
) {
  return createNotification({
    userId: clientId,
    type: 'status_update',
    title: 'Work Submitted',
    message: `${freelancerName} has submitted work for "${jobTitle}"`,
    link: `/applications/${applicationId}`,
    relatedApplicationId: applicationId
  })
}
