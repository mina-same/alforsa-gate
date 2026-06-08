import { OutgoingMessage } from "@/types/chat";

export function sendLocation(onSend:( msg: OutgoingMessage) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported.");
      reject(new Error("Geolocation is not supported."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        onSend({
          text: `{"longitude": ${lng} ,"latitude": ${lat}}`,
          location: {
            lat,
            lng,
          },

          // // Add media_url and media_type for location
          //   media: {
          //   type: "location" as const,
          //   blob: new Blob([JSON.stringify({ lat, lng })], { type: 'application/json' }),
          //   url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          //   name: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          // }
        });
        resolve();
      },
      (err) => {
        console.error("Location error:", err);
        reject(err);
      }
    );
  });
}
