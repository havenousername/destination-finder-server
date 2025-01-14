
const lifecycleState = {
  nextGraphUpdate: true,
  endpoint: process.env.WEBHOOK_ENDPOINT_URL + "/region",
};


const createGraphRepresentation = async (endpoint, event, state) => {
  try {
    const fields = await strapi.documents(event.model.uid)
      .findOne({
        documentId: event.result.documentId,
        populate: ["ParentRegion"],
    });
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        ...event.result,
        parentRegion: fields.ParentRegion.id,
      }),
      headers: {
        "Content-Type": "application/json",
      }
    });
    const resultBody = await response.json();
    if (resultBody.error) {
      strapi.log.warn(`Reaches the server ${endpoint} with error ${resultBody.error}`);
    } else {
      strapi.log.info(`Created graph representation with IRI ${resultBody.data}`);
      state.nextGraphUpdate = false;
      await strapi.documents(event.model.uid)
        .update({
          documentId: event.result.documentId,
          data: {graphId: resultBody.data}
        });
    }
  } catch (e) {
    strapi.log.warn(`Error happened while accessing ${endpoint} to create new user graph representation with error ${error}`);
  }
}

module.exports = {
  afterCreate(event) {
    createGraphRepresentation(lifecycleState.endpoint, event, lifecycleState);
  },
  afterUpdate(event) {
    console.log('afterUpdate', event);
  }
}
