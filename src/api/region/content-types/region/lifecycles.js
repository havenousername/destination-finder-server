const {createGraphRepresentation, updateGraphRepresentation, } = require("../../../../../config/functions/graphRepresentations");
const {state} = require("pg/lib/native/query");

const lifecycleState = {
  nextGraphUpdate: true,
  endpoint: process.env.WEBHOOK_ENDPOINT_URL + "/region",
};


const createRegionGraphRepresentation = async (endpoint, event, state) => {
  const fields = await strapi.documents(event.model.uid)
    .findOne({
      documentId: event.result.documentId,
      populate: ["ParentRegion"],
    });
  event.result = {
    ...event.result,
    parentRegion: fields.ParentRegion?.id,
  };
  await createGraphRepresentation(
    endpoint,
    event,
    { setNextGraphUpdate: (b) => state.nextGraphUpdate = b },
  );
}

module.exports = {
  async afterCreate(event) {
    await createRegionGraphRepresentation(lifecycleState.endpoint, event, lifecycleState);
  },
  async afterUpdate(event) {
    updateGraphRepresentation(lifecycleState.endpoint, event, {
      setNextGraphUpdate: (b) => lifecycleState.nextGraphUpdate = b,
      nextGraphUpdate: lifecycleState.nextGraphUpdate,
    });
  }
}
