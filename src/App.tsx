import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from './state/progressStore';
import { Hud } from './components/hud/Hud';
import { CelebrationOverlay } from './components/hud/CelebrationOverlay';
import { ChapterMap } from './components/map/ChapterMap';
import { LessonPage } from './components/lesson/LessonPage';
import { BossExam } from './components/boss/BossExam';
import { BadgesPage } from './components/badges/BadgesPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { CertificatePage } from './components/finale/CertificatePage';
import { PlacementQuiz } from './components/placement/PlacementQuiz';
import { AboutBook } from './components/about/AboutBook';

export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <Hud />
        <CelebrationOverlay />
        <Routes>
          <Route path="/" element={<ChapterMap />} />
          <Route path="/ch/:chapterId/:sectionId" element={<LessonPage />} />
          <Route path="/boss/:chapterId" element={<BossExam />} />
          <Route path="/testout/:chapterId" element={<BossExam testOut />} />
          <Route path="/placement" element={<PlacementQuiz />} />
          <Route path="/about" element={<AboutBook />} />
          <Route path="/final" element={<BossExam />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/certificate" element={<CertificatePage />} />
          <Route path="*" element={<ChapterMap />} />
        </Routes>
      </HashRouter>
    </ProgressProvider>
  );
}
