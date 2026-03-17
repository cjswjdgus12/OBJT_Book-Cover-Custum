/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ruler, Layers, Check, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

// 사진과 동일한 느낌을 내는 SVG 패턴 생성 (세로줄만 남김)
const SPARKLE_SVG = "data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='stripes' width='3' height='3' patternUnits='userSpaceOnUse'%3E%3Crect width='1' height='3' fill='rgba(255,255,255,0.25)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23stripes)'/%3E%3C/svg%3E";
const BLIM_SVG = "data:image/svg+xml,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='crinkle' width='4' height='24' patternUnits='userSpaceOnUse' patternTransform='rotate(2)'%3E%3Cpath d='M 0 0 Q 1 12 0 24' stroke='rgba(255,255,255,0.8)' stroke-width='1' fill='none'/%3E%3Cpath d='M 1.5 0 Q 0.5 12 1.5 24' stroke='rgba(0,0,0,0.05)' stroke-width='0.5' fill='none'/%3E%3Cpath d='M 2.5 0 Q 3.5 12 2.5 24' stroke='rgba(255,255,255,0.5)' stroke-width='0.5' fill='none'/%3E%3C/pattern%3E%3Cfilter id='stitch'%3E%3CfeDropShadow dx='0.5' dy='1' stdDeviation='0.5' flood-color='rgba(0,0,0,0.15)'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23crinkle)'/%3E%3Cg fill='none' filter='url(%23stitch)' stroke='rgba(255,255,255,1)' stroke-width='2' stroke-dasharray='2.5 2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M 40 20 L 48 40 L 70 40 L 52 55 L 60 75 L 40 62 L 20 75 L 28 55 L 10 40 L 32 40 Z' transform='rotate(15 40 47)'/%3E%3Cpath d='M 110 90 L 118 110 L 140 110 L 122 125 L 130 145 L 110 132 L 90 145 L 98 125 L 80 110 L 102 110 Z' transform='rotate(-10 110 117)'/%3E%3Cpath d='M 130 -10 L 138 10 L 160 10 L 142 25 L 150 45 L 130 32 L 110 45 L 118 25 L 100 10 L 122 10 Z' transform='rotate(25 130 17)'/%3E%3Cpath d='M -10 100 L -2 120 L 20 120 L 2 135 L 10 155 L -10 142 L -30 155 L -22 135 L -40 120 L -18 120 Z' transform='rotate(-20 -10 127)'/%3E%3C/g%3E%3C/svg%3E";

