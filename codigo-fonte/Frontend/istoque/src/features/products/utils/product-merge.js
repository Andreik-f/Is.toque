export function mergeLoadedProducts(current, loaded) {
  const onScreen = new Map(current.map((product) => [product.id, product]));
  return loaded.map((product) => {
    const local = onScreen.get(product.id);
    if (!local) return product;
    return {
      ...product,
      stock: local.stock,
      expiry: local.expiry,
      photo: local.photo,
      art: local.art,
    };
  });
}
