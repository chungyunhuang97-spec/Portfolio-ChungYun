"use client";

import { useState } from "react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { VersionHistory } from "@/components/admin/VersionHistory";

type SaveResult = { success: boolean; error?: string };

/** ContentEditor + version history for a `site_content` entry. */
export function SiteContentEditor({
  contentKey,
  initialContent,
  onSave,
}: {
  contentKey: string;
  initialContent: Record<string, unknown>;
  onSave: (content: Record<string, unknown>) => Promise<SaveResult>;
}) {
  const [state, setState] = useState({ content: initialContent, nonce: 0 });
  return (
    <>
      <ContentEditor
        key={state.nonce}
        initialContent={state.content}
        onSave={async (content) => {
          const result = await onSave(content);
          if (result.success) setState((prev) => ({ ...prev, content }));
          return result;
        }}
        trackingId={`site-content-${contentKey}`}
        trackingLabel={contentKey}
      />
      <div className="mt-6 border-t border-admin-border pt-4">
        <VersionHistory
          entity="site_content"
          entityKey={contentKey}
          currentContent={state.content}
          onSave={onSave}
          onRestored={(content) => setState((prev) => ({ content, nonce: prev.nonce + 1 }))}
        />
      </div>
    </>
  );
}
