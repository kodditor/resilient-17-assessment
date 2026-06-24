const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/repository/creator-card');
const generateUUID = require('@app-core/randomness/uuid');

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

function sanitizeString(slug, options = { allowDashes: true, allowUnderscores: true }){
  let tempSlug = "";

  // Manually parse for valid characters
  let allowed =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  if(options.allowDashes){
    allowed = allowed.concat("-");
  }

  if(options.allowUnderscores){
    allowed = allowed.concat("_");
  }

  for (const char of slug) {
    if (allowed.includes(char)) {
      tempSlug = tempSlug.concat(char);
    }
  }
  return tempSlug
}

function validateString(slug, options = { allowDashes: true, allowUnderscores: true }){
  let allowed =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  if(options.allowDashes){
    allowed = allowed.concat("-");
  }

  if(options.allowUnderscores){
    allowed = allowed.concat("_");
  }

  for (const char of slug) {
    if (!allowed.includes(char)) {
      return false;
    }
  }

  return true
}

async function createCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedSpec);

  try {

    if(!data.slug){
      let slug = sanitizeString(data.title?.toLowerCase().split(" ").join("-"));

      if(slug.length < 5){
        slug = slug + '-' + generateUUID().substring(0, 6);
      }

      let isSlugTaken = true;
      // Iterate and add random suffix until slug is not taken
      while(isSlugTaken){
        let existingCreatorCard = await CreatorCard.findOne({ query: { slug } });
        if(existingCreatorCard){
          slug = slug + '-' + generateUUID().substring(0, 6);
        } else {
          isSlugTaken = false;
        }
      }

      appLogger.info({ slug }, 'slug-generated');
      data.slug = slug;
    } else {

      // we cannot let invalid characters come through
      if(!validateString(data.slug)){
        throwAppError(CreatorCardMessages.INVALID_SLUG, ERROR_CODE.VALIDATIONERR);
      }

      // check if slug is already taken;
      let existingCreatorCard = await CreatorCard.findOne({ query: { slug: data.slug } });
      if(existingCreatorCard){
        appLogger.error({ slug: data.slug }, 'slug-already-taken');
        throwAppError(CreatorCardMessages.SLUG_ALREADY_TAKEN, ERROR_CODE.SLUG_ALREADY_TAKEN);
      }
    }

    if(data.access_type === 'private' && !data.access_code){
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODE.ACCESS_CODE_REQUIRED);
    }

    if(data.access_code){
      // we cannot let invalid characters come through
      // just letters and numbers
      if(!validateString(data.access_code, { allowDashes: false, allowUnderscores: false })){
        throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.VALIDATIONERR);
      }
    }

    if(
      (
        !data.access_type ||
        data.access_type === 'public'
      ) && data.access_code
    ){
      throwAppError(CreatorCardMessages.ACCESS_CODE_ON_PUBLIC_CARD, ERROR_CODE.ACCESS_CODE_ON_PUBLIC_CARD);
    }
    
    data.links?.forEach(link => {
      if(!(link.url.startsWith('http://') || link.url.startsWith('https://'))){
        throwAppError(CreatorCardMessages.INVALID_URL, ERROR_CODE.VALIDATIONERR);
      }
    })

    if(data.service_rates){
      if(!data.service_rates.rates?.length){
        throwAppError(CreatorCardMessages.NO_SERVICE_RATES, ERROR_CODE.VALIDATIONERR);
      }
    }

    data.service_rates?.rates?.forEach(rate => {
      if(!Number.isInteger(rate.amount)){
        throwAppError(CreatorCardMessages.INVALID_AMOUNT, ERROR_CODE.VALIDATIONERR);
      }
    })

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