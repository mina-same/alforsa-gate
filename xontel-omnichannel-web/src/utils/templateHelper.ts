import { TemplateMessage } from "@/types/chat";
import { extractLatLngFromGoogleMaps } from "./urlHelper";

export const buildTemplateComponents = (template?: TemplateMessage) => {
  if (!template) return JSON.stringify([]);

  const components: any[] = [];

  // HEADER
  if (template.header_type === "IMAGE" && template.header_media_url) {
    components.push({
      type: "HEADER",
      parameters: [
        {
          type: "image",
          image: { link: template.header_media_url },
        },
      ],
    });
  }
  if(template.header_type ==="DOCUMENT" && template.header_media_url){
    components.push({
      type: "HEADER",
      parameters: [
        {
          type: "document",
          document: { link: template.header_media_url },
        }
      ]
    })
  }
  if(template.header_type ==="VIDEO" && template.header_media_url){
    components.push({
      type: "HEADER",
      parameters: [
        {
          type: "video",
          video: { link: template.header_media_url },
        }
      ]
    })
  }

  if(template.header_type ==="LOCATION" && template.header_media_url){
    components.push({
      type: "HEADER",
      parameters: [
        {
          type: "location",
          location: { 
            latitude: extractLatLngFromGoogleMaps(template.header_media_url)?.latitude,
            longitude: extractLatLngFromGoogleMaps(template.header_media_url)?.longitude,
            name: extractLatLngFromGoogleMaps(template.header_media_url)?.name||"Sea View Apartment",
address: extractLatLngFromGoogleMaps(template.header_media_url)?.address||"Stanley, Alexandria"
           },
        }
      ]
    })
  }
  

  // BODY
  if (template.variables?.length) {
    components.push({
      type: "BODY",
      parameters: template.variables.map((v) => ({
        type: "text",
        text: v.example,
      })),
    });
  }

  //  if ( template?.buttons?.[0]?.type === "CATALOG") {
  //   components.push({
  //     type: "button",
  //     sub_type: "CATALOG",
  //     index:0
  //   })
  // }

  // BUTTONS
  // if (template.buttons?.length) {
  //   template.buttons.forEach((btn, index) => {
  //     const btnObj: any = {
  //       type: "BUTTON",
  //       sub_type: btn.url ? "url" : btn.phone_number ? "call" : "quick_reply",
  //       index: index.toString(),
  //       parameters: [],
  //     };

  //     if (btn.url) btnObj.parameters.push({ type: "text", text: btn.url });
  //     if (btn.phone_number) btnObj.parameters.push({ type: "text", text: btn.phone_number });

  //     components.push(btnObj);
  //   });
  // }

  // رجع JSON string مباشرة
  return JSON.stringify({ components: components});
};