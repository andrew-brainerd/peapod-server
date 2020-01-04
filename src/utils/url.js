const isEmpty = require('lodash/isEmpty');

const formatUrlParams = options => {
  return (!isEmpty(options) &&
    `?${Object.keys(options).map(o =>
      `${o}=${options[o]}`
    ).join('&')}`) || '';
}

module.exports = {
  formatUrlParams
};
