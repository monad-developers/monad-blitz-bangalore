const Joi = require('joi');

// Custom validation functions
const customValidations = {
  ethereumAddress: (value, helpers) => {
    // Simple address format validation (0x followed by 40 hex characters)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(value)) {
      return helpers.error('any.invalid');
    }
    return value.toLowerCase();
  },
  
  positiveNumber: (value, helpers) => {
    if (value <= 0) {
      return helpers.error('number.positive');
    }
    return value;
  },
  
  ipfsHash: (value, helpers) => {
    const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    const cidv1Regex = /^b[A-Za-z2-7]{58}$/;
    
    if (!cidv0Regex.test(value) && !cidv1Regex.test(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }
};

// Validation schemas
const schemas = {
  // Upload image and metadata
  uploadNFT: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(1000).required(),
    attributes: Joi.array().items(
      Joi.object({
        trait_type: Joi.string().required(),
        value: Joi.string().required()
      })
    ).optional(),
    external_url: Joi.string().uri().optional(),
    background_color: Joi.string().pattern(/^[0-9A-Fa-f]{6}$/).optional(),
    animation_url: Joi.string().uri().optional(),
    youtube_url: Joi.string().uri().optional()
  }),

  // Mint NFT
  mintNFT: Joi.object({
    owner: Joi.string().custom(customValidations.ethereumAddress).required(),
    basePrice: Joi.number().custom(customValidations.positiveNumber).required(),
    isPR: Joi.boolean().optional().default(false),
    prDurationHours: Joi.number().min(0.01).max(8760).when('isPR', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(1000).required(),
    attributes: Joi.array().items(
      Joi.object({
        trait_type: Joi.string().required(),
        value: Joi.string().required()
      })
    ).optional(),
    metadataURI: Joi.string().required(),
    imageURL: Joi.string().uri().required()
  }),

  // List for sale
  listForSale: Joi.object({
    tokenId: Joi.number().integer().min(0).required(),
    owner: Joi.string().custom(customValidations.ethereumAddress).required(),
    basePrice: Joi.number().custom(customValidations.positiveNumber).optional(),
    isPR: Joi.boolean().optional().default(false),
    prDurationHours: Joi.number().min(0.01).max(8760).when('isPR', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // Delist from sale
  delistFromSale: Joi.object({
    tokenId: Joi.number().integer().min(0).required(),
    owner: Joi.string().custom(customValidations.ethereumAddress).required()
  }),

  // List for rent
  listForRent: Joi.object({
    tokenId: Joi.number().integer().min(0).required(),
    owner: Joi.string().custom(customValidations.ethereumAddress).required(),
    rentalFee: Joi.number().custom(customValidations.positiveNumber).required(),
    rentalDuration: Joi.number().min(1).max(8760).required() // max 1 year in hours
  }),

  // Delist from rent
  delistFromRent: Joi.object({
    tokenId: Joi.number().integer().min(0).required(),
    owner: Joi.string().custom(customValidations.ethereumAddress).required()
  }),

  // Like/Dislike NFT
  likeDislikeNFT: Joi.object({
    tokenId: Joi.number().integer().min(0).required()
  }),

  // Mark as purchased
  markPurchased: Joi.object({
    tokenId: Joi.number().integer().min(0).required(),
    buyerAddress: Joi.string().custom(customValidations.ethereumAddress).required(),
    transactionHash: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required()
  }),

  // Query parameters for getting NFTs
  getNFTsQuery: Joi.object({
    owner: Joi.string().custom(customValidations.ethereumAddress).optional(),
    isForSale: Joi.boolean().optional(),
    isForRent: Joi.boolean().optional(),
    isPR: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
    sortBy: Joi.string().valid('createdAt', 'mintedAt', 'basePrice', 'likes', 'dislikes', 'tokenId', 'finalizedAt').optional().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
    search: Joi.string().max(100).optional()
  }),

  // Token ID parameter
  tokenIdParam: Joi.object({
    tokenId: Joi.string().pattern(/^\d+$/).required().messages({
      'string.pattern.base': 'Token ID must be a valid number'
    })
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errorDetails
      });
    }

    // Replace the original property with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Custom error messages
const customMessages = {
  'any.invalid': 'Invalid value provided',
  'number.positive': 'Must be a positive number',
  'string.empty': 'Field cannot be empty',
  'any.required': 'Field is required'
};

// Extend Joi with custom messages
const extendedJoi = Joi.defaults((schema) => {
  return schema.messages(customMessages);
});

module.exports = {
  schemas,
  validate,
  customValidations,
  Joi: extendedJoi
}; 