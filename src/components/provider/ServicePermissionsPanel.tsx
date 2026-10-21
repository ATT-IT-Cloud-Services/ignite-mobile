import { useCallback, useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";

import { api } from "../../lib/api";
import { resolveCaughtApiError } from "../../api/resolve-caught-error";
import { useI18n } from "../../i18n";
import { useToast } from "../Toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ConfirmModal } from "../ui/ConfirmModal";
import { useProviderT } from "./use-provider-t";

type ResourcePermission = {
  id: string;
  email?: string;
  granteeEmail?: string;
  status: string;
  permissions: string[] | string;
};

const PERM_OPTIONS = ["view", "settings", "credentials", "support_ticket"] as const;

function normalizePerm(p: string) {
  const x = p.trim();
  return x === "manage" ? "settings" : x;
}

function normalizePermissionSet(perms: string[]): string[] {
  const set = new Set(perms.map(normalizePerm));
  const hasOpsBeyondSupport = [...set].some((p) => p !== "support_ticket" && p !== "view");
  if (hasOpsBeyondSupport) set.add("view");
  if (set.size === 0) set.add("view");
  return Array.from(set);
}

export function ServicePermissionsPanel({ serviceId }: { serviceId: string }) {
  const { t: tTyped } = useI18n();
  const t = useProviderT();
  const { show } = useToast();
  const [permissions, setPermissions] = useState<ResourcePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["view"]);
  const [inviting, setInviting] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.client.permissions.list({
        resourceType: "SERVER",
        resourceId: serviceId,
      }) as unknown as { permissions?: ResourcePermission[] };
      setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [serviceId, show, tTyped]);

  useEffect(() => {
    void load();
  }, [load]);

  const permissionLabel = (perm: string) => {
    const p = normalizePerm(perm);
    if (p === "view") return t("permissionView");
    if (p === "settings") return t("permissionSettings");
    if (p === "credentials") return t("permissionCredentials");
    if (p === "support_ticket") return t("permissionSupportTicket");
    return p;
  };

  const statusLabel = (status: string) => {
    if (status === "ACCEPTED") return t("permissionStatusAccepted");
    if (status === "PENDING") return t("permissionStatusPending");
    if (status === "DECLINED") return t("permissionStatusDeclined");
    if (status === "REVOKED") return t("permissionStatusRevoked");
    return status;
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      show(t("enterEmail"), "warning");
      return;
    }
    setInviting(true);
    try {
      await api.client.permissions.create({
        resourceType: "SERVER",
        resourceId: serviceId,
        email: inviteEmail.trim(),
        permissions: selectedPermissions,
      });
      show(t("inviteSent"), "success");
      setInviteEmail("");
      setSelectedPermissions(["view"]);
      await load();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeId) return;
    setRevoking(true);
    try {
      await api.client.permissions.deleteRemove(revokeId);
      show(t("permissionRevoked"), "success");
      setRevokeId(null);
      await load();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="glass p-4">
        <div className="flex items-center gap-2">
          <Users className="size-5 shrink-0 text-(--text-muted)" />
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("permissions")}</h3>
        </div>
        <div className="mt-3 space-y-3">
          <Input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder={t("enterEmail")}
            className="min-h-11"
          />
          <div className="flex flex-wrap gap-2">
            {PERM_OPTIONS.map((perm) => {
              const active = selectedPermissions.includes(perm);
              return (
                <button
                  key={perm}
                  type="button"
                  onClick={() =>
                    setSelectedPermissions((prev) => {
                      const next = active ? prev.filter((p) => p !== perm) : [...prev, perm];
                      return normalizePermissionSet(next);
                    })
                  }
                  className={`min-h-10 rounded-xl px-3 text-xs font-medium ${
                    active
                      ? "bg-(--brand-primary) text-white"
                      : "glass text-(--text-secondary)"
                  }`}
                >
                  {permissionLabel(perm)}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            onClick={() => void handleInvite()}
            disabled={inviting}
            className="btn-primary min-h-11 w-full rounded-xl"
          >
            {inviting ? <Loader2 className="size-4 animate-spin" /> : t("sendInvite")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="glass h-24 animate-pulse" />
      ) : permissions.length === 0 ? (
        <p className="glass p-6 text-center text-sm text-(--text-muted)">{t("noPermissionsYet")}</p>
      ) : (
        <div className="space-y-3">
          {permissions.map((row) => {
            const email = row.granteeEmail || row.email || "—";
            const perms = Array.isArray(row.permissions)
              ? row.permissions
              : String(row.permissions || "")
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean);
            return (
              <div key={row.id} className="glass p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-(--text-primary)">{email}</div>
                    <div className="mt-1 text-xs text-(--text-muted)">
                      {perms.map(normalizePerm).map(permissionLabel).join(" · ")}
                    </div>
                  </div>
                  <Badge variant={row.status === "ACCEPTED" ? "success" : "warning"}>
                    {statusLabel(row.status)}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRevokeId(row.id)}
                  className="mt-3 min-h-11 rounded-xl px-3 text-sm text-(--error)"
                >
                  {t("revokePermission")}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={revokeId !== null}
        title={t("revokePermission")}
        description={t("revokePermissionConfirm")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={() => void handleRevoke()}
        onCancel={() => setRevokeId(null)}
        destructive
        isLoading={revoking}
      />
    </section>
  );
}
