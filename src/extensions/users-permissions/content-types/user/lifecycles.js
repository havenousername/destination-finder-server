const {createGraphRepresentation, updateGraphRepresentation} = require("../../../../../config/functions/graphRepresentations");
const createUserStatistics = async (event) => {
  try {
    const statistics = await strapi.query('api::user-statistics.user-statistics')
      .create({ data: { user: event.result.id, visitedRegions: [], favouriteRegions: [] } });
    strapi.log.info(`User statistics was connected
      to ${event.model.attributes.id} with result ${JSON.stringify(statistics)}`);
  } catch (error) {
    console.error(error);
  }
}


const lifecycleState = {
  nextGraphUpdate: true,
  endpoint: process.env.WEBHOOK_ENDPOINT_URL + "/user",
}

module.exports = {
  afterCreate(event) {
    createUserStatistics(event);
    createGraphRepresentation(lifecycleState.endpoint, event, {
      setNextGraphUpdate: b => lifecycleState.nextGraphUpdate = b,
    });
  },
  afterUpdate(event) {
    updateGraphRepresentation(lifecycleState.endpoint, event, {
      setNextGraphUpdate: b => lifecycleState.nextGraphUpdate = b,
      nextGraphUpdate: lifecycleState.nextGraphUpdate
    });
  },
  afterDelete(event) {

  }
}
