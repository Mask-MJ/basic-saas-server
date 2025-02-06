import { PrismaClient } from '@prisma/client';
import pagination from 'prisma-extension-pagination';
import { Logger } from '@nestjs/common';
// pagination for all models
export const extendedPrismaClient = new PrismaClient()
  .$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = performance.now();
          const result = await query(args);
          const end = performance.now();
          const time = end - start;
          if (time > 1000) {
            Logger.warn(
              `${model}.${operation}(${JSON.stringify(args)}) => ${time}ms`,
            );
          }
          if (operation === 'delete') {
            Logger.log(
              `${model}.${operation}(${JSON.stringify(args)}) => ${time}ms`,
            );
          }
          return result;
        },
      },
    },
  })
  .$extends(pagination());

export type ExtendedPrismaClient = typeof extendedPrismaClient;
