/**
 * @docs https://support.dynamicyield.com/hc/en-us/articles/360007233457-Product-Performance-Client-Side-API
 * @param {*} skus
 * @returns {Promise<string[]>} skus
 */
export const getToShowsBySkus = (skus = []) =>
  new Promise((resolve, reject) => {
    if (__SERVER__) {
      resolve([]);
    }
    try {
      // eslint-disable-next-line no-undef
      if (!DY.ServerUtil?.getProductsData || skus.length === 0) {
        resolve([]);
      }
      // eslint-disable-next-line no-undef
      DY.ServerUtil?.getProductsData(skus, [], 'view', true, (err, res) => {
        if (res) {
          const targetSkus = [];
          skus.forEach((sku) => {
            if (res[sku]) {
              const toShowSkus = res[sku].productData?.ToShow?.split('|') || [];
              targetSkus.push(...toShowSkus);
            }
          });
          // exclude skus that already in cart
          const result = Array.from(new Set(targetSkus))?.filter((sku) => sku && !skus.includes(sku));
          resolve(result);
        } else {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