// 다이어리 종류 적용 (실제 이미지 URL 추가)
const DIARY_TYPES: Record<string, { name: string; hex: string; imageUrl: string; bgSize: string; bgSizeSmall: string }> = {
  sparkleSky: { 
    name: '스파클 - 하늘', 
    hex: '#B5CBE8', // 사진과 유사한 톤다운된 하늘색
    imageUrl: 'https://i.ibb.co/FLV92PtM/image.png',
    bgSize: '185px 360px',
    bgSizeSmall: 'cover'
  },
  sparklePink: { 
    name: '스파클 - 분홍', 
    hex: '#EBBBD0', // 사진과 유사한 차분한 핑크색
    imageUrl: 'https://i.ibb.co/B2nMDRrV/image.png',
    bgSize: '185px 360px',
    bgSizeSmall: 'cover'
  },
  blim: { 
    name: '블림', 
    hex: '#DCE5F0', // 사진과 동일한 아주 창백하고 은은한 얼음빛 하늘색
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
  
  // 패널의 열림/닫힘 상태를 관리하는 State
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
  // 이미지 다운로드 진행 상태를 관리하는 State
  const [isDownloading, setIsDownloading] = useState(false);

  // 화면에 보이는 용도 (패널이 열려있을 때는 작게, 닫혀있을 때는 크게)
  const scale = isPanelOpen ? 0.55 : 0.8; 
  
  const rawWidth = size === 'custom' ? ((Number(customWidth) || 200) / 2) * 1.8 : SIZES[size].width;
  const rawHeight = size === 'custom' ? (Number(customHeight) || 150) * 1.8 : SIZES[size].height;
  
  const currentWidth = rawWidth * scale;
  const currentHeight = rawHeight * scale;
  const currentRealText = size === 'custom' ? `직접 입력 (${customWidth || 0} X ${customHeight || 0}mm)` : `${SIZES[size].name} (${SIZES[size].realText})`;

  // 미리보기 영역 캡처 및 이미지 다운로드 함수
  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      // 화면에 보이는 영역 대신, 항상 일정한 비율을 유지하는 '숨겨진 전용 영역'을 캡처합니다.
      const element = document.getElementById('export-capture-area');
      if (element) {
        // iOS Safari 버그 방지를 위해 두 번 캡처 (첫 번째는 버림)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isIOS) {
          await toPng(element, { cacheBust: true, pixelRatio: 1, backgroundColor: '#e5e7eb', style: { transform: 'none', left: '0', top: '0', position: 'relative' } }).catch(() => {});
        }

        const dataUrl = await toPng(element, {
          cacheBust: true,
          pixelRatio: 2, // 고해상도
          backgroundColor: '#e5e7eb',
          style: {
            // 캡처 시 화면 밖으로 밀어낸 위치(left: -9999px)를 초기화하여 정상적으로 그려지게 함
            transform: 'none',
            left: '0',
            top: '0',
            position: 'relative',
          }
        });

        const fileName = `OBJT_북커버_${SIZES[size]?.name || '직접입력'}_${DIARY_TYPES[diaryType].name}.png`;

        if (isIOS) {
          try {
            // iOS는 a 태그 download 속성이 잘 작동하지 않으므로 Web Share API 사용
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'OBJT 북커버',
              });
            } else {
              // Share API 지원 안 할 경우 새 창 띄우기 (길게 눌러 저장 유도)
              const newWindow = window.open();
              if (newWindow) {
                newWindow.document.write(`
                  <html>
                    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                    <body style="margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f3f4f6; height:100vh;">
                      <p style="font-family:sans-serif; color:#374151; margin-bottom:16px; font-weight:bold;">이미지를 길게 눌러 '사진 앱에 저장'을 선택해주세요.</p>
                      <img src="${dataUrl}" style="max-width:90%; max-height:80vh; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.1);" />
                    </body>
                  </html>
                `);
                newWindow.document.close();
              } else {
                alert('팝업 차단을 해제해주세요.');
              }
            }
          } catch (shareError) {
            // 사용자가 공유를 취소한 경우는 에러 무시
            if ((shareError as Error).name !== 'AbortError') {
              console.error('공유 실패:', shareError);
              alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
            }
          }
        } else {
          // 안드로이드 및 PC (기존 방식)
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          link.click();
        }
      } else {
        alert('캡처할 영역을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('이미지 저장 중 오류 발생:', error);
      alert(`이미지 저장 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    // 전체 컨테이너
    <div className="w-full h-[100dvh] md:max-w-[420px] md:mx-auto bg-gray-50 flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden font-sans">
      
      {/* 앱 상단 헤더 */}
      <header className="absolute top-0 w-full px-5 py-4 z-20 flex justify-between items-center pointer-events-none">
        <h1 className="text-xl font-bold text-gray-900 tracking-tighter drop-shadow-sm bg-white/50 px-3 py-1 rounded-full backdrop-blur-md">
          OBJT
        </h1>
      </header>

      {/* 상단: 화면용 실시간 미리보기 영역 (패널에 따라 크기 변함) */}
      <div className="w-full bg-[#e5e7eb] relative flex flex-col items-center justify-center pt-8 overflow-hidden transition-all duration-500 flex-1">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

        <div 
          className="relative transition-all duration-500 ease-in-out flex items-center justify-center z-10 shrink-0"
          style={{
            width: `${currentWidth}px`,
            height: `${currentHeight}px`,
            backgroundColor: DIARY_TYPES[diaryType].hex,
            backgroundImage: `url("${DIARY_TYPES[diaryType].imageUrl}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: getScaledBgSize(DIARY_TYPES[diaryType].bgSize, scale),
            borderRadius: '3px 12px 12px 3px',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRight: 'none', // 우측 흰색 속지 느낌 제거
            boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.15), 2px 2px 8px rgba(0,0,0,0.05)' // 책등 그림자 및 전체 그림자
          }}
        >
          {/* 스파클: 똑딱이 스트랩 */}
          {diaryType.includes('sparkle') && (
            <div 
              style={{
                position: 'absolute',
                right: -1,
                top: '50%',
                transform: 'translateY(-50%)',
                width: `${210 * scale}px`,
                height: `${210 * scale}px`,
                backgroundImage: 'url("https://i.ibb.co/8nxf6gcx/image.png")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right center',
                zIndex: 10,
                transition: 'all 0.5s ease-in-out'
              }}
            />
          )}

          {/* 블림: 고무줄 밴드 및 태그 */}
          {diaryType === 'blim' && (
            <>
              {/* 고무줄 밴드 */}
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
              {/* 하단 흰색 타원형 태그 */}
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
                  transform: 'rotate(0deg)',
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
          {currentRealText} • {DIARY_TYPES[diaryType].name}
        </div>
      </div>

      {/* 하단: 커스텀 패널 */}
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

        </div>
      </div>

      {/* 모바일 하단 고정 이미지 저장 버튼 */}
      <div className="w-full bg-white border-t border-gray-100 p-4 pb-8 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] shrink-0">
        <button 
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className={`w-full flex justify-center items-center gap-2 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-all text-[15px]
            ${isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black active:scale-[0.98]'}`}
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>저장 중...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>이미지 저장하기</span>
            </>
          )}
        </button>
      </div>

      {/* ★ 추가된 부분 ★ 
        이미지 다운로드 전용 캡처 영역 (사용자 눈에는 보이지 않음)
        패널이 열려있든 닫혀있든 상관없이 무조건 '0.95 비율(확대된 상태)'로 고정되어 예쁘게 저장됩니다.
      */}
      <div className="absolute top-0 left-[-9999px] pointer-events-none z-[-1]">
        <div 
          id="export-capture-area" 
          className="w-[420px] h-[600px] bg-[#e5e7eb] relative flex flex-col items-center justify-center overflow-hidden font-sans"
        >
          {/* 워터마크 (저장된 이미지 좌측 상단) */}
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <h1 className="text-xl font-bold text-gray-900 tracking-tighter drop-shadow-sm bg-white/50 px-3 py-1 rounded-full backdrop-blur-md">
              OBJT
            </h1>
          </div>

          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div 
            className="relative flex items-center justify-center z-10"
            style={{
              width: `${rawWidth * 0.95}px`, // 무조건 0.95 확대 비율 적용
              height: `${rawHeight * 0.95}px`,
              backgroundColor: DIARY_TYPES[diaryType].hex,
              backgroundImage: `url("${DIARY_TYPES[diaryType].imageUrl}")`,
              backgroundRepeat: 'repeat',
              backgroundSize: getScaledBgSize(DIARY_TYPES[diaryType].bgSize, 0.95),
              borderRadius: '3px 12px 12px 3px',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRight: 'none',
              boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.15), 2px 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            {/* 스파클: 똑딱이 스트랩 (다운로드용) */}
            {diaryType.includes('sparkle') && (
              <div 
                style={{
                  position: 'absolute',
                  right: -1,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `${210 * 0.95}px`,
                  height: `${210 * 0.95}px`,
                  backgroundImage: 'url("https://i.ibb.co/8nxf6gcx/image.png")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  zIndex: 10
                }}
              />
            )}

            {/* 블림: 고무줄 밴드 및 태그 (다운로드용) */}
            {diaryType === 'blim' && (
              <>
                {/* 고무줄 밴드 */}
                <div 
                  style={{
                    position: 'absolute',
                    right: `${20 * 0.95}px`,
                    top: 0,
                    bottom: 0,
                    width: `${12 * 0.95}px`,
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.05), inset -2px 0 4px rgba(0,0,0,0.05), 2px 0 4px rgba(0,0,0,0.1), -2px 0 4px rgba(0,0,0,0.1)',
                    zIndex: 5
                  }}
                />
                {/* 하단 흰색 타원형 태그 */}
                <div
                  style={{
                    position: 'absolute',
                    right: `${25 * 0.95}px`,
                    bottom: `${25 * 0.95}px`,
                    width: `${55 * 0.95}px`,
                    height: `${20 * 0.95}px`,
                    backgroundColor: '#F8F9FA',
                    borderRadius: '50%',
                    boxShadow: '1px 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `0 ${6 * 0.95}px`,
                    zIndex: 6,
                    transform: 'rotate(0deg)'
                  }}
                >
                  <div style={{ width: `${2 * 0.95}px`, height: `${2 * 0.95}px`, borderRadius: '50%', backgroundColor: '#9ca3af', boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.3)' }} />
                  <span style={{ fontSize: `${7 * 0.95}px`, color: '#888', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'sans-serif' }}>OBJINT</span>
                  <div style={{ width: `${2 * 0.95}px`, height: `${2 * 0.95}px`, borderRadius: '50%', backgroundColor: '#9ca3af', boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.3)' }} />
                </div>
              </>
            )}
          </div>
          <div className="absolute bottom-10 bg-black/60 backdrop-blur-md text-white text-[13px] px-4 py-2 rounded-full z-10 tracking-wide font-medium">
            {currentRealText} • {DIARY_TYPES[diaryType].name}
          </div>
        </div>
      </div>

    </div>
  );
}
