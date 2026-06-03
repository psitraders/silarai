import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { businessApi } from '../../api/business.api';
import type { BusinessDto } from '../../api/business.api';
import { COUNTRIES, SUPPORTED_LANGUAGES } from '../../data/countries';

export function BusinessProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: businessApi.getBusiness,
  });

  const { register, handleSubmit, reset } = useForm<BusinessDto>();

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: BusinessDto) => businessApi.updateBusiness(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Business Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your store and contact details.</p>
      </div>

      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-6">
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Store Info</h2>
          <div className="space-y-4">
            <Input label="Business Name *" {...register('name', { required: true })} />
            <Input label="Category" placeholder="e.g. Clothing, Jewellery" {...register('category')} />
            <Input label="Description" {...register('description')} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                {...register('currency')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <optgroup label="Asia">
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="SGD">SGD — Singapore Dollar (S$)</option>
                  <option value="MYR">MYR — Malaysian Ringgit (RM)</option>
                  <option value="IDR">IDR — Indonesian Rupiah (Rp)</option>
                  <option value="PHP">PHP — Philippine Peso (₱)</option>
                  <option value="THB">THB — Thai Baht (฿)</option>
                  <option value="VND">VND — Vietnamese Dong (₫)</option>
                  <option value="JPY">JPY — Japanese Yen (¥)</option>
                  <option value="KRW">KRW — South Korean Won (₩)</option>
                  <option value="CNY">CNY — Chinese Yuan (¥)</option>
                  <option value="HKD">HKD — Hong Kong Dollar (HK$)</option>
                  <option value="TWD">TWD — Taiwan Dollar (NT$)</option>
                  <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
                  <option value="PKR">PKR — Pakistani Rupee (₨)</option>
                  <option value="LKR">LKR — Sri Lankan Rupee (Rs)</option>
                  <option value="NPR">NPR — Nepalese Rupee (₨)</option>
                </optgroup>
                <optgroup label="Middle East &amp; Africa">
                  <option value="AED">AED — UAE Dirham (د.إ)</option>
                  <option value="SAR">SAR — Saudi Riyal (﷼)</option>
                  <option value="QAR">QAR — Qatari Riyal (﷼)</option>
                  <option value="KWD">KWD — Kuwaiti Dinar (KD)</option>
                  <option value="BHD">BHD — Bahraini Dinar (BD)</option>
                  <option value="OMR">OMR — Omani Rial (﷼)</option>
                  <option value="EGP">EGP — Egyptian Pound (E£)</option>
                  <option value="ZAR">ZAR — South African Rand (R)</option>
                  <option value="NGN">NGN — Nigerian Naira (₦)</option>
                  <option value="KES">KES — Kenyan Shilling (KSh)</option>
                  <option value="GHS">GHS — Ghanaian Cedi (GH₵)</option>
                </optgroup>
                <optgroup label="Americas">
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="CAD">CAD — Canadian Dollar (CA$)</option>
                  <option value="MXN">MXN — Mexican Peso (MX$)</option>
                  <option value="BRL">BRL — Brazilian Real (R$)</option>
                  <option value="ARS">ARS — Argentine Peso ($)</option>
                  <option value="COP">COP — Colombian Peso (COP$)</option>
                  <option value="CLP">CLP — Chilean Peso (CLP$)</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="CHF">CHF — Swiss Franc (CHF)</option>
                  <option value="SEK">SEK — Swedish Krona (kr)</option>
                  <option value="NOK">NOK — Norwegian Krone (kr)</option>
                  <option value="DKK">DKK — Danish Krone (kr)</option>
                  <option value="PLN">PLN — Polish Złoty (zł)</option>
                  <option value="CZK">CZK — Czech Koruna (Kč)</option>
                  <option value="HUF">HUF — Hungarian Forint (Ft)</option>
                  <option value="RON">RON — Romanian Leu (lei)</option>
                  <option value="TRY">TRY — Turkish Lira (₺)</option>
                  <option value="UAH">UAH — Ukrainian Hryvnia (₴)</option>
                </optgroup>
                <optgroup label="Oceania">
                  <option value="AUD">AUD — Australian Dollar (A$)</option>
                  <option value="NZD">NZD — New Zealand Dollar (NZ$)</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <select {...register('country')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Language</label>
              <select {...register('language')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.nativeLabel} — {l.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Changes the language of the entire dashboard.</p>
            </div>
            <Input label="Welcome Message" placeholder="Shown on storefront" {...register('welcomeText')} />
            <Input label="Delivery Info" placeholder="e.g. Delivery in 3-5 days across India" {...register('deliveryInfo')} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Social & Contact</h2>
          <div className="space-y-4">
            <Input label="WhatsApp Number" placeholder="+91 9876543210" {...register('whatsAppNumber')} />
            <Input label="Instagram Handle" placeholder="@yourstore" {...register('instagramHandle')} />
            <Input label="Facebook Page URL" {...register('facebookPageUrl')} />
          </div>
        </Card>

        <div className="flex gap-3 items-center">
          <Button type="submit" loading={mutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          {mutation.isSuccess && (
            <p className="text-sm text-green-600 font-medium">Saved successfully!</p>
          )}
        </div>
      </form>
    </div>
  );
}
