# 抗膽鹼藥物負擔計算器 (ACB Calculator)

> **Note:本工具僅供醫療人員參考。計算結果以 ≥65 歲老年族群之研究為依據;本系列研究使用 case-crossover 等設計方法,特色為可以用來探討短時間內的暴露變化與急性事件的相關性。**

整合 6 種國際抗膽鹼負擔評分量表的線上計算工具,根據近期發表於 *BMJ*、*Clinical Epidemiology* 與 *European Heart Journal* 的三項台灣健保資料庫研究,提供針對 ≥65 歲族群的 **急性心血管事件**、**住院型肺炎** 與 **院外心跳停止 (OHCA)** 風險量化評估與臨床建議。

## 線上使用

👉 **<https://phd-center.github.io/acb-calculator/>**

手機、平板、電腦皆可使用。輸入病人目前用藥即時計算總抗膽鹼負擔,並依研究實證提供分級風險與替代藥物建議。

## 功能

- **6 種評分量表整合**:ACB · ADS · GABS · m-ACB · KABS · ARS(介面內附各量表發表年代、作者、適用族群)
- **122 種台灣常見藥物資料庫**(來源:PHDc)
- **補入 40 筆量表藥物**(2026-11):ACB 2012 更新版與 GABS (Kiesel 2018, Table 4) 有評分、健保給付中、但不在上述 122 種的藥物(如 amitriptyline、chlorpheniramine、promethazine、trospium),依原始清單填 ACB 與 GABS 分數並附出處;ADS、m-ACB、KABS、ARS 原始清單無法取得,這些欄顯示「–」以 0 計
- **其他健保藥品也可輸入**:抗膽鹼量表以外的健保給付成分(約 1,300 種,名稱與 ATC 代碼取自 WHO ATC/DDD Index)可直接輸入,供下方整體用藥檢視計算;這些藥物在量表欄顯示「–」,不計入量表總分
- **中英文商品名搜尋**:整合健保藥品資料庫 (NHI_ATCcode) 共 5,400 餘筆品牌名稱(英文 ≈2,300、中文 ≈3,150)
- **拍照/上傳藥歷影像辨識**:整合 Tesseract.js OCR 直接辨識並自動加入,無需手動勾選。
- **語音輸入**:點「🎤 語音輸入」說出藥名(可一次說多個,含劑量、中英混講皆可),勾選列出的藥物後一次加入;中文商品名以發音比對,簡體字或同音字輸出也能對上;預設使用瀏覽器內建辨識,辨識不確定時提供「您要找的是?」清單供確認(選後系統會記住該發音)。可勾選「🎯 精準語音」改用**雲端 Whisper AI**(由本工具自建的 Cloudflare Workers AI 代理執行,使用者無須任何設定)提高藥名辨識準確度 — 此模式辨識時會將語音上傳轉寫(不另存)。
- **一頁式報表列印 / PDF 匯出**:評估完成後,「🖨️ 列印 / 匯出 PDF」可叫出瀏覽器原生列印對話框,選擇「另存為 PDF」即得精美病歷報表。
- **引用本工具**:若以本工具計算結果用於研究、報告或臨床指引,可於介面中「📚 引用此工具」取得 JAMA / BibTeX / RIS 格式引用網站。
- **使用回饋(可選,匿名)**:右下角「📝 給我們回饋」可填寫 5 題量性 + 1 題質性問卷(對應 SUS、TAM、UTAUT、Sittig & Singh framework),供工具改進與後續研究使用。
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
- **重複用藥提醒**:同一藥品輸入兩次,或兩個藥品屬同一 ATC 第 4 層
- **整體用藥檢視**(由同一份清單計算,每項附出處):
  - **Drug Burden Index**:Hilmer 2007 公式,藥物清單與最低有效劑量 δ 採 Byrne 2018 愛爾蘭全國版清單(Supplementary Table S1,數值未更動);需輸入每日劑量,只詢問清單中的 DBI 藥物
  - **鎮靜負擔 (sedative load)**:Linjakumpu 2003 模型及 Taipale 2011 更新,依 Taipale 2012 Table 8;分組 0、1–2、≥3
  - **跌倒風險藥物 (FRIDs)**:STOPPFall 14 類(Seppala 2021),ATC 代碼依 Doyle 2025
  - **Polypharmacy**:≥5 種 polypharmacy、≥10 種 excessive polypharmacy(Masnoon 2017)
  - 來源未涵蓋的藥物(例如 DBI 清單沒有最低劑量者)會標示「無法計算」,不做推估
