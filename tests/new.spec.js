const { test, expect } = require('@playwright/test');

test.describe('SwiftTranslator Singlish → Sinhala (from Excel) - V3', () => {
  const baseURL = 'https://www.swifttranslator.com/';

  function normalizeSinhala(input) {
    if (input === null || input === undefined) return '';
    let s = String(input);

    
    s = s.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '');

    
    s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    
    s = s.replace(/[\t\f\v ]+/g, ' ');
    s = s.replace(/ *\n */g, '\n');
    s = s.replace(/\n{3,}/g, '\n\n');

   
    s = s
      .replace(/ \./g, '.')
      .replace(/ \?/g, '?')
      .replace(/ \!/g, '!')
      .replace(/ ,/g, ',')
      .replace(/ ;/g, ';')
      .replace(/ :/g, ':');

    // Normalize number + 'ක්'
    s = s.replace(/(\d)\s*ක්/g, '$1ක්');

    // Lowercase latin letters to avoid Zoom/zoom etc.
    s = s.replace(/[A-Z]/g, (c) => c.toLowerCase());

    // Trim and remove trailing sentence punctuation
    s = s.trim().replace(/[.!?]+$/g, '');

    // Canonicalize some common Sinhala variants
    s = s
      .replace(/පුලුවන්ද/g, 'පුළුවන්ද')
      .replace(/පුලුවන්/g, 'පුළුවන්')
      .replace(/පුලුවන/g, 'පුළුවන')
      .replace(/ඔයාගෙ/g, 'ඔයාගේ')
      .replace(/ඔයාලගෙ/g, 'ඔයාලගේ')
      .replace(/ඊයෙ/g, 'ඊයේ')
      .replace(/හොද/g, 'හොඳ')
      .replace(/\bනෑ\b/g, 'නැහැ')
      .replace(/\bනැ\b/g, 'නැහැ');

    // Final collapse spaces
    s = s.replace(/[ ]{2,}/g, ' ').trim();

    return s;
  }

  async function waitForStableText(locator, timeoutMs = 15000, stableMs = 500) {
    const start = Date.now();
    let last = null;
    let lastChange = Date.now();

    while (Date.now() - start < timeoutMs) {
      const t = (await locator.textContent()) ?? '';
      const cur = t.trim();

      if (cur !== last) {
        last = cur;
        lastChange = Date.now();
      } else {
        if (cur && Date.now() - lastChange >= stableMs) return cur;
      }

      await locator.page().waitForTimeout(120);
    }

    return ((await locator.textContent()) ?? '').trim();
  }

  async function convertInput(page, inputText) {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

    const inputLocator = page.locator('textarea[placeholder="Input Your Singlish Text Here."]');
    await inputLocator.waitFor({ state: 'visible', timeout: 15000 });

    await inputLocator.fill('');
    await inputLocator.fill(inputText);

    const outputLocator = page.locator('div.whitespace-pre-wrap.overflow-y-auto.bg-slate-50');
    await outputLocator.waitFor({ state: 'visible', timeout: 15000 });

    await expect(outputLocator).not.toHaveText('', { timeout: 15000 });

    const stableRaw = await waitForStableText(outputLocator, 15000, 500);
    return stableRaw;
  }

  //  Total 35: Pos 24 + Neg 10 + UI Pos 1
  const cases = [
    //  POS 24 
    { id: 'Pos_Fun_0001', input: 'mama office vaeda karanavaa', expected: 'මම office වැඩ කරනවා' },
    { id: 'Pos_Fun_0002', input: 'api heta gedhara yamu', expected: 'අපි හෙට ගෙදර යමු' },
    { id: 'Pos_Fun_0003', input: 'mama gedhara yanavaa saha passe bath kanavaa', expected: 'මම ගෙදර යනවා සහ පස්සෙ බත් කනවා' },
    { id: 'Pos_Fun_0004', input: 'oya envaa nam mama balan innavaa', expected: 'ඔය එන්වා නම් මම බලන් ඉන්නවා' },
    { id: 'Pos_Fun_0005', input: 'api iiyee class giyaa', expected: 'අපි ඊයේ class ගියා' },
    { id: 'Pos_Fun_0006', input: 'mata eeka karanna baee', expected: 'මට ඒක කරන්න බෑ' },
    { id: 'Pos_Fun_0007', input: 'oyaa adha kohomadha inne?', expected: 'ඔයා අද කොහොමද ඉන්නේ?' },
    { id: 'Pos_Fun_0008', input: 'issarahata poddak yanna', expected: 'ඉස්සරහට පොඩ්ඩක් යන්න' },
    { id: 'Pos_Fun_0009', input: 'karuNaakara mata podi udhavvak karanna puLuvandha?', expected: 'කරුණාකර මට පොඩි උදව්වක් කරන්න පුළුවන්ද?' },
    { id: 'Pos_Fun_0010', input: 'anee eeka poddak dhenna', expected: 'අනේ ඒක පොඩ්ඩක් දෙන්න' },
    { id: 'Pos_Fun_0011', input: 'suBha dhavasak!', expected: 'සුභ දවසක්!' },
    { id: 'Pos_Fun_0012', input: 'eyaalaa adha enavaa', expected: 'එයාලා අද එනවා' },
    { id: 'Pos_Fun_0013', input: 'mage meeting eka Zoom eken thiyenavaa', expected: 'mage meeting එක Zoom එකෙන් තියෙනවා' },
    { id: 'Pos_Fun_0014', input: 'api Kandy valata trip ekak yamu', expected: 'අපි Kandy වලට trip එකක් යමු' },
    { id: 'Pos_Fun_0015', input: 'WiFi eka adha vaeda karanne naehae', expected: 'WiFi එක අද වැඩ කරන්නේ නැහැ' },
    { id: 'Pos_Fun_0016', input: 'meeka Rs. 2500 k vatinavaa', expected: 'මේක Rs. 2500 ක් වටිනවා' },
    { id: 'Pos_Fun_0017', input: 'appointment eka 2026-05-21 thiyenavaa', expected: 'appointment එක 2026-05-21 තියෙනවා' },
    { id: 'Pos_Fun_0018', input: 'meeting eka 7.30 AM dha?', expected: 'meeting එක 7.30 AM ද?' },
    { id: 'Pos_Fun_0019', input: 'mama gedhara inne', expected: 'මම ගෙදර ඉන්නේ' },
    { id: 'Pos_Fun_0020', input: 'mama gedhara yanavaa. oyaa enne kavadhdha?', expected: 'මම ගෙදර යනවා. ඔයා එන්නෙ කවද්ද?' },
    { id: 'Pos_Fun_0021', input: 'mata nidhimathayi', expected: 'මට නිදිමතයි' },
    { id: 'Pos_Fun_0022', input: 'hari hari lassanayi', expected: 'හරි හරි ලස්සනයි' },
    { id: 'Pos_Fun_0023', input: 'adha api office vaeda kala saha passe manager ekka kathaa kala', expected: 'අද අපි office වැඩ කල සහ පස්සෙ manager එක්ක කතා කල' },
    { id: 'Pos_Fun_0024', input: 'hari, mama eeka karannam', expected: 'හරි, මම ඒක කරන්නම්' },

    
    
    //Negative Functional 10 
    { id: 'Neg_Fun_0001', input: 'mamagedharaawa', expected: 'මම ගෙදර යනවා' }, // empty input
  { id: 'Neg_Fun_0002', input: 'matapanabonnona', expected: 'මට පාන බොන්න ඕනේ' }, // gibberish
  { id: 'Neg_Fun_0003', input: 'hetapiyy', expected: 'හෙට අපි යනවා' }, // typo
  { id: 'Neg_Fun_0004', input: 'oyaaenndvadha?', expected: 'ඔයා එනවද?' }, // extra chars
  { id: 'Neg_Fun_0005', input: 'elamachan!!!supiriii', expected: 'එල මචං සුපිරි' },
  { id: 'Neg_Fun_0006', input: 'ad0000 vaedak karapan', expected: 'අඩෝ වැඩක් කරපන්' },
  { id: 'Neg_Fun_0007', input: 'dhaen api vaeda !! office personal prashna', expected: 'දැන් අපි වැඩ කරපු කාලය අතර office සහ personal ප්‍රශ්න ගොඩක් තිබුණ නිසා අපි decision එකකට එන්න බැරි උනා' },
  { id: 'Neg_Fun_0008', input: 'mama yanna\n\noya?', expected: 'මම ගෙදර යනවා.\n\nඔයා එන්නේ කවද්ද?' },
  { id: 'Neg_Fun_0009', input: 'WhatsApp link ekak Teams meeting ekata', expected: 'Teams meeting එකේ URL එක WhatsApp කරලා එවන්න' },
  { id: 'Neg_Fun_0010', input: 'QR payment scan ekak', expected: 'QR code එක scan කරලා payment එක complete කරන්න' },

    // UI Positive 1
  { id: 'Pos_UI_0035', input: 'mama gedhara yanavaa ', expected: 'Sinhala output should update automatically while typing and display: මම ගෙදර යනවා ' }
  ];

  

  for (const tc of cases) {
    if (tc.id.startsWith('Pos_UI_')) {
      test(`${tc.id} UI - realtime output updates`, async ({ page }) => {
        await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

        const inputLocator = page.locator('textarea[placeholder="Input Your Singlish Text Here."]');
        await inputLocator.waitFor({ state: 'visible', timeout: 15000 });

        await inputLocator.fill('');
        await inputLocator.type(tc.input, { delay: 40 });

        const outputLocator = page.locator('div.whitespace-pre-wrap.overflow-y-auto.bg-slate-50');
        await outputLocator.waitFor({ state: 'visible', timeout: 15000 });

        await expect(outputLocator).not.toHaveText('', { timeout: 15000 });
        const stableRaw = await waitForStableText(outputLocator, 15000, 500);

        const actual = normalizeSinhala(stableRaw);

        const m = String(tc.expected).match(/display\s*:\s*(.*)$/i);
        const expectedSinhala = normalizeSinhala(m ? m[1] : tc.expected);

        expect(actual).toBe(expectedSinhala);
      });

      continue;
    }

    test(`${tc.id} ${tc.id.startsWith('Pos_') ? 'Positive' : 'Negative'} Functional`, async ({ page }) => {
      const actualRaw = await convertInput(page, tc.input);
      const actual = normalizeSinhala(actualRaw);
      const expected = normalizeSinhala(tc.expected);

      try {
        
        expect(actual).toBe(expected);
      } catch (e) {
        console.log(`\n[${tc.id}] INPUT   : ${tc.input}`);
        console.log(`[${tc.id}] EXPECTED: ${tc.expected}`);
        console.log(`[${tc.id}] ACTUAL  : ${actualRaw}`);
        throw e;
      }
    });
  }
   
});