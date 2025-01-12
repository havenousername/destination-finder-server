const createUserStatistics = async (event) => {
  const user = await strapi.db.query('plugin::users-permissions.user')
    .findOne({ where: { email: event.params.data.email } });
  const statistics = await strapi.db.query('api::user-statistics.user-statistics')
    .create({ data: { user: user.id, visitedRegions: [], favouriteRegions: [] } });
  strapi.log.info(`User statistics was connected
      to ${event.model.attributes.id} with result ${JSON.stringify(statistics)}`);
}


const GRAPH_USER_ENDPOINT = process.env.WEBHOOK_ENDPOINT_URL + "/hook/user";


const updateGraphRepresentation = async (event) => {
  const result = await  fetch(`${GRAPH_USER_ENDPOINT}/${event.result.id}` , {
    method:'PUT',
    body: JSON.stringify(event.result),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  console.log(result);
}

const createGraphRepresentation = async (event) => {
  try {
    const result = await fetch(GRAPH_USER_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(event.result),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const resultBody = await result.json();
    if (resultBody.error) {
      strapi.log.warn(`Reaches the server ${GRAPH_USER_ENDPOINT} with error ${resultBody.error}`);
    } else {
      strapi.log.info(`Created graph representation with IRI ${resultBody.data}`);
      await strapi.documents('plugin::users-permissions.user')
        .update({
          documentId: event.result.documentId,
          data: {graphId: resultBody.data}
        })
    }
  } catch (error) {
    strapi.log.warn(`Error happened while accessing ${GRAPH_USER_ENDPOINT} to create new user graph representation with error ${error}`);
  }

}

module.exports = {
  afterCreate(event) {
    createUserStatistics(event);
    createGraphRepresentation(event);
  },
  afterUpdate(event) {
    console.log(`User has been updated`, event);
    updateGraphRepresentation(event);
  }
}
