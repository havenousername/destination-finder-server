
module.exports = [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      headers: [
        'Origin',
        'Accept',
        'X-Requested-With',
        'Content-Type',
        'authorization',
        'Authorization',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'Strapi-Response-Format',
        'strapi-response-format',
      ],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
