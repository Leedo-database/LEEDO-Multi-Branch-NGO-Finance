import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer, 
  collection, 
  setDoc, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase SDK
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId
export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore: client is offline or awaiting network.');
    } else {
      console.log('Firebase connection test status:', error);
    }
    return false;
  }
}

// Helpers for syncing data to Firestore
export async function syncDocumentToFirestore(collectionName: string, docId: string, data: any) {
  const cleanPath = `${collectionName}/${docId}`;
  try {
    // Sanitize data: remove undefined values as Firestore doesn't accept undefined
    const sanitized = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, collectionName, docId), sanitized, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, cleanPath);
    return false;
  }
}

export async function deleteDocumentFromFirestore(collectionName: string, docId: string) {
  const cleanPath = `${collectionName}/${docId}`;
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, cleanPath);
    return false;
  }
}

export function subscribeToCollection<T>(
  collectionName: string, 
  onData: (items: T[]) => void, 
  onError?: (err: unknown) => void
): () => void {
  const colRef = collection(db, collectionName);
  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as T);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionName);
      if (onError) onError(error);
    }
  );
  return unsubscribe;
}

export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  onData: (item: T | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const docRef = doc(db, collectionName, docId);
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as T);
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
      if (onError) onError(error);
    }
  );
  return unsubscribe;
}
