interface NodeVersion {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Returns an array of 3 integers, the Node.js's major, minor and patch versions.
 */
export default function getNodeVersion(): NodeVersion {
  const versions: number[] = process.version.slice(1).split('.').map(num => Number.parseInt(num, 10));
  return {
    major: versions[0],
    minor: versions[1],
    patch: versions[2],
  };
}
