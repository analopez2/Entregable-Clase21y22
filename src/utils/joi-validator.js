import joi from 'joi';

const author = joi.object({
  id: joi.string().required(),
  nombre: joi.string().required(),
  apellido: joi.string().required(),
  edad: joi.number().required(),
  alias: joi.string().required(),
  avatar: joi.string().required(),
});

export const JOI_VALIDATOR = {
  author,
};
