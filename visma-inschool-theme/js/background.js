/* ==========================================================================
   Klar – bakgrunnstjeneste
   Eneste oppgave: sende hurtigtastene videre til fanen som er åpen.
   ========================================================================== */
chrome.commands.onCommand.addListener(async (command) => {
  const type = command === 'toggle-scheme' ? 'klar:scheme' : 'klar:toggle';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type });
  } catch (e) {
    /* fanen kjører ikke innholdsskriptet */
  }
});
