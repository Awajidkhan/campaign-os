import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export default async function MailboxesPage() {
  const mailboxes = await prisma.mailbox.findMany({
    orderBy: { email: "asc" },
  });

  // Determine alert status for each mailbox
  const getAlertStatus = (mailbox: typeof mailboxes[0]) => {
    const alerts: string[] = [];

    // Bounce rate check
    if (mailbox.sentCount > 0) {
      const bounceRate = mailbox.bounceCount / mailbox.sentCount;
      if (bounceRate > mailbox.alertBounceRate) {
        alerts.push(`Bounce rate ${(bounceRate * 100).toFixed(1)}%`);
      }
    }

    // Spam check
    if (mailbox.spamCount > mailbox.alertSpamMax) {
      alerts.push(`Spam count ${mailbox.spamCount}`);
    }

    // Open rate check (if available)
    if (
      mailbox.openRate !== null &&
      mailbox.openRate < mailbox.alertOpenRate
    ) {
      alerts.push(
        `Open rate ${(mailbox.openRate * 100).toFixed(1)}% (low)`
      );
    }

    return alerts;
  };

  const statusVariants: Record<string, "success" | "warning" | "destructive" | "default"> = {
    WARM: "success",
    WARMING: "warning",
    NOT_STARTED: "default",
    COOLING: "warning",
    DISABLED: "destructive",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Mailbox Health
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {mailboxes.length} sender mailbox{mailboxes.length !== 1 ? "es" : ""}
        </p>
      </div>

      {/* Mailbox Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mailboxes.map((mailbox) => {
          const alerts = getAlertStatus(mailbox);
          const bounceRate = mailbox.sentCount > 0
            ? ((mailbox.bounceCount / mailbox.sentCount) * 100).toFixed(1)
            : "0.0";

          return (
            <Card
              key={mailbox.id}
              className={alerts.length > 0 ? "border-amber-300 dark:border-amber-700" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {mailbox.email}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {mailbox.senderName}
                    </p>
                  </div>
                  <Badge variant={statusVariants[mailbox.warmupStatus]}>
                    {mailbox.warmupStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Active
                  </span>
                  <Badge variant={mailbox.isActive ? "success" : "destructive"}>
                    {mailbox.isActive ? "Active" : "Disabled"}
                  </Badge>
                </div>

                {/* Daily Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Daily Usage
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {mailbox.sentCount} / {mailbox.dailyMax}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        mailbox.sentCount > mailbox.dailyMax * 0.8
                          ? "bg-red-600"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          (mailbox.sentCount / mailbox.dailyMax) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Health Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Sent
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {mailbox.sentCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Replies
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {mailbox.replyCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Bounces
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {bounceRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Spam
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {mailbox.spamCount}
                    </p>
                  </div>
                </div>

                {/* Reply Rate */}
                {mailbox.sentCount > 0 && (
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Reply Rate
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {((mailbox.replyCount / mailbox.sentCount) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}

                {/* Open Rate */}
                {mailbox.openRate !== null && (
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Open Rate
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {(mailbox.openRate * 100).toFixed(1)}%
                    </p>
                  </div>
                )}

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Alerts
                    </p>
                    <ul className="text-xs text-amber-900 dark:text-amber-100 space-y-1">
                      {alerts.map((alert, i) => (
                        <li key={i}>• {alert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reputation Notes */}
                {mailbox.reputationNotes && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded p-3">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      Notes
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-400">
                      {mailbox.reputationNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mailboxes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              No mailboxes configured
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
