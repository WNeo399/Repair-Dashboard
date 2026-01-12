export default function parseProductString(productString: string) {
  // Split the product string by the hyphen (-)
  const parts = productString.toUpperCase().split('-')

  // Identify the storage and color parts, which are typically numeric and uppercase.
  const storageIndex = parts.findIndex((part) => part.match(/[0-9]+GB/i))
  //   let colorIndex = storageIndex + 1

  // Extract the brand, model, storage, and color
  const brand = parts[0] // First part is always the brand
  const model = parts.slice(1, storageIndex).join(' ') // Everything from index 1 to the storage index is part of the model
  const storage = parts[storageIndex] // The storage part
  //   let color = parts.slice(colorIndex, parts.length - 1).join(' ') // Remaining parts before the last are the color

  // Return the parsed parts as an object
  return {
    brand: brand,
    model: model,
    storage: storage,
    // color: color,
  }
}
