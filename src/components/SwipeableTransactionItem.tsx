import React, { useRef, useState } from 'react';
import { Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Trash2, CloudCheck, CloudOff } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n';
import { CurrencyCode, formatMoney } from '../utils/currency';

interface SwipeableTransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  lang: Language;
  currency: CurrencyCode;
}

export const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = ({
  transaction,
  onDelete,
  lang,
  currency,
}) => {
  const t = TRANSLATIONS[lang];
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isMouseDown = useRef(false);

  const DISMISS_THRESHOLD = 110; // Pixel threshold to trigger Gmail-style delete

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
    touchCurrentX.current = clientX;
    setIsDragging(true);
    isMouseDown.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging && !isMouseDown.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchCurrentX.current = clientX;
    const delta = clientX - touchStartX.current;
    // Bound delta with damping past threshold
    if (Math.abs(delta) > DISMISS_THRESHOLD) {
      const sign = delta > 0 ? 1 : -1;
      const extra = Math.abs(delta) - DISMISS_THRESHOLD;
      setOffsetX(sign * (DISMISS_THRESHOLD + extra * 0.35));
    } else {
      setOffsetX(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging && !isMouseDown.current) return;
    setIsDragging(false);
    isMouseDown.current = false;

    if (Math.abs(offsetX) >= DISMISS_THRESHOLD) {
      // Trigger delete slide out animation
      setIsDeleting(true);
      const direction = offsetX > 0 ? 400 : -400;
      setOffsetX(direction);
      setTimeout(() => {
        onDelete(transaction.id);
      }, 250);
    } else {
      // Spring back
      setOffsetX(0);
    }
  };

  const isExpense = transaction.type === 'expense';
  const categoryTranslated = (t.categories as Record<string, string>)[transaction.categoryName] || transaction.categoryName;
  const paymentTranslated = (t.paymentMethods as Record<string, string>)[transaction.paymentMethod] || transaction.paymentMethod;

  const formatDate = (timestamp?: number) => {
    const validTimestamp = typeof timestamp === 'number' && !isNaN(timestamp) ? timestamp : Date.now();
    const date = new Date(validTimestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `${t.today}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const swipeProgress = Math.min(1, Math.abs(offsetX) / DISMISS_THRESHOLD);
  const isSwipedLeft = offsetX < -10;
  const isSwipedRight = offsetX > 10;
  const isSwiping = isDragging || Math.abs(offsetX) > 2;

  return (
    <div
      className={`relative overflow-hidden rounded-xl select-none transition-all duration-200 ${
        isDeleting ? 'max-h-0 opacity-0 mb-0 pointer-events-none' : 'max-h-24 mb-2'
      }`}
    >
      {/* Background Reveal (Only rendered/visible when actually sliding) */}
      <div
        style={{
          display: isSwiping ? 'flex' : 'none',
          opacity: isSwiping ? Math.min(1, Math.abs(offsetX) / 15) : 0,
          pointerEvents: isSwiping ? 'auto' : 'none',
        }}
        className={`absolute inset-0 flex items-center justify-between px-5 bg-rose-600 text-white rounded-xl transition-all duration-150 ${
          swipeProgress >= 0.8 ? 'bg-rose-700' : 'bg-rose-500'
        }`}
      >
        {/* Left icon for swipe-right */}
        <div
          className={`flex items-center gap-2 transition-all duration-150 ${
            isSwipedRight ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 -translate-x-4'
          }`}
        >
          <Trash2 size={20} className={swipeProgress >= 1 ? 'animate-bounce' : ''} />
          <span className="text-xs font-bold uppercase tracking-wider">
            {lang === 'ro' ? 'Șterge' : 'Delete'}
          </span>
        </div>

        {/* Right icon for swipe-left */}
        <div
          className={`flex items-center gap-2 ml-auto transition-all duration-150 ${
            isSwipedLeft ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 translate-x-4'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider">
            {lang === 'ro' ? 'Șterge' : 'Delete'}
          </span>
          <Trash2 size={20} className={swipeProgress >= 1 ? 'animate-bounce' : ''} />
        </div>
      </div>

      {/* Foreground Swipeable Card Surface */}
      <div
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className="relative z-10 flex items-center justify-between p-3 bg-white border border-slate-100 hover:border-slate-200 rounded-xl shadow-xs cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {/* Left: Category Icon & Details */}
        <div className="flex items-center gap-3 min-w-0 pointer-events-none">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: transaction.categoryColor }}
          >
            <CategoryIcon name={transaction.categoryIcon} size={18} className="w-4.5 h-4.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-800 truncate">{transaction.title}</p>
              {transaction.syncedToCloud ? (
                <span title={t.firebaseSynced} className="text-emerald-500 shrink-0">
                  <CloudCheck size={13} />
                </span>
              ) : (
                <span title={t.offlineLocalMode} className="text-slate-300 shrink-0">
                  <CloudOff size={13} />
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span className="truncate max-w-[120px]">{categoryTranslated}</span>
              <span>•</span>
              <span className="shrink-0">{formatDate(transaction.timestamp)}</span>
              {transaction.paymentMethod && (
                <>
                  <span>•</span>
                  <span className="hidden sm:inline bg-slate-100 px-1.5 py-0.2 rounded-xs text-slate-500 font-mono text-[10px]">
                    {paymentTranslated}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount & Manual Delete fallback button */}
        <div className="flex items-center gap-2.5 shrink-0 ml-2">
          <span
            className={`text-sm font-bold tracking-tight pointer-events-none ${
              isExpense ? 'text-slate-900' : 'text-emerald-600'
            }`}
          >
            {isExpense ? '-' : '+'}{formatMoney(transaction.amount, currency)}
          </span>

          <button
            id={`btn-manual-delete-${transaction.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title={lang === 'ro' ? 'Șterge tranzacția' : 'Delete transaction'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
