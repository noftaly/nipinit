import v8 from 'node:v8';

export default function structuredClone<T>(obj: T): T {
  return v8.deserialize(v8.serialize(obj)) as T;
}
