import React from 'react';
import { useSiteContent } from '../../context/ContentContext.tsx';
import { Mail, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { ContactDetail } from '../../data/siteContent.ts';

export const ContactEditor: React.FC = () => {
  const { siteData, updateContact, updateConfig } = useSiteContent();
  const contact = siteData.contact;
  const config = siteData.config;

  const updateDetail = (index: number, patch: Partial<ContactDetail>) => {
    const details = [...contact.details];
    details[index] = { ...details[index], ...patch };
    updateContact({ details });
  };

  const moveDetail = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= contact.details.length) return;
    const details = [...contact.details];
    const temp = details[index];
    details[index] = details[targetIdx];
    details[targetIdx] = temp;
    updateContact({ details });
  };

  const removeDetail = (index: number) => {
    if (contact.details.length <= 1) {
      alert('Must have at least one verified contact coordinate.');
      return;
    }
    const details = contact.details.filter((_, i) => i !== index);
    updateContact({ details });
  };

  const addDetail = () => {
    const newDetail: ContactDetail = {
      label: 'Direct Channel',
      value: '+60 11-0000 0000',
      subtext: 'Direct Client Relations',
      href: 'tel:+601100000000',
      type: 'tel',
    };
    updateContact({ details: [...contact.details, newDetail] });
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-4">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-2 mb-4">
          <Mail className="size-4 text-[#2563EB]" />
          Section 06 · Contact & Conversion Copy
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Index Number
            </label>
            <input
              type="text"
              value={contact.num}
              onChange={(e) => updateContact({ num: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={contact.eyebrow}
              onChange={(e) => updateContact({ eyebrow: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Section Headline
          </label>
          <input
            type="text"
            value={contact.headline}
            onChange={(e) => updateContact({ headline: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Intro Invitation Text
          </label>
          <textarea
            rows={2}
            value={contact.intro}
            onChange={(e) => updateContact({ intro: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-[#2563EB] focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Verified Contact Details Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Verified Contact Coordinates ({contact.details.length})
          </h4>
          <button
            type="button"
            onClick={addDetail}
            className="flex items-center gap-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition"
          >
            <Plus className="size-3.5" />
            Add Channel
          </button>
        </div>

        {contact.details.map((detail, idx) => (
          <div key={idx} className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-white text-sm">
                Channel 0{idx + 1} · {detail.label}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={() => moveDetail(idx, 'up')}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={idx === contact.details.length - 1}
                  onClick={() => moveDetail(idx, 'down')}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Delete Channel"
                  onClick={() => removeDetail(idx)}
                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 ml-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Channel Label</label>
                <input
                  type="text"
                  value={detail.label}
                  onChange={(e) => updateDetail(idx, { label: e.target.value })}
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Display Value</label>
                <input
                  type="text"
                  value={detail.value}
                  onChange={(e) => updateDetail(idx, { value: e.target.value })}
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Role Subtext</label>
                <input
                  type="text"
                  value={detail.subtext || ''}
                  onChange={(e) => updateDetail(idx, { subtext: e.target.value })}
                  placeholder="e.g. Executive Director"
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Action Link (Href)</label>
                <input
                  type="text"
                  value={detail.href || ''}
                  onChange={(e) => updateDetail(idx, { href: e.target.value })}
                  placeholder="tel:+60... or mailto:..."
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inquiry Form Card Settings */}
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3">
        <h4 className="font-display font-bold text-white text-sm">
          Inquiry Card & Form Settings
        </h4>

        <div>
          <label className="block text-xs text-white/60 mb-1">Card Title</label>
          <input
            type="text"
            value={contact.cardTitle}
            onChange={(e) => updateContact({ cardTitle: e.target.value })}
            className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-white/60 mb-1">Card Instructions</label>
          <textarea
            rows={2}
            value={contact.cardIntro}
            onChange={(e) => updateContact({ cardIntro: e.target.value })}
            className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">Recipient Email</label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => updateConfig({ email: e.target.value })}
              className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Regional Coverage</label>
            <input
              type="text"
              value={config.regions}
              onChange={(e) => updateConfig({ regions: e.target.value })}
              className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
