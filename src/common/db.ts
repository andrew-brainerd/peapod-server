import { MongoClient, ObjectId, type Db, type Document, type Filter } from 'mongodb';
import * as log from './logger.js';

const dbUri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME!;

let client: MongoClient;
let db: Db;

export const connectToMongoDB = async (): Promise<void> => {
  try {
    client = new MongoClient(dbUri);
    await client.connect();
    db = client.db(dbName);
    log.cool(`Connected to DB: ${dbName}`);
  } catch (err) {
    log.error('Failed to connect to MongoDB', err as Record<string, unknown>);
    throw err;
  }
};

export const disconnectFromMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    log.cool('Disconnected from MongoDB');
  }
};

const calculateTotalPages = (items: number, size: number): number =>
  items > size ? Math.ceil(items / size) : 1;

await connectToMongoDB();

export const insertOne = async (collectionName: string, document: Document): Promise<Document> => {
  const result = await db.collection(collectionName).insertOne(document);
  return { _id: result.insertedId, ...document };
};

export const getSome = async (
  collectionName: string,
  page: number,
  size: number,
  identifier?: string,
  idValue?: string,
): Promise<{ items: Document[]; totalItems: number; totalPages: number }> => {
  const collection = db.collection(collectionName);
  const query: Filter<Document> = identifier && idValue ? { [identifier]: idValue } : {};
  const totalItems = await collection.countDocuments(query);
  const totalPages = calculateTotalPages(totalItems, size);

  const items = await collection
    .find(query)
    .skip(size * (page - 1))
    .limit(size)
    .sort({ $natural: -1 })
    .toArray();

  return { items, totalItems, totalPages };
};

export const getById = async (collectionName: string, id: string): Promise<Document | null> => {
  return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
};

export const getByProperty = async (
  collectionName: string,
  property: string,
  value: unknown,
): Promise<Document | null> => {
  return db.collection(collectionName).findOne({ [property]: value });
};

export const updateOne = async (
  collectionName: string,
  id: string,
  update: Document,
): Promise<{ alreadyExists: boolean; id: string }> => {
  const result = await db
    .collection(collectionName)
    .updateOne({ _id: new ObjectId(id) }, { $addToSet: update });
  const alreadyExists = result.matchedCount === 1 && result.modifiedCount === 0;
  return { alreadyExists, id };
};

export const deleteOne = async (collectionName: string, id: string): Promise<string> => {
  await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  return id;
};

export const addToSet = async (
  collectionName: string,
  id: string,
  addition: Document,
): Promise<{ alreadyExists: boolean; id: string }> => {
  const result = await db
    .collection(collectionName)
    .updateOne({ _id: new ObjectId(id) }, { $addToSet: addition });
  const alreadyExists = result.matchedCount === 1 && result.modifiedCount === 0;
  return { alreadyExists, id };
};

export const pullFromSet = async (
  collectionName: string,
  id: string,
  removal: Document,
): Promise<{ notAMember: boolean; id: string }> => {
  const result = await db
    .collection(collectionName)
    .updateOne({ _id: new ObjectId(id) }, { $pull: removal as Document });
  const notAMember = result.matchedCount === 1 && result.modifiedCount === 0;
  return { notAMember, id };
};
