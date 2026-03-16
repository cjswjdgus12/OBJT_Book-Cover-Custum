/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ruler, Layers, Check, Download } from 'lucide-react';

// 파스텔 톤 색상 적용
const COVER_COLORS = {
  white: { name: '하양', hex: '#FFFFFF' }, // 진짜 하얀색으로 변경
  pink: { name: '분홍', hex: '#FFD1DC' }, // 파스텔 핑크
  skyblue: { name: '하늘', hex: '#B5D8EB' }, // 파스텔 스카이블루
  yellow: { name: '노랑', hex: '#FFF59D' } // 파스텔 옐로우
};

const SIZES: Record<string, { name: string; realText: string; width: number; height: number }> = {
  xxs: { name: 'XXS', realText: '190 X 110mm', width: 171, height: 198 },
  xs: { name: 'XS', realText: '205 X 170mm', width: 185, height: 306 },
  s: { name: 'S', realText: '205 X 200mm', width: 185, height: 360 },
  b6: { name: 'B6', realText: '285 X 195mm', width: 257, height: 351 },
  a6: { name: 'A6', realText: '230 X 155mm', width: 207, height: 279 }
};

declare global {
  interface Window {
    html2canvas: any;
  }
}

export default function App() {
  const [size, setSize] = useState('b6');
  const [customWidth, setCustomWidth] = useState<number | ''>(250);
  const [customHeight, setCustomHeight] = useState<number | ''>(180);
  const [coverColor, setCoverColor] = useState<keyof typeof COVER_COLORS>('white');
  
  // 패널의 열림/닫힘 상태를 관리하는 State
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
  // 이미지 다운로드 진행 상태를 관리하는 State
  const [isDownloading, setIsDownloading] = useState(false);

  // 화면에 보이는 용도 (패널 상태에 따라 크기 조절)
  const scale = isPanelOpen ? 0.7 : 0.95; 
  
  const rawWidth = size === 'custom' ? ((Number(customWidth) || 200) / 2) * 1.8 : SIZES[size].width;
  const rawHeight = size === 'custom' ? (Number(customHeight) || 150) * 1.8 : SIZES[size].height;
  
  const currentWidth = rawWidth * scale;
  const currentHeight = rawHeight * scale;
  const currentRealText = size === 'custom' ? `${customWidth || 0} X ${customHeight || 0}mm` : SIZES[size].realText;

  // 미리보기 영역 캡처 및 이미지 다운로드 함수
  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // 화면에 보이는 영역 대신, 항상 일정한 비율을 유지하는 '숨겨진 전용 영역'을 캡처합니다.
      const element = document.getElementById('export-capture-area');
      if (element) {
        const canvas = await window.html2canvas(element, {
          scale: 2, // 고해상도
          useCORS: true,
          backgroundColor: '#e5e7eb'
        });

        const fileName = `OBJT_북커버_${SIZES[size]?.name || '커스텀'}_${COVER_COLORS[coverColor].name}.png`;

        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('이미지 저장 중 오류 발생:', error);
      alert('이미지를 저장하는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
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
          className="relative transition-all duration-500 ease-in-out flex items-center justify-center z-10"
          style={{
            width: `${currentWidth}px`,
            height: `${currentHeight}px`,
            backgroundColor: COVER_COLORS[coverColor].hex,
            borderRadius: '3px 12px 12px 3px',
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        ></div>

        <div className="absolute bottom-6 bg-black/60 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-full z-10 tracking-wide font-medium">
          {currentRealText} • {COVER_COLORS[coverColor].name}
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
              <h3 className="text-lg">원단 색상</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(COVER_COLORS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setCoverColor(key as keyof typeof COVER_COLORS)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-3
                    ${coverColor === key 
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div 
                    className="w-14 h-14 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: val.hex }}
                  ></div>
                  <span className="font-bold text-[13px] flex items-center gap-1">
                    {val.name}
                    {coverColor === key && <Check className="w-3.5 h-3.5 text-blue-600" />}
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
      <div className="absolute top-0 left-[-9999px] pointer-events-none">
        <div 
          id="export-capture-area" 
          className="w-[420px] h-[600px] bg-[#e5e7eb] relative flex flex-col items-center justify-center overflow-hidden font-sans"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div 
            className="relative flex items-center justify-center z-10"
            style={{
              width: `${rawWidth * 0.95}px`, // 무조건 0.95 확대 비율 적용
              height: `${rawHeight * 0.95}px`,
              backgroundColor: COVER_COLORS[coverColor].hex,
              borderRadius: '3px 12px 12px 3px',
              border: '1px solid rgba(0,0,0,0.08)' 
            }}
          ></div>
          <div className="absolute bottom-10 bg-black/60 backdrop-blur-md text-white text-[13px] px-4 py-2 rounded-full z-10 tracking-wide font-medium">
            {currentRealText} • {COVER_COLORS[coverColor].name}
          </div>
        </div>
      </div>

    </div>
  );
}
