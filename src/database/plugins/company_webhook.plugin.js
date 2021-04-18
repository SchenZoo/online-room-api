
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

  const { WebhookService } = require('../../services/app/webhook.service');

  return (schema) => {
    if (create || update) {
      schema.pre('save', async function () {
        const isCreate = this.modifiedPaths().includes('companyId');
        if (!isAnyFieldChanged(this.modifiedPaths())) {
          return;
        }
        if (isCreate) {
          if (create) {
            WebhookService.sendCompanyWebhooks(this.companyId, create, { [propertyName]: this });
          }
        } else if (update) {
          WebhookService.sendCompanyWebhooks(this.companyId, update, { [propertyName]: this });
        }
      });
    }

    if (remove) {
      schema.pre('remove', async function () {
        WebhookService.sendCompanyWebhooks(this.companyId, remove, { [propertyName]: this });
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
