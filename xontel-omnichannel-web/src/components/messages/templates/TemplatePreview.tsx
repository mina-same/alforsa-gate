import React from "react";
import { ExternalLink, Phone, Reply, Image } from "lucide-react";
import { TemplateMessage } from "@/types/chat";
import MessageStatus from "../MessageStatus";
import { TemplateVariable } from "@/types/template";
import { useWhatsAppTemplate } from "@/api";
import { extractLatLngFromGoogleMaps } from "@/utils/urlHelper";

export type TemplatePreviewProps = {
  template: TemplateMessage | null;
  timestamp?: string;
  status?: "pending" | "sent" | "delivered" | "read" | "failed";
  isSender?: boolean;
  additionalData?: string | Record<string, any>;
};

const ensureHttps = (url: string) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const ButtonIcon = ({ type }: { type: string }) => {
  if (type === "URL") return <ExternalLink className="h-4 w-4" />;
  if (type === "PHONE_NUMBER") return <Phone className="h-4 w-4" />;
  return <Reply className="h-4 w-4" />;
};

function renderBodyWithVariables(
  bodyText: string,
  variables: TemplateVariable[] | undefined
) {
  const byName = new Map<string, string>();
  (variables ?? []).forEach((v) => {
    byName.set(v.name, v.example);
  });

  const parts: React.ReactNode[] = [];
  const regex = /\{\{\s*([^}]+?)\s*\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(bodyText)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    const name = String(match[1]).trim();

    if (start > lastIndex) {
      parts.push(bodyText.slice(lastIndex, start));
    }

    const example = byName.get(name);
    const value = example !== undefined && example !== "" ? example : name;
    parts.push(
      <span key={`var-${key++}`} className="font-semibold">
        {value}
      </span>
    );

    lastIndex = end;
  }

  if (lastIndex < bodyText?.length) {
    parts.push(bodyText.slice(lastIndex));
  }

  return parts;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  timestamp,
  status,
  isSender,
  additionalData
}) => {
  if (!template) return null;

  // Parse additionalData to extract variables
  const parsedAdditionalData = React.useMemo(() => {
    if (!additionalData) return null;
    try {
      if (typeof additionalData === 'string') {
        return JSON.parse(additionalData);
      }
      return additionalData;
    } catch {
      return null;
    }
  }, [additionalData]);

  // Extract variables from additionalData (e.g., template_variables)
  const additionalDataVariables = React.useMemo((): TemplateVariable[] => {
    if (!parsedAdditionalData) return [];
    const vars = parsedAdditionalData?.template_variables || parsedAdditionalData?.variables || [];
    return vars.map((v: { name?: string; value?: string; example?: string }) => ({
      name: v.name || '',
      type: 'text' as const,
      example: v.value || v.example || ''
    }));
  }, [parsedAdditionalData]);

  // Merge all variables: additionalVariables (props) > additionalDataVariables > template.variables
  const mergedVariables = React.useMemo(() => {
    const byName = new Map<string, TemplateVariable>();
    
    // Start with template variables (lowest priority)
    (template.variables || []).forEach(v => {
      byName.set(v.name, v);
    });
    
    // Add additionalData variables (medium priority)
    additionalDataVariables.forEach(v => {
      if (v.name) {
        byName.set(v.name, { name: v.name, type: v.type, example: v.example });
      }
    });
    
  
    
    return Array.from(byName.values());
  }, [template.variables, additionalDataVariables]);






  const headerMediaUrl =  String(template.header_media_url ?? "").trim();
  const headerText =  String(template.header_text ?? "").trim();
  const footerText = String(template.footer_text ?? "").trim();
  const buttons = template.buttons || [];

  const details = extractLatLngFromGoogleMaps(headerMediaUrl);

const mapSrc = details && (details.latitude !== null && details.longitude !== null)
  ? `https://maps.google.com/maps?q=${encodeURIComponent(
      [details.name, details.address].filter(Boolean).join(', ')
    )}&ll=${details.latitude},${details.longitude}&z=15&output=embed`
  : headerMediaUrl;


  return (
    <div className="w-full max-w-xs rounded-lg overflow-hidden shadow-none bg-background border border-border">
      {headerMediaUrl && template.header_type === "IMAGE" && (
        <img
          src={ensureHttps(headerMediaUrl)}
          alt="Header"
          className="h-36 w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {headerMediaUrl && template.header_type === "DOCUMENT" && (
        <iframe
          src={ensureHttps(headerMediaUrl)}
          className="w-full h-full min-h-[150px] rounded-lg"
        />
      )}
      {
        headerMediaUrl && template.header_type === "VIDEO" && (
          <video
            src={ensureHttps(headerMediaUrl)}
            className="w-full h-full min-h-[150px] rounded-lg"
          />
        )
      }

      {
        headerMediaUrl && template.header_type === "LOCATION" && (
          <iframe
            src={mapSrc}
            className="w-full h-full min-h-[150px] rounded-lg"
          />
         
        )
      }


      <div className="px-3 pt-2.5 pb-1.5">
        {headerText && (
          <p className="text-sm font-semibold text-foreground mb-1">{headerText}</p>
        )}
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
          {renderBodyWithVariables(
           template.body_text || "",
            mergedVariables
          )}        
        </p>

        <div className="flex items-end justify-between mt-1.5">
          {footerText && (
            <p className="text-[11px] text-muted-foreground mr-2 line-clamp-1">{footerText}</p>
          )}
          {(timestamp || isSender) && (
            <div className="ml-auto flex items-center gap-1 shrink-0">
              {timestamp && (
                <span className="text-[11px] text-muted-foreground">{timestamp}</span>
              )}
              {isSender && status && (
                <MessageStatus
                  status={status}
                  time=""
                  isSender={true}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end"
                  sentIconClassName="text-muted-foreground h-3.5 w-3.5"
                  deliveredIconClassName="text-muted-foreground h-3.5 w-3.5"
                  readIconClassName="text-primary h-3.5 w-3.5"
                  pendingIconClassName="text-muted-foreground h-3.5 w-3.5"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {buttons.length > 0 && (
        <div className="border-t border-border">
          {buttons.map((btn, i) => {
            const type = String(btn.type || "");
            const text = String(btn.text || "");
            const url = btn.url ? ensureHttps(String(btn.url)) : "";
            const phone = btn.phone_number ? String(btn.phone_number) : "";

            const handleClick = () => {
              if (type === "URL" && url) {
                window.open(url, "_blank", "noopener,noreferrer");
                return;
              }
              if (type === "PHONE_NUMBER" && phone) {
                window.open(`tel:${phone}`);
                return;
              }
            };

            return (
              <button
                key={`${type}:${text}:${i}`}
                type="button"
                onClick={handleClick}
                className={`w-full flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-primary hover:bg-muted/20 transition-colors ${i === buttons.length - 1 ? "" : "border-b border-border"}`}
              >
                <ButtonIcon type={type} />
                <span>{text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};