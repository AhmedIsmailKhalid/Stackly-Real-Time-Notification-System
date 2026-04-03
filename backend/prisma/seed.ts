import { PrismaClient, NotificationType, NotificationPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// ─────────────────────────────────────────
// DEMO USERS
// ─────────────────────────────────────────

const DEMO_USERS = [
  {
    email: 'demo@stackly.dev',
    username: 'demo_user',
    displayName: 'Demo User',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    password: 'demo1234',
  },
  {
    email: 'sarah@stackly.dev',
    username: 'sarah_chen',
    displayName: 'Sarah Chen',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    password: 'demo1234',
  },
  {
    email: 'alex@stackly.dev',
    username: 'alex_rivera',
    displayName: 'Alex Rivera',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    password: 'demo1234',
  },
];

// ─────────────────────────────────────────
// DEMO NOTIFICATIONS
// ─────────────────────────────────────────

const buildNotifications = (userId: string) => [
  {
    userId,
    type: NotificationType.MENTION,
    priority: NotificationPriority.HIGH,
    title: 'You were mentioned',
    message: 'Sarah Chen mentioned you in "Q4 Product Roadmap"',
    actorName: 'Sarah Chen',
    actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    actionUrl: '/docs/q4-roadmap',
    read: false,
  },
  {
    userId,
    type: NotificationType.COMMENT,
    priority: NotificationPriority.MEDIUM,
    title: 'New comment on your post',
    message: 'Alex Rivera commented on "API Design Patterns"',
    actorName: 'Alex Rivera',
    actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    actionUrl: '/posts/api-design',
    read: false,
  },
  {
    userId,
    type: NotificationType.SYSTEM_ALERT,
    priority: NotificationPriority.HIGH,
    title: 'Deployment successful',
    message: 'stackly-frontend v2.4.1 deployed to production',
    actorName: 'Stackly CI',
    actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
    actionUrl: '/deployments',
    read: false,
  },
  {
    userId,
    type: NotificationType.ASSIGNMENT,
    priority: NotificationPriority.MEDIUM,
    title: 'Task assigned to you',
    message: 'Marcus Johnson assigned "Fix notification race condition" to you',
    actorName: 'Marcus Johnson',
    actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    actionUrl: '/tasks',
    read: false,
  },
  {
    userId,
    type: NotificationType.TEAM_ACTIVITY,
    priority: NotificationPriority.LOW,
    title: 'New team member',
    message: 'Jordan Lee joined the Engineering workspace',
    actorName: 'Jordan Lee',
    actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    actionUrl: '/team',
    read: true,
    readAt: new Date(),
  },
  {
    userId,
    type: NotificationType.MENTION,
    priority: NotificationPriority.HIGH,
    title: 'You were mentioned again',
    message: 'Alex Rivera mentioned you in "Sprint Retrospective Notes"',
    actorName: 'Alex Rivera',
    actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    actionUrl: '/docs/sprint-retro',
    read: true,
    readAt: new Date(),
  },
  {
    userId,
    type: NotificationType.SYSTEM_ALERT,
    priority: NotificationPriority.LOW,
    title: 'Scheduled maintenance',
    message: 'Stackly will undergo maintenance on Sunday 2am–4am UTC',
    actorName: 'Stackly System',
    actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system2',
    actionUrl: '/status',
    read: true,
    readAt: new Date(),
  },
  {
    userId,
    type: NotificationType.COMMENT,
    priority: NotificationPriority.MEDIUM,
    title: 'New comment on your task',
    message: 'Sarah Chen left feedback on "Implement WebSocket reconnection"',
    actorName: 'Sarah Chen',
    actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    actionUrl: '/tasks/ws-reconnection',
    read: false,
  },
];

// ─────────────────────────────────────────
// SEED
// ─────────────────────────────────────────

const seed = async (): Promise<void> => {
  console.log('[seed] starting...');

  // Clean existing data
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.user.deleteMany();

  console.log('[seed] cleared existing data');

  // Create users
  const createdUsers = await Promise.all(
    DEMO_USERS.map(async (u) => {
      const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
      return prisma.user.create({
        data: {
          email: u.email,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          passwordHash,
        },
      });
    })
  );

  console.log(`[seed] created ${createdUsers.length} users`);

  // Create notifications for demo user only
  const demoUser = createdUsers[0];

  await prisma.notification.createMany({
    data: buildNotifications(demoUser.id),
  });

  console.log(`[seed] created notifications for demo user`);

  // Create default preferences for all users
  const allTypes = Object.values(NotificationType);

  await Promise.all(
    createdUsers.map((user) =>
      prisma.notificationPreference.createMany({
        data: allTypes.map((type) => ({
          userId: user.id,
          type,
          inApp: true,
          email: false,
        })),
        skipDuplicates: true,
      })
    )
  );

  console.log(`[seed] created notification preferences for all users`);

  console.log('[seed] completed ✅');
  console.log('');
  console.log('Demo credentials:');
  console.log('  email:    demo@stackly.dev');
  console.log('  password: demo1234');
};

seed()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });