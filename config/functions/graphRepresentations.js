
const createGraphRepresentation = async (
  endpoint,
  event,
  { setNextGraphUpdate  }
) => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(event.result),
      headers: {
        "Content-Type": "application/json",
      }
    });
    const resultBody = await response.json();
    if (resultBody.error) {
      strapi.log.warn(`Reaches the server ${endpoint} with error ${resultBody.error}`);
    } else {
      strapi.log.info(`Created graph representation with IRI ${resultBody.data}`);
      setNextGraphUpdate(false);
      await strapi.documents(event.model.uid)
        .update({
          documentId: event.result.documentId,
          data: {graphId: resultBody.data}
        });
    }
  } catch (e) {
    strapi.log.warn(`Error happened while accessing ${endpoint} to create new user graph representation with error ${e}`);
  }
}


const updateGraphRepresentation = async (
  endpoint,
  event,
  { setNextGraphUpdate, nextGraphUpdate }
) => {
  if (!nextGraphUpdate) {
    setNextGraphUpdate(true);
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

module.exports = {
  createGraphRepresentation,
  updateGraphRepresentation
}
