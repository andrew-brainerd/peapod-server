const Joi = require('joi');

const postPodBody = Joi.object({
  name: Joi.string().required(),
  createdBy: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required()
  })
});

module.exports = {
  postPodBody
};
