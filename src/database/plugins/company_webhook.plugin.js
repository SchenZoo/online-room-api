
/**
 *
 * @param {{
    create?:string,
    update?:string,
    remove?:string,
    propertyName?:string
}} webhookTypes
 */
function addHookWebhooks(webhookTypes = {}) {
  const {
    create, update, remove, propertyName = 'data',
  } = webhookTypes;


  return (schema) => {
    if (create || update) {
      schema.pre('save', function () {
        this.isCreate = this.isNew;
        this.updatedPaths = this.modifiedPaths();
        this.shouldRunHook = this.isNew || isAnyFieldChanged(this.modifiedPaths());
      });
      schema.post('save', async function () {
        const { WebhookService } = require('../../services/app');

        if (!this.shouldRunHook) {
          return;
        }
        if (this.isCreate) {
          if (create) {
            WebhookService.sendCompanyWebhooks(this.companyId, create, { [propertyName]: this });
          }
        } else if (update) {
          WebhookService.sendCompanyWebhooks(this.companyId, update, { [propertyName]: this, updatedPaths: this.updatedPaths });
        }
      });
    }

    if (remove) {
      schema.post('remove', (doc) => {
        const { WebhookService } = require('../../services/app');

        WebhookService.sendCompanyWebhooks(doc.companyId, remove, { [propertyName]: doc });
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
  addHookWebhooks,
};
