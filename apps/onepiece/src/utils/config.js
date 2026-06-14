export const getConfig = (config) =>
  Array.isArray(config[__COUNTRY__])
    ? config[__COUNTRY__]
    : {
        ...config.common,
        ...config[__COUNTRY__],
      };

export const getConfigs = (configs) => configs.map(getConfig);
