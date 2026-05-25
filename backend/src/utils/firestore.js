const { db } = require('../config/firebase');

// Convert Firestore doc snapshot to plain object with id
const docToObj = (snap) => {
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
};

// Convert Firestore query snapshot to array
const snapToArr = (snap) => snap.docs.map(d => ({ id: d.id, ...d.data() }));

// Firestore server timestamp
const timestamp = () => require('firebase-admin').firestore.FieldValue.serverTimestamp();

// Convert Firestore Timestamp to JS Date string (for JSON responses)
const serializeDoc = (obj) => {
  if (!obj) return obj;
  const result = { ...obj };
  Object.keys(result).forEach(k => {
    if (result[k]?._seconds !== undefined) {
      result[k] = new Date(result[k]._seconds * 1000).toISOString();
    }
    if (result[k] && typeof result[k] === 'object' && !Array.isArray(result[k])) {
      result[k] = serializeDoc(result[k]);
    }
  });
  return result;
};

const serializeArr = (arr) => arr.map(serializeDoc);

module.exports = { docToObj, snapToArr, timestamp, serializeDoc, serializeArr };
