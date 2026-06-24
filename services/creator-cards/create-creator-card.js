const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
// const PaymentMessages = require('@app/messages/payment'); // Your message file
const CreatorCard = require('@app/repository/creator-card');

const spec = `root {
  title string<trim|lengthBetween:3,100>
  description? string<trim|maxLength:500>
  slug? string<trim|lengthBetween:5,50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|lengthBetween:1,100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|lengthBetween:3,100>
      description string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim|length:6>
}`;

const parsedSpec = validator.parse(spec);

async function createCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedSpec);

  try {

    if(!data.slug){
      const slug = data.title
        .trim()
        .toLowerCase()
        .replace(" ", '-');

      // TODO: if slug is either:
      // 1. Already existing
      // 2. shorter than 5 characters
      // append a hyphen and a random 6-character alphanumeric suffix
      
      data.slug = slug;
    } else {
      // check if slug is already taken;

      const existingCreatorCard = await CreatorCard.findOne({ query: { slug: data.slug } });
      if(existingCreatorCard){
        // TODO: throw error
      }
    }

    if(data.access_type === 'private' && !data.access_code){
      // TODO: throw error
    }

    const validUrls = data.links.every(link => {
      return link.url.startsWith('http://') || link.url.startsWith('https://');
    });

    if(!validUrls){
      // TODO: throw error
    }

    const creatorCard = await CreatorCard.create(data);

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
      "deleted": creatorCard.deleted,
    };
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = createCreatorCard;