/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ruler, Layers, Check, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

// 사진과 동일한 느낌을 내는 SVG 패턴 생성
const SPARKLE_SVG = "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(255,255,255,0.4)'%3E%3Crect x='0' y='0' width='2' height='80'/%3E%3Crect x='8' y='0' width='2' height='80'/%3E%3Crect x='16' y='0' width='2' height='80'/%3E%3Crect x='24' y='0' width='2' height='80'/%3E%3Crect x='32' y='0' width='2' height='80'/%3E%3Crect x='40' y='0' width='2' height='80'/%3E%3Crect x='48' y='0' width='2' height='80'/%3E%3Crect x='56' y='0' width='2' height='80'/%3E%3Crect x='64' y='0' width='2' height='80'/%3E%3Crect x='72' y='0' width='2' height='80'/%3E%3C/g%3E%3Cg fill='%23F8FAFC' stroke='%23CBD5E1' stroke-width='0.5'%3E%3Cpath d='M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z' transform='translate(10, 10) scale(0.4)'/%3E%3Cpath d='M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z' transform='translate(50, 40) scale(0.5)'/%3E%3Cpath d='M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z' transform='translate(25, 60) scale(0.3)'/%3E%3Cpath d='M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z' transform='translate(65, 5) scale(0.35)'/%3E%3C/g%3E%3C/svg%3E";
const BLIM_SVG = "data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(0,0,0,0.03)'%3E%3Crect x='0' y='0' width='2' height='20'/%3E%3Crect x='0' y='0' width='20' height='2'/%3E%3C/g%3E%3C/svg%3E";

// 다이어리 종류 적용 (실제 이미지 URL 추가)
const DIARY_TYPES = {
  sparkleSky: { 
    name: '스파클 - 하늘', 
    hex: '#AECBEB', // 사진과 유사한 약간 톤다운된 하늘색
    imageUrl: SPARKLE_SVG
  },
  sparklePink: { 
    name: '스파클 - 분홍', 
    hex: '#F4C8D4', // 사진과 유사한 차분한 핑크색
    imageUrl: SPARKLE_SVG
  },
  blim: { 
    name: '블림', 
    hex: '#F8F9FA', // 깔끔한 오프화이트
    imageUrl: BLIM_SVG
  }
};

const SIZES: Record<string, { name: string; realText: string; width: number; height: number }> = {
  xxs: { name: 'XXS', realText: '190 X 110mm', width: 171, height: 198 },
  xs: { name: 'XS', realText: '205 X 170mm', width: 185, height: 306 },
  s: { name: 'S', realText: '205 X 200mm', width: 185, height: 360 },
  b6: { name: 'B6', realText: '285 X 195mm', width: 257, height: 351 },
  a6: { name: 'A6', realText: '230 X 155mm', width: 207, height: 279 }
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

  // 화면에 보이는 용도 (패널 상태에 따라 크기 조절)
  const scale = isPanelOpen ? 0.7 : 0.95; 
  
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

        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
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
          className="relative transition-all duration-500 ease-in-out flex items-center justify-center z-10"
          style={{
            width: `${currentWidth}px`,
            height: `${currentHeight}px`,
            backgroundColor: DIARY_TYPES[diaryType].hex,
            backgroundImage: `url("${DIARY_TYPES[diaryType].imageUrl}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '80px 80px',
            borderRadius: '3px 12px 12px 3px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.15)' // 책등(Spine) 느낌을 주는 그림자 추가
          }}
        >
          {/* 똑딱이 스트랩 */}
          <div 
            style={{
              position: 'absolute',
              right: -1,
              top: '50%',
              transform: 'translateY(-50%)',
              width: `${35 * scale}px`,
              height: `${25 * scale}px`,
              backgroundColor: '#FDFBF7',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRight: 'none',
              borderRadius: `${6 * scale}px 0 0 ${6 * scale}px`,
              boxShadow: '-2px 2px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: `${6 * scale}px`,
              zIndex: 10
            }}
          >
            {/* 금속 버튼 */}
            <div 
              style={{
                width: `${10 * scale}px`,
                height: `${10 * scale}px`,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E2C285 0%, #B8860B 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.3)'
              }}
            ></div>
          </div>
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
                      backgroundSize: '50px 50px'
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
              backgroundSize: '80px 80px',
              borderRadius: '3px 12px 12px 3px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.15)'
            }}
          >
            {/* 똑딱이 스트랩 (다운로드용) */}
            <div 
              style={{
                position: 'absolute',
                right: -1,
                top: '50%',
                transform: 'translateY(-50%)',
                width: `${35 * 0.95}px`,
                height: `${25 * 0.95}px`,
                backgroundColor: '#FDFBF7',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRight: 'none',
                borderRadius: `${6 * 0.95}px 0 0 ${6 * 0.95}px`,
                boxShadow: '-2px 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingLeft: `${6 * 0.95}px`,
                zIndex: 10
              }}
            >
              {/* 금속 버튼 */}
              <div 
                style={{
                  width: `${10 * 0.95}px`,
                  height: `${10 * 0.95}px`,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E2C285 0%, #B8860B 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.3)'
                }}
              ></div>
            </div>
          </div>
          <div className="absolute bottom-10 bg-black/60 backdrop-blur-md text-white text-[13px] px-4 py-2 rounded-full z-10 tracking-wide font-medium">
            {currentRealText} • {DIARY_TYPES[diaryType].name}
          </div>
        </div>
      </div>

    </div>
  );
}
