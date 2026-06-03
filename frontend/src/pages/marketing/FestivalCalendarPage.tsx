import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Sparkles, Gift } from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface Festival {
  name: string;
  date: string; // MM-DD
  emoji: string;
  color: string;
  gradient: string;
  messageSuggestion: string;
  hashtagSuggestion: string;
}

const FESTIVALS: Festival[] = [
  { name: 'Makar Sankranti',    date: '01-14', emoji: '🪁', color: 'text-orange-600', gradient: 'from-orange-400 to-yellow-500',  messageSuggestion: 'Wishing you a colourful Makar Sankranti! Celebrate with our special offers.',                    hashtagSuggestion: '#MakarSankranti #HappySankranti #KiteDay'    },
  { name: 'Republic Day',       date: '01-26', emoji: '🇮🇳', color: 'text-blue-700',   gradient: 'from-blue-600 to-indigo-600',    messageSuggestion: 'Happy Republic Day! Proud to serve our great nation.',                                       hashtagSuggestion: '#RepublicDay #JaiHind #ProudIndian'           },
  { name: 'Valentines Day',     date: '02-14', emoji: '💝', color: 'text-rose-600',    gradient: 'from-rose-500 to-pink-500',      messageSuggestion: 'Share love this Valentine\'s Day! Gift something special.',                                  hashtagSuggestion: '#ValentinesDay #GiftIdeas #LoveGifts'         },
  { name: 'Holi',               date: '03-14', emoji: '🎨', color: 'text-purple-600',  gradient: 'from-purple-500 to-pink-500',    messageSuggestion: 'Happy Holi! Enjoy our colourful sale this festival of colours.',                            hashtagSuggestion: '#HappyHoli #FestivalOfColours #HoliSale'      },
  { name: 'Ugadi / Gudi Padwa', date: '03-30', emoji: '🌸', color: 'text-green-600',   gradient: 'from-green-500 to-teal-500',     messageSuggestion: 'Wishing you a prosperous New Year! Special offers to celebrate.',                           hashtagSuggestion: '#Ugadi #GudiPadwa #NewYear'                   },
  { name: 'Ram Navami',         date: '04-06', emoji: '🙏', color: 'text-amber-700',   gradient: 'from-amber-500 to-orange-500',   messageSuggestion: 'Happy Ram Navami! May this auspicious day bring you joy and peace.',                        hashtagSuggestion: '#RamNavami #JaiShreeRam'                       },
  { name: 'Eid ul-Fitr',        date: '04-10', emoji: '🌙', color: 'text-emerald-700', gradient: 'from-emerald-500 to-teal-500',   messageSuggestion: 'Eid Mubarak! Celebrate with our special Eid collection.',                                   hashtagSuggestion: '#EidMubarak #Eid2025 #EidCollection'          },
  { name: 'Mothers Day',        date: '05-11', emoji: '💐', color: 'text-rose-600',    gradient: 'from-rose-400 to-pink-400',      messageSuggestion: 'Celebrate Mom this Mother\'s Day! Gift her something she\'ll love.',                        hashtagSuggestion: '#MothersDay #GiftForMom #LoveYouMom'          },
  { name: 'Eid ul-Adha',        date: '06-07', emoji: '⭐', color: 'text-green-700',   gradient: 'from-green-600 to-emerald-600',  messageSuggestion: 'Eid ul-Adha Mubarak! Wishing you and your family blessings.',                              hashtagSuggestion: '#BakraEid #EidulAdha #EidMubarak'             },
  { name: 'Independence Day',   date: '08-15', emoji: '🇮🇳', color: 'text-green-700',   gradient: 'from-green-600 to-orange-500',   messageSuggestion: 'Happy Independence Day! Freedom sale — special prices all day.',                            hashtagSuggestion: '#IndependenceDay #JaiHind #FreedomSale'       },
  { name: 'Onam',               date: '09-05', emoji: '🌺', color: 'text-teal-600',    gradient: 'from-teal-500 to-green-500',     messageSuggestion: 'Happy Onam! May the harvest festival bring joy and prosperity.',                            hashtagSuggestion: '#HappyOnam #OnamFestival #ThiruvonamSale'     },
  { name: 'Navratri',           date: '10-02', emoji: '🪔', color: 'text-orange-600',  gradient: 'from-orange-500 to-red-500',     messageSuggestion: 'Navratri special! Shop our festive collection for the 9 nights of celebration.',            hashtagSuggestion: '#Navratri #GarbaFestival #NavratriSale'       },
  { name: 'Dussehra',           date: '10-12', emoji: '🏹', color: 'text-red-600',     gradient: 'from-red-500 to-orange-500',     messageSuggestion: 'Happy Dussehra! May good always triumph. Special offers today.',                           hashtagSuggestion: '#HappyDussehra #Vijayadashami #DussehraOffer' },
  { name: 'Diwali',             date: '10-20', emoji: '🪔', color: 'text-amber-600',   gradient: 'from-amber-500 to-yellow-500',   messageSuggestion: 'Happy Diwali! Light up your celebrations with our Diwali special collection.',              hashtagSuggestion: '#HappyDiwali #DiwaliSale #FestiveOffer'       },
  { name: 'Bhai Dooj',          date: '10-23', emoji: '🎁', color: 'text-violet-600',  gradient: 'from-violet-500 to-purple-500',  messageSuggestion: 'Happy Bhai Dooj! Gift your sibling something special from our collection.',                hashtagSuggestion: '#BhaiDooj #SiblingLove #GiftForBrother'      },
  { name: 'Christmas',          date: '12-25', emoji: '🎄', color: 'text-green-700',   gradient: 'from-green-600 to-red-500',      messageSuggestion: 'Merry Christmas! Spread joy with our Christmas special offers.',                           hashtagSuggestion: '#MerryChristmas #ChristmasGifts #HolidaySale' },
  { name: 'New Year Eve',       date: '12-31', emoji: '🎊', color: 'text-blue-600',    gradient: 'from-blue-500 to-violet-500',    messageSuggestion: 'Happy New Year! Start the year with something new from our store.',                        hashtagSuggestion: '#HappyNewYear #NewYearSale #NewBeginnings'    },
];

