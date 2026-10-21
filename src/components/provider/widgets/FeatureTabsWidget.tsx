import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Braces,
  ChevronRight,
  FileText,
  Folder,
  FolderPlus,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserRoundX,
  Users,
} from "lucide-react";

import { api } from "../../../lib/api";
import { resolveCaughtApiError } from "../../../api/resolve-caught-error";
import { useToast } from "../../Toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { ConfirmModal } from "../../ui/ConfirmModal";
import { AppModal } from "../../ui/AppModal";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type FeatureKind = "modrinth" | "files" | "players" | "auth";
type Feature = {
  key: string;
  kind: FeatureKind;
  game?: string;
  directory?: string;
  labelKey?: string;
  descriptionKey?: string;
  label?: string | { de?: string; en?: string };
  description?: string | { de?: string; en?: string };
};

function featureLabel(t: (key: string) => string, feature: Feature): string {
  if (feature.labelKey) return t(feature.labelKey);
  if (typeof feature.label === "string") return feature.label;
  return feature.label?.de ?? feature.label?.en ?? feature.key;
}

/**
 * Mobile port of the web `feature-tabs` block: egg-unlocked feature tabs for a
 * game server (players, auth-code sign-in, files, content browser). The mobile
 * app renders the panels itself from the skeleton API routes.
 */
export default function FeatureTabsWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<{ features?: Feature[] }>(`/services/${encodeURIComponent(id)}/features`)
      .then((data) => {
        if (cancelled) return;
        const list = data.features ?? [];
        setFeatures(list);
        setActiveKey((prev) => prev ?? list[0]?.key ?? null);
      })
      .catch(() => {
        if (!cancelled) setFeatures([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="glass flex items-center gap-2 p-4 text-sm text-(--text-muted)">
        <Loader2 className="size-4 animate-spin" /> {t("loading")}
      </section>
    );
  }

  if (features.length === 0) {
    return (
      <section className="glass p-4">
        <p className="text-sm text-(--text-muted)">{t("featuresEmpty")}</p>
      </section>
    );
  }

  const active = features.find((feature) => feature.key === activeKey) ?? features[0];

  return (
    <section className="space-y-3">
      {features.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {features.map((feature) => {
            const isActive = feature.key === active?.key;
            return (
              <Button
                key={feature.key}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveKey(feature.key)}
                className="shrink-0"
              >
                {feature.kind === "players" ? <Users className="size-4" /> : null}
                {feature.kind === "auth" ? <KeyRound className="size-4" /> : null}
                {feature.kind === "files" ? <Folder className="size-4" /> : null}
                {feature.kind === "modrinth" ? <Braces className="size-4" /> : null}
                {featureLabel(t, feature)}
              </Button>
            );
          })}
        </div>
      ) : null}

      {active?.kind === "players" ? <PlayersPanel serviceId={id} game={active.game} /> : null}
      {active?.kind === "auth" ? <AuthPanel serviceId={id} game={active.game} /> : null}
      {active?.kind === "files" ? <FilesPanel serviceId={id} directory={active.directory} /> : null}
      {active?.kind === "modrinth" ? <ContentPanel serviceId={id} /> : null}
    </section>
  );
}

// ---------------------------------------------------------------- players

type OnlinePlayer = { name: string; uuid: string | null };
type Ban = { name: string; reason: string | null; source: string | null };
type PlayersResponse = {
  game?: string;
  experimental?: boolean;
  serverState?: string;
  online?: OnlinePlayer[];
  onlineCount?: number;
  maxPlayers?: number | null;
  bans?: Ban[];
  whitelist?: { enabled?: boolean; entries?: string[] };
};

