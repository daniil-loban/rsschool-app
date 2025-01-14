import { BAD_REQUEST } from 'http-status-codes';
import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { Stage } from '../../models';
import { createGetRoute, createPostRoute, createPutRoute } from '../common';
import { adminGuard, guard } from '../guards';
import { setResponse } from '../utils';

const validateStageId = async (ctx: Router.RouterContext, next: any) => {
  const stageId = Number(ctx.params.id);
  if (isNaN(stageId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Stage Id]');
    return;
  }
  ctx.params.id = stageId;
  await next();
};

export function stageRoute(logger: ILogger) {
  const router = new Router({ prefix: '/stage' });

  router.get('/:id', guard, createGetRoute(Stage, logger));

  router.post('/', adminGuard, createPostRoute(Stage, logger));

  router.put('/:id', adminGuard, validateStageId, createPutRoute(Stage, logger));

  return router;
}
