/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ruler, Layers, Check, X, Plus } from 'lucide-react';

// 리본 아이콘 (커스텀 SVG)
const RibbonIcon = ({ size, fill, color, strokeWidth, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={fill} 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 12c0 0-1-4-5-4s-5 2-5 4s2 4 5 4s5-4 5-4Z" />
    <path d="M12 12c0 0 1-4 5-4s5 2 5 4s-2 4-5 4s-5-4-5-4Z" />
    <path d="M12 12l-2 6m4-6l2 6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// 별 아이콘 (커스텀 SVG)
const StarIcon = ({ size, fill, color, strokeWidth, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={fill} 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// 장식 종류 정의
const DECORATION_TYPES = {
  ribbon: { name: '리본', icon: RibbonIcon, color: '#ff7eb9' },
  star: { name: '별', icon: StarIcon, color: '#ffcc00' }
};

// 다이어리 종류 적용
const DIARY_TYPES: Record<string, { name: string; hex: string; imageUrl: string; bgSize: string; bgSizeSmall: string }> = {
  sparkleSky: { 
    name: '스파클 - 하늘', 
    hex: '#B5CBE8',
    imageUrl: 'https://i.ibb.co/FLV92PtM/image.png',
    bgSize: '185px 360px',
    bgSizeSmall: 'cover'
  },
  sparklePink: { 
    name: '스파클 - 분홍', 
    hex: '#EBBBD0',
    imageUrl: 'https://i.ibb.co/B2nMDRrV/image.png',
    bgSize: '185px 360px',
    bgSizeSmall: 'cover'
  },
  blim: { 
    name: '블림', 
    hex: '#DCE5F0',
    imageUrl: 'https://i.ibb.co/m5Bd83VV/image.jpg',
    bgSize: 'cover',
    bgSizeSmall: 'cover'
  }
};

const SIZES: Record<string, { name: string; realText: string; width: number; height: number }> = {
  xxs: { name: 'XXS', realText: '190 X 110mm', width: 171, height: 198 },
  xs: { name: 'XS', realText: '205 X 170mm', width: 185, height: 306 },
  s: { name: 'S', realText: '205 X 200mm', width: 185, height: 360 },
  b6: { name: 'B6', realText: '285 X 195mm', width: 257, height: 351 },
  a6: { name: 'A6', realText: '230 X 155mm', width: 207, height: 279 }
};

const getScaledBgSize = (bgSize: string, currentScale: number) => {
  if (bgSize === 'cover' || bgSize === 'contain') return bgSize;
  const parts = bgSize.split(' ');
  if (parts.length === 2) {
    return `${parseFloat(parts[0]) * currentScale}px ${parseFloat(parts[1]) * currentScale}px`;
  }
  return bgSize;
};

export default function App() {
  const [size, setSize] = useState('b6');
  const [customWidth, setCustomWidth] = useState<number | ''>(250);
  const [customHeight, setCustomHeight] = useState<number | ''>(180);
  const [diaryType, setDiaryType] = useState<keyof typeof DIARY_TYPES>('sparkleSky');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // 장식 상태 관리
  const [decorations, setDecorations] = useState<{ id: number; type: keyof typeof DECORATION_TYPES; x: number; y: number }[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const addDecoration = (type: keyof typeof DECORATION_TYPES) => {
    const newId = Date.now();
    setDecorations([...decorations, { id: newId, type, x: 50, y: 50 }]);
  };

  const removeDecoration = (id: number) => {
    setDecorations(decorations.filter(d => d.id !== id));
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.stopPropagation();
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    setDraggingId(id);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingId === null) return;
    if (e.cancelable) e.preventDefault();

    const container = document.getElementById('diary-preview-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setDecorations(decorations.map(d => 
      d.id === draggingId ? { ...d, x: Math.max(-15, Math.min(115, x)), y: Math.max(-15, Math.min(115, y)) } : d
    ));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const scale = isPanelOpen ? 0.55 : 0.8; 
  const rawWidth = size === 'custom' ? ((Number(customWidth) || 200) / 2) * 1.8 : SIZES[size].width;
  const rawHeight = size === 'custom' ? (Number(customHeight) || 150) * 1.8 : SIZES[size].height;

  const currentWidth = rawWidth * scale;
  const currentHeight = rawHeight * scale;
  const currentRealText = size === 'custom' ? `직접 입력 (${customWidth || 0} X ${customHeight || 0}mm)` : `${SIZES[size].name} (${SIZES[size].realText})`;

  const getDecorationInfo = () => {
    if (decorations.length === 0) return '';
    const counts = decorations.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const info = Object.entries(counts)
      .map(([type, count]) => `${DECORATION_TYPES[type as keyof typeof DECORATION_TYPES].name} ${count}개`)
      .join(', ');
    
    return ` • ${info}`;
  };

  return (
    <div 
      className="w-full h-[100dvh] md:max-w-[420px] md:mx-auto bg-gray-50 flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden font-sans overscroll-none"
      style={{ overscrollBehavior: 'none' }}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <header className="absolute top-0 w-full px-5 py-4 z-20 flex justify-between items-center pointer-events-none">
        <h1 className="text-xl font-bold text-gray-900 tracking-tighter drop-shadow-sm bg-white/50 px-3 py-1 rounded-full backdrop-blur-md">
          OBJT
        </h1>
      </header>

      <div className="w-full bg-[#e5e7eb] relative flex flex-col items-center justify-center pt-8 overflow-hidden transition-all duration-500 flex-1">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

        <div 
          id="diary-preview-container"
          className="relative transition-[width,height] duration-500 ease-in-out flex items-center justify-center z-10 shrink-0"
          style={{
            width: `${currentWidth}px`,
            height: `${currentHeight}px`,
            borderRadius: '3px 12px 12px 3px',
            boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.15), 2px 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: DIARY_TYPES[diaryType].hex,
              backgroundImage: `url("${DIARY_TYPES[diaryType].imageUrl}")`,
              backgroundRepeat: 'repeat',
              backgroundSize: getScaledBgSize(DIARY_TYPES[diaryType].bgSize, scale),
              border: '1px solid rgba(0,0,0,0.08)',
              borderRight: 'none',
              borderRadius: 'inherit',
              transition: 'background-size 0.5s ease-in-out, background-color 0.5s ease-in-out'
            }}
          />

          {decorations.map((deco) => {
            const DecoIcon = DECORATION_TYPES[deco.type].icon;
            return (
              <div
                key={deco.id}
                onMouseDown={(e) => handleDragStart(e, deco.id)}
                onTouchStart={(e) => handleDragStart(e, deco.id)}
                className="absolute cursor-move group will-change-transform touch-none"
                style={{
                  left: `${deco.x}%`,
                  top: `${deco.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 30,
                  touchAction: 'none'
                }}
              >
                <DecoIcon 
                  size={64 * scale} 
                  fill={DECORATION_TYPES[deco.type].color} 
                  color="white" 
                  strokeWidth={1.5}
                  className="drop-shadow-md"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); removeDecoration(deco.id); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}

          {diaryType.includes('sparkle') && (
            <div 
              style={{
                position: 'absolute',
                right: -25 * scale,
                top: '50%',
                transform: 'translateY(-50%)',
                width: `${210 * scale}px`,
                height: `${210 * scale}px`,
                zIndex: 10,
                transition: 'all 0.5s ease-in-out',
                pointerEvents: 'none'
              }}
            >
              <img 
                src="https://i.ibb.co/8nxf6gcx/image.png" 
                alt="strap"
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right center' }}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            </div>
          )}

          {diaryType === 'blim' && (
            <>
              <div 
                style={{
                  position: 'absolute',
                  right: `${20 * scale}px`,
                  top: 0,
                  bottom: 0,
                  width: `${12 * scale}px`,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.05), inset -2px 0 4px rgba(0,0,0,0.05), 2px 0 4px rgba(0,0,0,0.1), -2px 0 4px rgba(0,0,0,0.1)',
                  zIndex: 5,
                  transition: 'all 0.5s ease-in-out'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: `${25 * scale}px`,
                  bottom: `${25 * scale}px`,
                  width: `${55 * scale}px`,
                  height: `${20 * scale}px`,
                  backgroundColor: '#F8F9FA',
                  borderRadius: '50%',
                  boxShadow: '1px 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `0 ${6 * scale}px`,
                  zIndex: 6,
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <div style={{ width: `${2 * scale}px`, height: `${2 * scale}px`, borderRadius: '50%', backgroundColor: '#9ca3af', boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.3)', transition: 'all 0.5s ease-in-out' }} />
                <span style={{ fontSize: `${7 * scale}px`, color: '#888', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'sans-serif', transition: 'all 0.5s ease-in-out' }}>OBJINT</span>
                <div style={{ width: `${2 * scale}px`, height: `${2 * scale}px`, borderRadius: '50%', backgroundColor: '#9ca3af', boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.3)', transition: 'all 0.5s ease-in-out' }} />
              </div>
            </>
          )}
        </div>

        <div className="absolute bottom-6 bg-black/60 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-full z-10 tracking-wide font-medium">
          {currentRealText} • {DIARY_TYPES[diaryType].name}{getDecorationInfo()}
        </div>
      </div>

      <div 
        className={`bg-white rounded-t-[32px] -mt-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] relative z-10 flex flex-col transition-all duration-500 ease-in-out ${isPanelOpen ? 'h-[55vh]' : 'h-[40px] overflow-hidden'}`}
      >
        <div 
          className="w-full flex justify-center pt-4 pb-4 sticky top-0 bg-white z-20 rounded-t-[32px] cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-800 font-bold mb-3">
              <Ruler className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg">다이어리 사이즈</h3>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {Object.entries(SIZES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setSize(key)}
                  className={`px-4 py-3.5 rounded-2xl border text-left transition-all flex justify-between items-center
                    ${size === key 
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-[15px] inline-block w-12">{val.name}</span>
                    <span className="text-xs ml-2 opacity-70 border-l border-gray-300 pl-3">{val.realText}</span>
                  </div>
                  {size === key && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}

              <div 
                className={`p-4 rounded-2xl border transition-all cursor-pointer
                  ${size === 'custom' 
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600 shadow-sm' 
                    : 'border-gray-200 text-gray-600'}`}
                onClick={() => setSize('custom')}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-bold text-[15px] inline-block whitespace-nowrap w-16">직접 입력</span>
                    <span className="text-xs ml-2 opacity-70 border-l border-gray-300 pl-3">원하는 사이즈(mm)</span>
                  </div>
                  {size === 'custom' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                
                {size === 'custom' && (
                  <div className="mt-4 flex gap-3 bg-white p-3 rounded-xl border border-blue-100" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">펼친 가로 (mm)</label>
                      <input 
                        type="number" 
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 font-medium text-sm"
                        placeholder="가로"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">세로 (mm)</label>
                      <input 
                        type="number" 
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 font-medium text-sm"
                        placeholder="세로"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-800 font-bold mb-3">
              <Layers className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg">다이어리 선택</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(DIARY_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setDiaryType(key as keyof typeof DIARY_TYPES)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-3
                    ${diaryType === key 
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div 
                    className="w-14 h-14 rounded-full border border-gray-200 shadow-sm"
                    style={{ 
                      backgroundColor: val.hex,
                      backgroundImage: `url("${val.imageUrl}")`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: val.bgSizeSmall
                    }}
                  ></div>
                  <span className="font-bold text-[13px] flex items-center gap-1">
                    {val.name}
                    {diaryType === key && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-800 font-bold mb-3">
              <Plus className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg">장식 추가</h3>
            </div>
            <div className="flex gap-3">
              {Object.entries(DECORATION_TYPES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => addDecoration(key as keyof typeof DECORATION_TYPES)}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm flex-1 justify-center"
                >
                  <value.icon size={18} color={value.color} fill={value.color} />
                  <span className="text-sm font-bold text-gray-700">{value.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 italic text-center">* 추가된 장식은 미리보기에서 드래그하여 위치를 조절할 수 있습니다.</p>
          </section>

          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
}
