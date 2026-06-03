import { useQuery } from '@tanstack/react-query';
import { Gift, MessageCircle, Heart, Calendar, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';
import { customersApi } from '../../api/customers.api';
import { formatCurrency } from '../../utils/formatCurrency';

function getDayLabel(days: number) {
  if (days === 0) return { label: 'Today! 🎉', color: 'bg-rose-100 text-rose-700' };
  if (days === 1) return { label: 'Tomorrow', color: 'bg-orange-100 text-orange-700' };
  if (days <= 7)  return { label: `In ${days} days`, color: 'bg-amber-100 text-amber-700' };
  return { label: `In ${days} days`, color: 'bg-slate-100 text-slate-600' };
}

export function BirthdayRemindersPage() {
  const { data: upcoming = [], isLoading } = useQuery({
    queryKey: ['upcoming-birthdays'],
    queryFn: () => customersApi.getUpcomingBirthdays(30),
  });

  if (isLoading) return <PageLoader />;

  const birthdays    = upcoming.filter((u: any) => u.type === 'Birthday');
  const anniversaries = upcoming.filter((u: any) => u.type === 'Anniversary');

  const buildMessage = (item: any) => {
    if (item.type === 'Birthday')
      return `🎂 Happy Birthday ${item.name}! 🎉\n\nWishing you a wonderful day filled with joy! As our valued customer, here's a special birthday treat from us — reply to know more! 🎁\n\nWith love,\nTeam`;
    return `🥂 Happy Anniversary ${item.name}! 🎉\n\nThank you for being such a wonderful customer. Wishing you and your loved ones all the best! 💐\n\nWarm regards,\nTeam`;
  };

  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-10">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
        {type === 'Birthday' ? <Gift className="w-6 h-6 text-slate-200" /> : <Heart className="w-6 h-6 text-slate-200" />}
      </div>
      <p className="text-sm font-medium text-slate-500">No upcoming {type.toLowerCase()}s</p>
      <p className="text-xs text-slate-400 mt-1">
        Add birthday dates to customer profiles to see reminders here.
      </p>
    </div>
  );

  const ItemCard = ({ item }: { item: any }) => {
    const { label, color } = getDayLabel(item.daysUntil);
    const waLink = item.phone
      ? `https://wa.me/${item.phone.replace(/\D/g, '')}?text=${encodeURIComponent(buildMessage(item))}`
      : null;

    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${item.type === 'Birthday' ? 'bg-rose-100' : 'bg-pink-100'}`}>
          {item.type === 'Birthday' ? '🎂' : '💝'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-slate-900">{item.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
          </div>
          <p className="text-xs text-slate-500">
            {item.phone ?? 'No phone'} · {item.totalOrders} orders · {formatCurrency(item.totalSpend)} spent
          </p>
        </div>
        {waLink && (
          <a href={waLink} target="_blank" rel="noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition whitespace-nowrap">
            <MessageCircle className="w-3.5 h-3.5" /> Wish on WhatsApp
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-rose-500" />
          Birthday & Anniversary Reminders
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Upcoming customer birthdays and anniversaries — send a personalised WhatsApp wish to delight them.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="font-semibold text-slate-600">No upcoming events</p>
            <p className="text-sm text-slate-400 mt-1">
              Go to a customer profile and add their birthday date to start seeing reminders here.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Upcoming today & this week */}
          {upcoming.filter((u: any) => u.daysUntil <= 7).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-rose-500" />
                <h2 className="font-bold text-slate-900">This week</h2>
                <span className="text-xs bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                  {upcoming.filter((u: any) => u.daysUntil <= 7).length}
                </span>
              </div>
              <div className="space-y-2">
                {upcoming.filter((u: any) => u.daysUntil <= 7).map((item: any) => (
                  <ItemCard key={`${item.id}-${item.type}`} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Birthdays */}
          <div>
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              🎂 Birthdays
              <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold">{birthdays.length}</span>
            </h2>
            {birthdays.length === 0 ? <Card><EmptyState type="Birthday" /></Card> : (
              <div className="space-y-2">
                {birthdays.map((item: any) => <ItemCard key={`${item.id}-birthday`} item={item} />)}
              </div>
            )}
          </div>

          {/* Anniversaries */}
          <div>
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              💝 Anniversaries
              <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-semibold">{anniversaries.length}</span>
            </h2>
            {anniversaries.length === 0 ? <Card><EmptyState type="Anniversary" /></Card> : (
              <div className="space-y-2">
                {anniversaries.map((item: any) => <ItemCard key={`${item.id}-anniversary`} item={item} />)}
              </div>
            )}
          </div>
        </>
      )}

      <Card>
        <p className="text-xs text-slate-400 text-center">
          💡 Tip: Add birthday/anniversary dates to customer profiles → go to a customer → click Edit.
          Customers with upcoming dates in the next 30 days appear here automatically.
        </p>
      </Card>
    </div>
  );
}
