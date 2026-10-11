import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Tag, Award, Sparkles, Megaphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BannerBadge, PromoBanner } from '../../types';

export const PromoBannerCarousel: React.FC = () => {
  const { banners, products, openProductModal, theme } = useApp();
  const activeBanners = banners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance banner every 6 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];
  const targetProduct = currentBanner.targetProductId
    ? products.find((p) => p.id === currentBanner.targetProductId)
    : null;

  const getBadgeIcon = (badge: BannerBadge) => {
    switch (badge) {
      case 'PROMOCIÓN':
        return <Tag className="w-3.5 h-3.5" />;
      case 'PATROCINIO':
        return <Award className="w-3.5 h-3.5" />;
      case 'NOVEDAD':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'ANUNCIO':
        return <Megaphone className="w-3.5 h-3.5" />;
    }
  };

  const getBadgeColor = (badge: BannerBadge) => {
    switch (badge) {
      case 'PROMOCIÓN':
        return 'bg-rose-500/90 text-white';
      case 'PATROCINIO':
        return 'bg-amber-500/90 text-slate-950 font-bold';
      case 'NOVEDAD':
        return 'bg-indigo-600/90 text-white';
      case 'ANUNCIO':
        return 'bg-sky-600/90 text-white';
    }
  };

  const handleBannerClick = () => {
    if (currentBanner.targetProductId) {
      openProductModal(currentBanner.targetProductId);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-900 text-white group">
      {/* Background Image with Contrast Scrim */}
      <div className="relative aspect-[16/8] sm:aspect-[21/9] md:aspect-[24/9] w-full overflow-hidden">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // CSS gradient fallback if custom image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Measured Contrast Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end">
          <div className="max-w-xl space-y-2">
            {/* Badge & Highlight */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase ${getBadgeColor(
                  currentBanner.badge
                )}`}
              >
                {getBadgeIcon(currentBanner.badge)}
                <span>{currentBanner.badge}</span>
              </span>

              {currentBanner.discountHighlight && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white rounded-md">
                  {currentBanner.discountHighlight}
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white line-clamp-2">
              {currentBanner.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
              {currentBanner.subtitle}
            </p>

            {/* Target Product Action */}
            <div className="pt-2">
              {targetProduct ? (
                <button
                  onClick={handleBannerClick}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 ${theme.buttonClass}`}
                >
                  <span>Ver {targetProduct.name}</span>
                  <span className="opacity-80">· ${targetProduct.price}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              ) : (
                <div className="text-xs text-slate-300">
                  {currentBanner.tagline || 'Promoción especial activa'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carousel navigation arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
              )
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
            aria-label="Banner siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
                aria-label={`Ir al banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
