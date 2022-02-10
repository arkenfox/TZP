# TorZillaPrint

TorZillaPrint (TZP) aims to provide a comprehensive, all-in-one, fingerprinting test suite, nicely broken into suitable sections with relevant information together. Long term, the goal is to collect Gecko only fingerprint data (no PII) for analysis to see how many classifications each metric or section provides.

#### 🟥 Fingerpints are ALWAYS loose

A fingerprint is just a snapshot of data at any given time, and collected metrics can change for a number or reasons: such as zooming, resizing windows, moving windows, per site settings, etc. Snapshots of fingerprints can still be linked after the fact. Unless you know what is being collected and it's stability, then don't make assumptions. Always treat fingerprints as loose/fuzzy.

TZP aims to make sure Tor Browser and RFP are protecting metrics where known, and to dig into more areas of interest to determine equivalency or ppossible entropy. Non-stable metrics are collected to provide as much information as possible for analysis.

#### 🟪 What we do care about:
- Gecko
- Comparing Tor Browser with Firefox
- First party only (for now)
- Lowering entropy (or poison pills where appropriate)
- Help. We'll take all the help we can get.

#### 🟩 What we might care about:
- Collecting data via submissions
- Expanding to include tests that require third parties

#### 🟧 What we don't care about:
- non-Gecko
- Extensions (except those used in Tor Browser if they affect tests)
- Providing entropy figures which requires real world tests with one result per profile

#### 🟦 Acknowledgments

You know who you are. We don't need to list everyone. You're doing this to make the world a better place - that's your reward. And that's about it, for now. If you want to contribute with your amazing skills - come in and say hello.

<br>
version: draftv1.1<br>date: 9-Sept-2020
