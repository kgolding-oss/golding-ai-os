import { NotImplementedKnowledgeProvider } from "../provider";
import type { KnowledgeProviderMetadata } from "../types";

function metadata(id: string, name: string, description: string): KnowledgeProviderMetadata {
  return { id, name, description, status: "not_implemented", indexedDocumentCount: 0, lastSyncAt: null };
}

export class GoogleDriveKnowledgeProvider extends NotImplementedKnowledgeProvider {
  readonly metadata = metadata("google-drive", "Google Drive", "Documents and shared-drive files from Google Workspace.");
}

export class GmailKnowledgeProvider extends NotImplementedKnowledgeProvider {
  readonly metadata = metadata("gmail", "Gmail", "Email threads and attachments from Google Workspace mailboxes.");
}

export class LocalFilesKnowledgeProvider extends NotImplementedKnowledgeProvider {
  readonly metadata = metadata("local-files", "Local Files", "Repository or filesystem documents approved for agent access.");
}

export class SupabaseDocumentsKnowledgeProvider extends NotImplementedKnowledgeProvider {
  readonly metadata = metadata("supabase-documents", "Supabase Documents", "Organization-scoped documents stored in Supabase tables or storage.");
}
