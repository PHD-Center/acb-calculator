# 抗膽鹼藥物負擔計算器 (ACB Calculator)

> **Note:本工具僅供醫療人員參考。計算結果以 ≥65 歲老年族群之研究為依據。**

整合 6 種國際抗膽鹼負擔評分量表的線上計算工具,根據近期發表於 *BMJ*、*Clinical Epidemiology* 與 *European Heart Journal* 的三項台灣健保資料庫研究,提供針對 ≥65 歲族群的 **急性心血管事件**、**住院型肺炎** 與 **院外心跳停止 (OHCA)** 風險量化評估與臨床建議。

## 線上使用

👉 **<https://danielhttsai.github.io/acb-calculator/>**

手機、平板、電腦皆可使用。輸入病人目前用藥即時計算總抗膽鹼負擔,並依研究實證提供分級風險與替代藥物建議。

## 功能

- **6 種評分量表整合**:ACB · ADS · GABS · m-ACB · KABS · ARS(介面內附各量表發表年代、作者、適用族群與原始文獻引用)
- **122 種台灣常見藥物資料庫**(來源:PHDc)
- **中英文商品名搜尋**:整合健保藥品資料庫 (NHI_ATCcode) 共 5,400 餘筆品牌名稱(英文 ≈2,300、中文 ≈3,150)
- **拍照/上傳藥歷影像辨識**:整合 Tesseract.js OCR 直接辨識並自動加入,無需手動勾選。 4032×3024 phone 照片實測 **約 4–5 秒** 完成全流程
  - **管線**:預設**兩顆 eng-only Tesseract worker 並行**(PSM 3 自動版型 + PSM 11 sparse text),寬高縮至 1500 px、灰階 + 對比 / 銳化 兩種前處理同時投入。 worker 在按下相機鈕的瞬間就開始 prewarm — 等使用者選完檔案 worker 多半已就緒
  - **中文 fallback**:eng-only pass 完全沒抓到藥物時才動態載入 chi_tra worker (約 +3 s),處理罕見「整張處方只標中文藥品名」case
  - **模糊比對策略**:精確比對 (100) → 子字串包含 (88) → Levenshtein 距離 (1 字差→92) → 起始錨定滑動視窗模糊比對 (處理 OCR 誤字 + 劑量黏連)
  - **誤判防護**:驅動分數的 source token 必須對該藥物為最高分 (避免 "Trazo"→Triamcinolone 透過共現 source 誤通過)、滑動視窗只允許起始錨定 (避免 "metoclopramide" 誤觸 loperamide)、子字串完全包含時抑制較短藥名 (avoid Methylprednisolone 誤觸 Prednisolone)、品牌名須達 100 分才自動加入
  - **建議影像**:直接螢幕截圖效果最佳;手機翻拍螢幕(反光、moiré)可能無法辨識,建議改用螢幕截圖或裁切後的清晰照片
- **計算範圍說明**:外用劑型 (topical) 不計入;吸入劑 (inhaled) 仍計入(因有系統性吸收且與心血管事件相關),依 BMJ 2023 原始研究方法
- **心血管事件風險分級**(依 BMJ 2023 主分析與 sensitivity analysis;**30 天內**急性心血管事件風險):
  - ACB 1–2 → ×1.4 倍
  - ACB ≥3 → ×2 倍(含 MI、stroke、arrhythmia、CV death 細項)
  - ACB ≥5 → ×2.5 倍
  - ACB ≥10 → ×2.9 倍
- **肺炎風險逐步累加效應**(依 Clin Epidemiol 2025;**30 天內**急性住院肺炎風險):
  - ACB ≤5:每加 1 分 → 風險 ×1.25(原始研究主分析)
  - ACB ≥6:每加 1 分 → 風險 ×1.03(外推估計,梯度參考 BMJ 2023 心血管事件 ≥5 vs ≥10 之相對風險比)
  - 介面以累乘呈現逐藥增量,並於外推區間自動標註說明
- **OHCA 風險分級**(依 Eur Heart J 2025;**30 天內**院外心跳停止風險;≥65 歲老年層 case-crossover 主分析):
  - ACB 1–2 → ×1.6 倍
  - ACB ≥3 → ×2.2 倍
  - ACB ≥5 → ×2.7 倍
  - ACB ≥10 → ×3 倍
- **同類藥物重複用藥提醒**(依 ATC level 4 偵測)
- **亞洲族群量表 (m-ACB / KABS) 偏高警示**:當亞洲量表分數明顯高於 ACB 時提示可能低估
- **逐藥替代建議**:對 ACB=3 高負擔藥物,個別列出同類較低負擔可考慮藥物;若無同類替代則明確告知
- **中英雙語介面**:右上角即時切換中文 / English (British),所有風險敘述、分級、替代建議、文獻摘要與警示訊息皆完整翻譯;偏好儲存於 localStorage

## 文獻依據

> Huang W-C, Yang A S-H, Tsai D H-T, Shao S-C, Lin S-J, Lai E C-C. **Association between recently raised anticholinergic burden and risk of acute cardiovascular events: nationwide case-case-time-control study.** *BMJ* 2023;382:e076045. doi:10.1136/bmj-2023-076045

> Yang A S-H, Fan Chiang H-Y, Tsai D H-T, Chuang A T-M, Lai E C-C. **Association Between Pneumonia Risk and Anticholinergic Burden Among Patients with Different Frailty Levels.** *Clin Epidemiol.* 2025 Sep 30;17:787–796.

> Tsai M-J, Su C T-T, Sung S-F, Yang H-Y, Cheng M C-Y, Chuang A T-M, Shao S-C, Lai E C-C. **Transient anticholinergic burden and out-of-hospital cardiac arrest: a case-crossover study.** *Eur Heart J.* 2025;46(47):5143–5156. doi:10.1093/eurheartj/ehaf723

### 評分量表原始文獻

- **ACB** Boustani M, Campbell N, Munger S, Maidment I, Fox C. *Aging Health.* 2008;4(3):311–320.
- **ADS** Carnahan RM, Lund BC, Perry PJ, Pollock BG, Culp KR. *J Clin Pharmacol.* 2006;46(12):1481–1486.
- **GABS** Kiesel EK, Hopf YM, Drey M. *BMC Geriatr.* 2018;18(1):239.
- **m-ACB** Ah YM, Suh Y, Jun K, Hwang S, Lee JY. *Basic Clin Pharmacol Toxicol.* 2019;124(6):741–748.
- **KABS** Jun K, Hwang S, Ah YM, Suh Y, Lee JY. *Geriatr Gerontol Int.* 2019;19(7):628–634.
- **ARS** Rudolph JL, Salow MJ, Angelini MC, McGlinchey RE. *Arch Intern Med.* 2008;168(5):508–513.

## 注意事項

本計算器以 **臨床決策輔助** 為目的,提供量化抗膽鹼負擔與相對風險指標。實際處方調整仍應綜合病人病史、適應症、藥物交互作用及替代藥物可行性,由醫師個別評估。風險倍數為流行病學研究之族群相對風險,不代表個別病人絕對發生率。

## 技術說明

- 單一 HTML 檔案,完全離線可用(Tailwind CSS 已內嵌靜態化)
- 無外部 CDN、無追蹤、無 cookie
- 行動瀏覽器最佳化:含 iOS/Android 多重事件處理與輪詢備援機制
- 原始碼開放,可自由 fork、修改、部署

## 授權

本專案以教育與研究用途公開。引用資料時請註明上述三篇原始文獻。

---

*Maintained by Daniel H-T Tsai*
