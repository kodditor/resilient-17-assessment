const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const PaymentMessages = require('@app/messages/payment'); // Your message file

const spec = `root {
  accounts[] {
    id string
    balance number
    currency string
  }
  instruction string
}`;

const parsedSpec = validator.parse(spec);

async function createCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedSpec);

  try {
   
    response = {
      type: 'DEBIT',
      amount: 100,
      currency: 'USD',
      debit_account: 'a',
      credit_account: 'b',
      execute_by: null,
      status: 'successful',
      status_reason: 'Transaction executed successfully',
      status_code: 'AP00',
      accounts: processedAccounts,
    };
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = createCreatorCard;