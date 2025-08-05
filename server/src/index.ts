
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createTaskInputSchema, 
  updateTaskInputSchema, 
  deleteTaskInputSchema,
  getTaskInputSchema,
  createAttachmentInputSchema,
  getAttachmentsByTaskInputSchema,
  deleteAttachmentInputSchema 
} from './schema';

// Import handlers
import { createTask } from './handlers/create_task';
import { getTasks } from './handlers/get_tasks';
import { getTask } from './handlers/get_task';
import { updateTask } from './handlers/update_task';
import { deleteTask } from './handlers/delete_task';
import { createAttachment } from './handlers/create_attachment';
import { getAttachmentsByTask } from './handlers/get_attachments_by_task';
import { deleteAttachment } from './handlers/delete_attachment';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Task operations
  createTask: publicProcedure
    .input(createTaskInputSchema)
    .mutation(({ input }) => createTask(input)),
  
  getTasks: publicProcedure
    .query(() => getTasks()),
  
  getTask: publicProcedure
    .input(getTaskInputSchema)
    .query(({ input }) => getTask(input)),
  
  updateTask: publicProcedure
    .input(updateTaskInputSchema)
    .mutation(({ input }) => updateTask(input)),
  
  deleteTask: publicProcedure
    .input(deleteTaskInputSchema)
    .mutation(({ input }) => deleteTask(input)),
  
  // Attachment operations
  createAttachment: publicProcedure
    .input(createAttachmentInputSchema)
    .mutation(({ input }) => createAttachment(input)),
  
  getAttachmentsByTask: publicProcedure
    .input(getAttachmentsByTaskInputSchema)
    .query(({ input }) => getAttachmentsByTask(input)),
  
  deleteAttachment: publicProcedure
    .input(deleteAttachmentInputSchema)
    .mutation(({ input }) => deleteAttachment(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
