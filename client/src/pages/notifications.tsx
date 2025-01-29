import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const recentlyUnlockedLegalEvents = [
  { id: 1, title: "Case Judgment Released", date: "2023-05-15" },
  { id: 2, title: "New Legal Amendment Effective", date: "2023-01-01" },
];

const upcomingLegalDeadlines = [
  { id: 1, title: "Tax Filing Deadline", daysLeft: 30 },
  { id: 2, title: "Contract Renewal Review", daysLeft: 180 },
];

export default function LegalNotificationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Legal Notifications</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Catch Up</h2>
          {recentlyUnlockedLegalEvents.map((event) => (
            <Card key={event.id} className="mb-2">
              <CardHeader>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Effective from: {event.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Court Hearings</h2>
          {upcomingLegalDeadlines.map((deadline) => (
            <Card key={deadline.id} className="mb-2">
              <CardHeader>
                <CardTitle className="text-2xl">{deadline.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{deadline.daysLeft} days left</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
