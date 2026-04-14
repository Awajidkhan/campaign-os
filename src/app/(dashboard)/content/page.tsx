export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPrisma } from "@/lib/prisma";

export default async function ContentCalendarPage() {
  const prisma = getPrisma();
  const contentItems = await prisma.contentItem.findMany({
    include: {
      profile: true,
      creator: true,
    },
    orderBy: { publishDate: "asc" },
  });

  // Group by profile and week
  const itemsByProfile = contentItems.reduce(
    (acc, item) => {
      const profileName = item.profile.name;
      if (!acc[profileName]) {
        acc[profileName] = [];
      }
      acc[profileName].push(item);
      return acc;
    },
    {} as Record<string, typeof contentItems>
  );

  // Get weeks represented in the data
  const weeks = new Set<string>();
  contentItems.forEach((item) => {
    const date = new Date(item.publishDate);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weeks.add(weekStart.toISOString().split("T")[0]);
  });

  const sortedWeeks = Array.from(weeks).sort().slice(-4); // Last 4 weeks

  const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    DRAFT: "default",
    PENDING_APPROVAL: "warning",
    APPROVED: "success",
    SCHEDULED: "secondary",
    PUBLISHED: "success",
    REJECTED: "destructive",
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getItemsForDate = (profile: string, date: Date) => {
    return itemsByProfile[profile]?.filter((item) => {
      const itemDate = new Date(item.publishDate);
      return (
        itemDate.toDateString() === date.toDateString()
      );
    }) || [];
  };

  const getWeekDates = (weekStart: string) => {
    const start = new Date(weekStart);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Content Calendar
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {contentItems.length} content item{contentItems.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Content by Profile */}
      <div className="space-y-8">
        {Object.entries(itemsByProfile).map(([profileName, items]) => (
          <div key={profileName} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {profileName}
            </h2>

            {/* Weekly View */}
            {sortedWeeks.length > 0 ? (
              <div className="space-y-4">
                {sortedWeeks.map((weekStart) => {
                  const weekDates = getWeekDates(weekStart);
                  const weekItems = weekDates.flatMap((date) =>
                    getItemsForDate(profileName, date)
                  );

                  if (weekItems.length === 0) return null;

                  return (
                    <Card key={weekStart}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Week of {new Date(weekStart).toLocaleDateString()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {weekDates.map((date, i) => {
                            const dateItems = getItemsForDate(profileName, date);
                            const dayName = dayNames[date.getDay()];

                            return (
                              <div key={date.toISOString()}>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                  {dayName}, {date.toLocaleDateString()}
                                </h4>

                                {dateItems.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">
                                    No content scheduled
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {dateItems.map((item) => (
                                      <div
                                        key={item.id}
                                        className={`p-3 rounded-lg border ${
                                          item.status === "PENDING_APPROVAL"
                                            ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
                                            : "border-slate-200 dark:border-slate-700"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                          <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-white">
                                              {item.topic || "(Untitled)"}
                                            </p>
                                            {item.pillar && (
                                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                Pillar: {item.pillar}
                                              </p>
                                            )}
                                          </div>
                                          <Badge
                                            variant={
                                              statusVariants[item.status] ||
                                              "default"
                                            }
                                            className="flex-shrink-0"
                                          >
                                            {item.status}
                                          </Badge>
                                        </div>

                                        {/* Draft Preview */}
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                          {item.draftText.substring(0, 150)}
                                          {item.draftText.length > 150 ? "..." : ""}
                                        </p>

                                        {/* Metadata */}
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          Created by {item.creator.firstName}{" "}
                                          {item.creator.lastName}
                                        </p>

                                        {/* Approval Actions */}
                                        {item.status === "PENDING_APPROVAL" && (
                                          <div className="flex gap-2 mt-3">
                                            <Button
                                              size="sm"
                                              variant="default"
                                              className="h-7 text-xs"
                                            >
                                              Approve
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-7 text-xs"
                                            >
                                              Request Revision
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {i < weekDates.length - 1 && (
                                  <div className="mt-4 pt-4 border-b border-slate-200 dark:border-slate-700"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    No content scheduled for {profileName}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

      {Object.keys(itemsByProfile).length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              No content items yet
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending Approval Summary */}
      {contentItems.filter((item) => item.status === "PENDING_APPROVAL")
        .length > 0 && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">
              Pending Approval
            </CardTitle>
            <CardDescription className="text-amber-800 dark:text-amber-200">
              {
                contentItems.filter((item) => item.status === "PENDING_APPROVAL")
                  .length
              }{" "}
              item{
                contentItems.filter((item) => item.status === "PENDING_APPROVAL")
                  .length !== 1
                  ? "s"
                  : ""
              }{" "}
              awaiting approval
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