function getDaysUntil(mmdd: string): number {
  const now = new Date();
  const year = now.getFullYear();
  const [mm, dd] = mmdd.split('-').map(Number);
  let target = new Date(year, mm - 1, dd);
  if (target < now) target = new Date(year + 1, mm - 1, dd);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDayLabel(days: number): { label: string; color: string } {
  if (days === 0) return { label: 'Today! 🎉', color: 'text-rose-600 font-bold' };
  if (days <= 3)  return { label: `In ${days} day${days > 1 ? 's' : ''} ⚡`, color: 'text-red-600 font-semibold' };
  if (days <= 14) return { label: `In ${days} days`, color: 'text-amber-600 font-medium' };
  return { label: `In ${days} days`, color: 'text-slate-400' };
}

export function FestivalCalendarPage() {
  const navigate = useNavigate();

  const sorted = [...FESTIVALS]
    .map(f => ({ ...f, daysUntil: getDaysUntil(f.date) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const upcoming   = sorted.filter(f => f.daysUntil <= 30);
  const thisMonth  = sorted.filter(f => f.daysUntil > 30 && f.daysUntil <= 90);
  const later      = sorted.filter(f => f.daysUntil > 90);

  const handleCreate = (f: typeof sorted[0]) => {
    const msg = encodeURIComponent(f.messageSuggestion);
    navigate(`/marketing/campaigns/new?template=${encodeURIComponent(f.name)}&message=${msg}`);
  };

  const handleSocialPost = (_f: typeof sorted[0]) => {
    navigate(`/ai/social-post`);
  };

  const FestivalCard = ({ f }: { f: typeof sorted[0] }) => {
    const { label, color } = getDayLabel(f.daysUntil);
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all group">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
          {f.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{f.name}</p>
          <p className={`text-xs mt-0.5 ${color}`}>{label}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleSocialPost(f)}
            className="px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition whitespace-nowrap flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> AI Post
          </button>
          <button
            onClick={() => handleCreate(f)}
            className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition whitespace-nowrap flex items-center gap-1"
          >
            Campaign <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-amber-500" />
          Festival Campaign Calendar
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Never miss a festival. Launch campaigns and AI posts with one click.
        </p>
      </div>

      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-rose-500" />
            <h2 className="font-bold text-slate-900">Coming up (next 30 days)</h2>
            <span className="text-xs bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full">{upcoming.length} festivals</span>
          </div>
          <div className="space-y-2">
            {upcoming.map(f => <FestivalCard key={f.name} f={f} />)}
          </div>
        </div>
      )}

      {thisMonth.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-900 mb-3 text-sm text-slate-500 uppercase tracking-wide">Next 3 months</h2>
          <div className="space-y-2">
            {thisMonth.map(f => <FestivalCard key={f.name} f={f} />)}
          </div>
        </div>
      )}

      {later.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-900 mb-3 text-sm text-slate-500 uppercase tracking-wide">Later this year</h2>
          <div className="space-y-2">
            {later.map(f => <FestivalCard key={f.name} f={f} />)}
          </div>
        </div>
      )}

      <Card>
        <p className="text-xs text-slate-400 text-center">
          Festival dates are approximate and may vary by region. Lunar festival dates are fixed for 2025.
        </p>
      </Card>
    </div>
  );
}
