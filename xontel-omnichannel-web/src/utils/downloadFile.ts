import { saveAs } from "file-saver";

// interface ExtendedNavigator extends Navigator {
//   msSaveOrOpenBlob?: (blob: Blob, filename: string) => void;
// }

import { apiClient } from "@/api";


export default async function downloadFile(file: string, filename?: string,
  openAfterDownload = false) {
  const name = filename || 'file';
  // try {
  //   if (file instanceof Blob) {
  //     const msSaveOrOpenBlob = (navigator as ExtendedNavigator).msSaveOrOpenBlob;
  //     if (msSaveOrOpenBlob) {
  //       msSaveOrOpenBlob(file, name);
  //       return;
  //     }
  //     const url = URL.createObjectURL(file);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = name;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     setTimeout(() => URL.revokeObjectURL(url), 1000);
  //     return;
  //   }

  //   // If it's a data URL we can download directly
  //   if (typeof file === 'string' && file.startsWith('data:')) {
  //     const a = document.createElement('a');
  //     a.href = file;
  //     a.download = name;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     return;
  //   }

  //   if (typeof file === 'string') {
  //     const resp = await fetch(file);
  //     if (!resp.ok) throw new Error('Network response was not ok');
  //     const blob = await resp.blob();
  //     const msSaveOrOpenBlob = (navigator as ExtendedNavigator).msSaveOrOpenBlob;
  //     if (msSaveOrOpenBlob) {
  //       msSaveOrOpenBlob(blob, name);
  //       return;
  //     }
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = name;
  //     a.target = '_blank';
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     setTimeout(() => URL.revokeObjectURL(url), 1000);
  //     return;
  //   }
  // } catch (err) {
  //   if (typeof file === 'string') {
  //     window.open(file, '_blank');
  //   }
  // }



    try {
    const res = await apiClient.get(file, {
      responseType: "blob",
      context: { skipLoader: true },
    });

    if (!res.data) {
      throw new Error("No data received from server");
    }

    const blob =
      res.data instanceof Blob ? res.data : new Blob([res.data], { type });

    saveAs(blob, filename);

    if (openAfterDownload) {
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank");
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    }
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}
