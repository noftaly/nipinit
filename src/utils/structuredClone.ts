import v8 from 'v8';


// Not my fault, the v8 methods are not properly typed...
export default function structuredClone<T>(obj: T): T {
  return v8.deserialize(v8.serialize(obj));
}
