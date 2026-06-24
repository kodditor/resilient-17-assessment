const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
// const PaymentMessages = require('@app/messages/payment');
const CreatorCard = require('@app/repository/creator-card');

const spec = `root {
  slug string
  creator_reference string<trim|length:20>
}`;

const parsedSpec = validator.parse(spec);

async function deleteCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedSpec);

  try {

    const creatorCard = await CreatorCard.findOne({ query: { slug: data.slug, creator_reference: data.creator_reference } });
    if(!creatorCard){
      // TODO: throw error
    }

    await CreatorCard.deleteOne({ query: { _id: creatorCard._id }, options: { paranoid: true } });

    response = {
      "id": creatorCard._id,
      "title": creatorCard.title,
      "description": creatorCard.description,
      "slug": creatorCard.slug,
      "creator_reference": creatorCard.creator_reference,
      "links": creatorCard.links,
      "service_rates": creatorCard.service_rates,
      "status": creatorCard.status,
      "access_type": creatorCard.access_type,
      "access_code": creatorCard.access_code,
      "created": creatorCard.created,
      "updated": creatorCard.updated,
      "deleted": creatorCard.deleted
    };

  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = deleteCreatorCard;