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
  endpoint: process.env.WEBHOOK_ENDPOINT_URL + "/hook/user",
}

const updateGraphRepresentation = async (endpoint, event, state) => {
  if (!state.nextGraphUpdate) {
    state.nextGraphUpdate = true;
    return;
  }
  try {
    const result = await fetch(`${endpoint}/${event.result.id}` , {
      method:'PUT',
      body: JSON.stringify(event.result),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const resultBody = await result.json();
    if (resultBody.error) {
      strapi.log.warn(`Reaches the server ${endpoint} with error ${resultBody.error}`);
    } else {
      strapi.log.info(`Update graph representation with IRI ${resultBody.data}`);
    }
  } catch (error) {
    strapi.log.warn(`Error happened while accessing ${endpoint} to update user with graph id ${event.result.graphId} graph representation with error ${error}`);
  }
}

const createGraphRepresentation = async (endpoint, event, state) => {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(event.result),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const resultBody = await result.json();
    if (resultBody.error) {
      strapi.log.warn(`Reaches the server ${endpoint} with error ${resultBody.error}`);
    } else {
      strapi.log.info(`Created graph representation with IRI ${resultBody.data}`);
      state.nextGraphUpdate = false;
      await strapi.documents('plugin::users-permissions.user')
        .update({
          documentId: event.result.documentId,
          data: {graphId: resultBody.data}
        });
    }
  } catch (error) {
    strapi.log.warn(`Error happened while accessing ${endpoint} to create new user graph representation with error ${error}`);
  }
}

module.exports = {
  afterCreate(event) {
    createUserStatistics(event);
    createGraphRepresentation(lifecycleState.endpoint, event, lifecycleState);
  },
  afterUpdate(event) {
    updateGraphRepresentation(lifecycleState.endpoint, event, lifecycleState);
  }
}