function PlayersPanel({ serviceId, game }: { serviceId: string; game?: string }) {
  const t = useProviderT();
  const { show } = useToast();
  const [data, setData] = useState<PlayersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<{ type: "kick" | "ban" | "unban"; player: string } | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [whitelistInput, setWhitelistInput] = useState("");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const query = game ? { game } : undefined;
      setData(await api.get<PlayersResponse>(`/services/${encodeURIComponent(serviceId)}/players`, query));
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
    } finally {
      setLoading(false);
    }
  }, [serviceId, game, show, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (action: string, player?: string, reasonValue?: string) => {
    setBusy(true);
    try {
      await api.post(`/services/${encodeURIComponent(serviceId)}/players/action`, {
        game,
        action,
        player,
        reason: reasonValue,
      });
      show(t("featureActionDone").replace("{{player}}", player ?? ""), "success");
      await load();
      return true;
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const whitelist = data?.whitelist ?? { enabled: false, entries: [] };

  return (
    <div className="space-y-3">
      <section className="glass space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${data?.serverState === "running" ? "bg-(--success)" : "bg-(--error)"}`} />
            <h3 className="text-sm font-semibold text-(--text-primary)">
              {data?.serverState === "running" ? t("featureOnline") : t("featureServerOffline")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {data?.experimental ? <Badge> {t("featureExperimental")} </Badge> : null}
            <Button variant="ghost" size="icon" onClick={() => void load()} disabled={loading}>
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>
        {(data?.online ?? []).length === 0 ? (
          <p className="text-xs text-(--text-muted)">{t("featureNoPlayers")}</p>
        ) : (
          <div className="space-y-2">
            {(data?.online ?? []).map((player) => (
              <div key={player.name} className="flex items-center justify-between gap-2 rounded-control bg-(--surface-soft) px-3 py-2">
                <span className="truncate text-sm text-(--text-primary)">{player.name}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setPending({ type: "kick", player: player.name })}>
                    <UserMinus className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setPending({ type: "ban", player: player.name })}>
                    <UserRoundX className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("featureWhitelist")}</h3>
          <Badge>{whitelist.enabled ? t("featureWhitelistOn") : t("featureWhitelistOff")}</Badge>
        </div>
        <div className="flex gap-2">
          <Input value={whitelistInput} onChange={(event) => setWhitelistInput(event.target.value)} placeholder={t("featureWhitelistAdd")} />
          <Button
            size="sm"
            disabled={!whitelistInput.trim() || busy}
            onClick={async () => {
              if (await runAction("whitelist-add", whitelistInput.trim())) setWhitelistInput("");
            }}
          >
            {t("featureWhitelistAdd")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void runAction(whitelist.enabled ? "whitelist-off" : "whitelist-on")}>
            {whitelist.enabled ? t("featureWhitelistOff") : t("featureWhitelistOn")}
          </Button>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void runAction("whitelist-reload")}>
            {t("featureWhitelistReload")}
          </Button>
        </div>
        {(whitelist.entries ?? []).length === 0 ? (
          <p className="text-xs text-(--text-muted)">{t("featureWhitelistEmpty")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(whitelist.entries ?? []).map((entry) => (
              <button key={entry} type="button" onClick={() => setRemoveTarget(entry)} className="rounded-pill bg-(--surface-soft) px-3 py-1 text-xs text-(--text-primary)">
                {entry}
              </button>
            ))}
          </div>
        )}
      </section>

      {(data?.bans ?? []).length > 0 ? (
        <section className="glass space-y-2 p-4">
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("featureBans")}</h3>
          {(data?.bans ?? []).map((ban) => (
            <div key={ban.name} className="flex items-center justify-between gap-2 rounded-control bg-(--surface-soft) px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-(--text-primary)">{ban.name}</p>
                <p className="truncate text-xs text-(--text-muted)">{[ban.reason, ban.source].filter(Boolean).join(" · ")}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setPending({ type: "unban", player: ban.name })}>
                <ShieldCheck className="size-4" />
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      <ConfirmModal
        open={pending !== null}
        title={pending?.type === "unban" ? t("featureUnban") : pending?.type === "ban" ? t("featureBan") : t("featureKick")}
        description={t("featureActionConfirm").replace("{{player}}", pending?.player ?? "")}
        confirmLabel={t("featureConfirm")}
        cancelLabel={t("cancel")}
        destructive={pending?.type === "ban"}
        isLoading={busy}
        onCancel={() => {
          setPending(null);
          setReason("");
        }}
        onConfirm={async () => {
          if (!pending) return;
          const ok = await runAction(pending.type, pending.player, reason);
          if (ok) {
            setPending(null);
            setReason("");
          }
        }}
      />
      <ConfirmModal
        open={removeTarget !== null}
        title={t("featureWhitelistRemove")}
        description={t("featureActionConfirm").replace("{{player}}", removeTarget ?? "")}
        confirmLabel={t("featureWhitelistRemove")}
        cancelLabel={t("cancel")}
        destructive
        isLoading={busy}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (removeTarget) await runAction("whitelist-remove", removeTarget);
          setRemoveTarget(null);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------- auth

type AuthStatus = {
  game?: string;
  experimental?: boolean;
  authenticated?: boolean;
  identifier?: string | null;
  requiresCode?: boolean;
  deviceCode?: string | null;
  verificationUrl?: string | null;
  pending?: boolean;
};

function AuthPanel({ serviceId, game }: { serviceId: string; game?: string }) {
  const t = useProviderT();
  const { show } = useToast();
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setStatus(await api.get<AuthStatus>(`/services/${encodeURIComponent(serviceId)}/game-auth`, game ? { game } : undefined));
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [serviceId, game, show, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!status?.pending || status.authenticated) return;
    const interval = setInterval(() => void load(true), 3000);
    return () => clearInterval(interval);
  }, [status?.pending, status?.authenticated, load]);

  const submit = async (action: "authenticate" | "logout") => {
    setBusy(true);
    try {
      const result = await api.post<{ status?: AuthStatus }>(`/services/${encodeURIComponent(serviceId)}/game-auth`, {
        game,
        action,
        code: action === "authenticate" && status?.requiresCode ? code.trim() : undefined,
      });
      if (result?.status) setStatus(result.status);
      else await load();
      if (action === "logout" || result?.status?.authenticated) {
        show(action === "logout" ? t("featureAuthSignedOut") : t("featureAuthSignedIn"), "success");
      }
      setCode("");
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-(--text-muted)" />
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("featureTabAuth")}</h3>
        </div>
        <div className="flex items-center gap-2">
          {status?.experimental ? <Badge>{t("featureExperimental")}</Badge> : null}
          <Badge>{status?.authenticated ? t("featureAuthSignedIn") : t("featureAuthSignedOut")}</Badge>
          <Button variant="ghost" size="icon" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {status?.authenticated ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-(--text-primary)">
            {t("featureAuthIdentifier")}: <span className="font-mono">{status.identifier ?? "—"}</span>
          </p>
          <Button variant="secondary" size="sm" disabled={busy} onClick={() => void submit("logout")}>
            {t("featureAuthLogout")}
          </Button>
        </div>
      ) : status?.pending || status?.deviceCode || status?.verificationUrl ? (
        <div className="space-y-2">
          <p className="text-xs text-(--text-muted)">{t("featureAuthDeviceInstructions")}</p>
          {status?.verificationUrl ? (
            <a href={status.verificationUrl} target="_blank" rel="noreferrer noopener" className="text-sm text-(--primary) underline">
              {t("featureAuthDeviceOpen")}
            </a>
          ) : null}
          {status?.deviceCode ? (
            <p className="font-mono text-lg font-semibold tracking-widest text-(--text-primary)">{status.deviceCode}</p>
          ) : null}
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-(--warning)" />
            <span className="text-xs text-(--text-muted)">{t("featureAuthWaiting")}</span>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => void load(true)}>
              {t("featureAuthCheck")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {status?.requiresCode ? (
            <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder={t("featureAuthCode")} autoComplete="off" />
          ) : null}
          <Button size="sm" disabled={(status?.requiresCode ? !code.trim() : false) || busy} onClick={() => void submit("authenticate")}>
            {t("featureAuthSubmit")}
          </Button>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- files

type FileEntry = { name: string; size: number; isFile: boolean };

function FilesPanel({ serviceId, directory }: { serviceId: string; directory?: string }) {
  const t = useProviderT();
  const { show } = useToast();
  const dir = directory ? `/${directory.replace(/^\/+/, "")}` : "/";
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFile, setViewFile] = useState<{ name: string; content: string } | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ files?: FileEntry[] }>(`/services/${encodeURIComponent(serviceId)}/files`, {
        directory: dir,
      });
      setFiles(data.files ?? []);
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
    } finally {
      setLoading(false);
    }
  }, [serviceId, dir, show, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const openFile = async (name: string) => {
    setViewLoading(true);
    setViewFile({ name, content: "" });
    try {
      const data = await api.post<{ content?: string }>(`/services/${encodeURIComponent(serviceId)}/files`, {
        action: "read",
        file: `${dir.replace(/\/$/, "")}/${name}`,
      });
      setViewFile({ name, content: data.content ?? t("featureFilesEmpty") });
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
      setViewFile(null);
    } finally {
      setViewLoading(false);
    }
  };

  const createFolder = async () => {
    if (!folderName.trim()) return;
    setBusy(true);
    try {
      await api.post(`/services/${encodeURIComponent(serviceId)}/files`, {
        action: "create-folder",
        root: dir,
        name: folderName.trim(),
      });
      setFolderName("");
      setCreating(false);
      await load();
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
    } finally {
      setBusy(false);
    }
  };

  const removeFile = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await api.post(`/services/${encodeURIComponent(serviceId)}/files`, {
        action: "delete",
        root: dir,
        files: [deleteTarget],
      });
      setDeleteTarget(null);
      await load();
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Folder className="size-5 shrink-0 text-(--text-muted)" />
          <span className="truncate font-mono text-xs text-(--text-primary)">{dir}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setCreating(true)}>
            <FolderPlus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {files.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("featureFilesEmpty")}</p>
      ) : (
        <div className="space-y-1">
          {files.map((file) => (
            <div key={file.name} className="flex items-center justify-between gap-2 rounded-control bg-(--surface-soft) px-3 py-2">
              <button
                type="button"
                disabled={!file.isFile}
                onClick={() => void openFile(file.name)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {file.isFile ? (
                  <FileText className="size-4 shrink-0 text-(--text-muted)" />
                ) : (
                  <Folder className="size-4 shrink-0 text-(--primary)" />
                )}
                <span className="truncate text-xs text-(--text-primary)">{file.name}</span>
              </button>
              <span className="shrink-0 font-mono text-[10px] text-(--text-muted)">
                {file.isFile ? `${file.size} B` : "—"}
              </span>
              <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(file.name)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AppModal
        open={viewFile !== null}
        onClose={() => setViewFile(null)}
        closeAriaLabel={t("close")}
        maxWidthClassName="max-w-2xl"
        className="space-y-3 p-5"
      >
        <h2 className="text-sm font-semibold text-(--text-primary)">{viewFile?.name}</h2>
        {viewLoading ? (
          <Loader2 className="size-5 animate-spin text-(--text-muted)" />
        ) : (
          <pre className="max-h-[60vh] overflow-auto rounded-control bg-(--surface-soft) p-3 text-xs text-(--text-primary)">
            {viewFile?.content}
          </pre>
        )}
      </AppModal>

      <AppModal
        open={creating}
        onClose={() => setCreating(false)}
        closeAriaLabel={t("close")}
        maxWidthClassName="max-w-sm"
        className="space-y-3 p-5"
      >
        <h2 className="text-sm font-semibold text-(--text-primary)">{t("featureNewFolder")}</h2>
        <Input value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder={t("featureFolderName")} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
            {t("cancel")}
          </Button>
          <Button size="sm" disabled={!folderName.trim() || busy} onClick={() => void createFolder()}>
            {t("featureCreate")}
          </Button>
        </div>
      </AppModal>

      <ConfirmModal
        open={deleteTarget !== null}
        title={t("featureDelete")}
        description={t("featureDeleteConfirm").replace("{{name}}", deleteTarget ?? "")}
        confirmLabel={t("featureDelete")}
        cancelLabel={t("cancel")}
        destructive
        isLoading={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void removeFile()}
      />
    </section>
  );
}

// ---------------------------------------------------------------- content

type ContentProject = {
  id: string;
  title: string;
  author: string;
  description: string;
  iconUrl: string | null;
  downloads: number;
  source: string;
  installable?: boolean;
};

type ContentVersion = {
  id: string;
  name: string;
  versionNumber: string;
  gameVersions: string[];
  loaders: string[];
  channel: string;
  installable?: boolean;
  manualUrl?: string;
};

function ContentPanel({ serviceId }: { serviceId: string }) {
  const t = useProviderT();
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<{ project: ContentProject; versions: ContentVersion[]; loading: boolean } | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ projects?: ContentProject[] }>(
        `/services/${encodeURIComponent(serviceId)}/content/search`,
        { query: query.trim(), limit: 20 }
      );
      setProjects(data.projects ?? []);
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
    } finally {
      setLoading(false);
    }
  }, [serviceId, query, show, t]);

  const openDetail = async (project: ContentProject) => {
    setDetail({ project, versions: [], loading: true });
    try {
      const data = await api.get<{ project?: ContentProject; versions?: ContentVersion[] }>(
        `/services/${encodeURIComponent(serviceId)}/content/projects/${encodeURIComponent(project.id)}`
      );
      setDetail({ project: data.project ?? project, versions: data.versions ?? [], loading: false });
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
      setDetail(null);
    }
  };

  const install = async (project: ContentProject, version: ContentVersion) => {
    if (project.installable === false || version.installable === false) {
      show(t("featureNotInstallable"), "error");
      return;
    }
    setInstalling(version.id);
    try {
      await api.post(`/services/${encodeURIComponent(serviceId)}/content/install`, {
        source: project.source,
        contentType: "plugin",
        projectId: project.id,
        projectTitle: project.title,
        versionId: version.id,
        loaders: version.loaders,
        gameVersions: version.gameVersions,
      });
      show(t("featureInstallStarted").replace("{{title}}", project.title), "success");
      setDetail(null);
    } catch (error) {
      show(resolveCaughtApiError(error, t), "error");
    } finally {
      setInstalling(null);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("featureSearch")} />
        <Button size="sm" onClick={() => void search()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : t("featureSearchAction")}
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("featureNoResults")}</p>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => void openDetail(project)}
              className="flex w-full items-center gap-2 rounded-control bg-(--surface-soft) px-3 py-2 text-left"
            >
              {project.iconUrl ? (
                <img src={project.iconUrl} alt="" className="size-9 shrink-0 rounded-control object-cover" />
              ) : (
                <Braces className="size-5 shrink-0 text-(--text-muted)" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-(--text-primary)">{project.title}</span>
                <span className="block truncate text-xs text-(--text-muted)">{project.author || "—"} · {project.id}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-(--text-muted)" />
            </button>
          ))}
        </div>
      )}

      <AppModal
        open={detail !== null}
        onClose={() => setDetail(null)}
        closeAriaLabel={t("close")}
        maxWidthClassName="max-w-2xl"
        className="space-y-3 p-5"
      >
        {detail ? (
          <>
            <div className="flex items-start gap-3">
              {detail.project.iconUrl ? (
                <img src={detail.project.iconUrl} alt="" className="size-12 shrink-0 rounded-surface object-cover" />
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-(--text-primary)">{detail.project.title}</h2>
                <p className="truncate text-xs text-(--text-muted)">{detail.project.author || "—"} · {detail.project.id}</p>
                <p className="mt-1 text-xs text-(--text-secondary)">{detail.project.description}</p>
                {detail.project.installable === false ? (
                  <p className="mt-1 text-xs text-(--warning)">{t("featureNotInstallable")}</p>
                ) : null}
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">{t("featureVersions")}</h3>
            {detail.loading ? (
              <Loader2 className="size-5 animate-spin text-(--text-muted)" />
            ) : detail.versions.length === 0 ? (
              <p className="text-xs text-(--text-muted)">{t("featureNoResults")}</p>
            ) : (
              <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                {detail.versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between gap-2 rounded-control bg-(--surface-soft) px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-(--text-primary)">{version.versionNumber || version.name}</p>
                      <p className="truncate text-xs text-(--text-muted)">
                        {[version.channel, version.loaders.join(", "), version.gameVersions.slice(0, 3).join(", ")].filter(Boolean).join(" · ")}
                      </p>
                      {version.installable === false && version.manualUrl ? (
                        <a href={version.manualUrl} target="_blank" rel="noreferrer noopener" className="text-xs text-(--primary) underline">
                          {t("featureManualDownload")}
                        </a>
                      ) : null}
                    </div>
                    <Button
                      size="sm"
                      disabled={detail.project.installable === false || version.installable === false || installing === version.id}
                      onClick={() => void install(detail.project, version)}
                    >
                      {installing === version.id ? <Loader2 className="size-4 animate-spin" /> : <ArrowDownToLine className="size-4" />}
                      {t("featureInstall")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </AppModal>
    </section>
  );
}
