
/**
 *
 * @param {string} modelName
 * @param {{
    create?:string,
    update?:string,
    remove?:string,
    getTrackingData: (doc)=>any
}} eventTypes
 */
function addEventTracking(modelName, eventTypes = {}) {
  const {
    create,
    update,
    remove,
    getTrackingData = () => {},
  } = eventTypes;


  return (schema) => {
    if (create) {
      schema.pre('save', function () {
        this.isCreate = this.isNew;
        this.updatedPaths = this.modifiedPaths();
        this.shouldTrackEvent = this.isNew || isAnyFieldChanged(this.modifiedPaths());
      });
      schema.post('save', async function () {
        const { TrackingEventService } = require('../../services/app');

        const data = getTrackingData(this);

        if (!this.shouldTrackEvent) {
          return;
        }
        if (this.isCreate) {
          if (create) {
            TrackingEventService.trackDefaultEvent(create, this._id, modelName, this.companyId, data);
          }
        } else if (update) {
          TrackingEventService.trackDefaultEvent(create, this._id, modelName, this.companyId, data);
        }
      });
    }

    if (remove) {
      schema.post('remove', (doc) => {
        const { TrackingEventService } = require('../../services/app');

        const data = getTrackingData(doc);

        TrackingEventService.trackDefaultEvent(remove, doc._id, modelName, doc.companyId, data);
      });
    }
  };
}

function isAnyFieldChanged(modifiedPaths) {
  if (modifiedPaths.length === 0) {
    return false;
  }
  if (modifiedPaths.length === 1 && modifiedPaths[0] === 'updatedAt') {
    return false;
  }
  return true;
}

module.exports = {
  addEventTracking,
};
