const FILE_TYPES = [
  "image/",
  "video/",
  "audio/",
  "application/",
  "text/",
];

const isFile = (type?: string, name?: string): boolean => {
  if (type === "file" || name === "file") return true;
  if (!type) return false;

  return FILE_TYPES.some(prefix => type.startsWith(prefix));
};

export default isFile;