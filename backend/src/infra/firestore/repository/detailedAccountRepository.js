const { userCollection } = require('../userCollection')

const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// descriptionLower (minúsculo, sem acento) sustenta a busca por prefixo no Firestore.
const withDescriptionLower = (data, current = {}) => {
  const { to, from } = { ...current, ...data }
  return { ...data, descriptionLower: normalize(to || from || '') }
}

module.exports = userCollection('transactions', withDescriptionLower)
