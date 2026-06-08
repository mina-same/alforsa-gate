import { FileIcon, defaultStyles } from "react-file-icon";

export function getFileIcon(type?: string, name?: string, className = "w-6 h-6") {
  const lower = name?.toLowerCase() || "";

  const ext =
    lower.split(".").pop() ||
    (type?.split("/")[1] ?? "");

  const iconProps = defaultStyles[ext];

  if (iconProps) {
    return (
      <div className={className}>
        <FileIcon {...iconProps}   extension ={ext}/>
      </div>
    );
  }

  return (
    <div className={className}>
      <FileIcon {...defaultStyles.txt} extension={ext || "txt"} />
    </div>
  );
}