- **亞洲族群量表 (m-ACB / KABS) 偏高警示**:當亞洲量表分數明顯高於 ACB 時提示可能低估
- **逐藥替代建議**:對 ACB=3 高負擔藥物,個別列出同類較低負擔可考慮藥物;若無同類替代則明確告知
- **中英雙語介面**:右上角即時切換中文 / English (British),所有風險敘述、分級、替代建議、文獻摘要與警示訊息皆完整翻譯;偏好儲存於 localStorage

## 文獻依據

> Huang W-C, Yang A S-H, Tsai D H-T, Shao S-C, Lin S-J, Lai E C-C. **Association between recently raised anticholinergic burden and risk of acute cardiovascular events: nationwide case-case-time-control study.** *BMJ* 2023;382:e076045. doi:10.1136/bmj-2023-076045

> Yang A S-H, Fan Chiang H-Y, Tsai D H-T, Chuang A T-M, Lai E C-C. **Association Between Pneumonia Risk and Anticholinergic Burden Among Patients with Different Frailty Levels.** *Clin Epidemiol.* 2025 Sep 30;17:787–796.

> Tsai M-J, Su C T-T, Sung S-F, Yang H-Y, Cheng M C-Y, Chuang A T-M, Shao S-C, Lai E C-C. **Transient anticholinergic burden and out-of-hospital cardiac arrest: a case-crossover study.** *Eur Heart J.* 2025;46(47):5143–5156. doi:10.1093/eurheartj/ehaf723

### 整體用藥檢視文獻

- **DBI** Hilmer SN, et al. *Arch Intern Med.* 2007;167(8):781–787. doi:10.1001/archinte.167.8.781 · δ 與藥物清單:Byrne CJ, et al. *BMJ Open.* 2018;8(7):e022500. doi:10.1136/bmjopen-2018-022500
- **Sedative load** Linjakumpu T, et al. *Int J Geriatr Psychiatry.* 2003;18(6):542–544. doi:10.1002/gps.846 · Taipale HT, et al. *Drugs Aging.* 2011;28(11):913–925. doi:10.2165/11597800-000000000-00000 · Taipale H. 博士論文, University of Eastern Finland, 2012 (ISBN 978-952-61-0787-5)
- **STOPPFall** Seppala LJ, et al. *Age Ageing.* 2021;50(4):1189–1199. doi:10.1093/ageing/afaa249 · ATC 代碼:Doyle K, et al. *Age Ageing.* 2025;54(5):afaf138. doi:10.1093/ageing/afaf138
- **Polypharmacy** Masnoon N, et al. *BMC Geriatr.* 2017;17(1):230. doi:10.1186/s12877-017-0621-2
- **ATC 分類** WHO Collaborating Centre for Drug Statistics Methodology, ATC/DDD Index

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

- 單一 HTML 檔案,計分核心完全離線可用(Tailwind CSS 已內嵌靜態化)
- 無追蹤、無 cookie:計算、OCR 與**預設語音辨識**皆於使用者瀏覽器執行,不上傳任何資料
- OCR 功能首次使用時動態載入 Tesseract.js (約 2 MB) 與 `tessdata_fast` 英文模型 (約 4 MB),瀏覽器自動快取至 IndexedDB,後續使用無需重新下載;**未啟用 OCR 則不下載任何外部資源**
- 語音輸入:預設使用瀏覽器原生 Web Speech API(Chrome/Edge/Safari 行動與桌面皆支援),不經本工具伺服器。**選用**的「🎯 精準語音」模式則把錄音送至本工具自建的 **Cloudflare Worker** 代理,於 **Cloudflare Workers AI** 執行 OpenAI Whisper 後回傳文字;此模式語音會上傳轉寫(代理端不另存),不使用任何第三方 API key、使用者無須設定。代理原始碼與部署說明見 [`cloudflare-worker/`](cloudflare-worker/);未部署代理時介面不顯示精準模式,行為與純前端相同
- 行動瀏覽器最佳化:含 iOS/Android 多重事件處理與輪詢備援機制
- 原始碼開放,可自由 fork、修改、部署

## 授權

本專案以教育與研究用途公開。引用資料時請註明上述三篇原始文獻。

---

*Maintained by Anticholinergic Burden Working Group, PHDc, NCKU (Tsai DH-T, Lai EC-C)*
