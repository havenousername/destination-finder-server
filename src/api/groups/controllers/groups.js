'use strict';

/**
 * A set of functions called "actions" for `groups`
 */

module.exports = {
  updateGroups: async (ctx) => {
    const user = ctx.params['user'];
    const groups = ctx.request.body?.groups;
    const statistics = await strapi.db
      .query('api::user-statistics.user-statistics')
      .findOne({
        where: {user},
      });

    const updateRes = await strapi.entityService.update('api::user-statistics.user-statistics', statistics.id, {
      data: { groups }
    })
    return ctx.send(updateRes);
  }
};
