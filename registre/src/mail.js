// E-mails du registre : sobres, institutionnels, en anglais (livrable public).
// Toute donnée saisie par l'utilisateur est échappée avant insertion dans le HTML.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const AZUR = '#2c3466', GOLD = '#b49a52', INK = '#1c2333', INK2 = '#5f6678';

function layout(title, paras, button, foot) {
  const p = paras.map(x => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${INK}">${x}</p>`).join('');
  const btn = button ? `<p style="margin:22px 0 24px"><a href="${esc(button.href)}"
      style="display:inline-block;background:${AZUR};color:#ffffff;text-decoration:none;font-weight:600;
      font-size:14px;letter-spacing:.3px;padding:12px 22px;border-radius:2px">${esc(button.label)}</a></p>
      <p style="margin:0 0 14px;font-size:12px;line-height:1.5;color:${INK2}">If the button does not work, copy this
      address into your browser:<br><span style="word-break:break-all">${esc(button.href)}</span></p>` : '';
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f3ef">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3ef;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #dcdde2">
<tr><td style="padding:26px 32px 0;font-family:Helvetica,Arial,sans-serif">
  <div style="font-size:12px;font-weight:700;letter-spacing:3px;color:${AZUR}">BALKANSKA KONFEDERACIJA</div>
  <div style="font-size:11px;letter-spacing:2.4px;color:${INK2};margin-top:3px">BALKAN CONFEDERATION</div>
  <div style="height:1px;background:${GOLD};margin:18px 0 22px"></div>
  <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:${INK};font-weight:700">${esc(title)}</h1>
  ${p}${btn}
</td></tr>
<tr><td style="padding:14px 32px 24px;font-family:Helvetica,Arial,sans-serif;font-size:11.5px;line-height:1.5;color:${INK2};border-top:1px solid #ececef">
  ${foot}<br>Konfederalni registar državljana · Zagreb
</td></tr>
</table></td></tr></table></body></html>`;
}

const textOf = (title, paras, button, foot) =>
  [title, '', ...paras.map(p => p.replace(/<[^>]+>/g, '')), '',
   button ? `${button.label}: ${button.href}` : '', '', foot.replace(/<[^>]+>/g, ''),
   'Konfederalni registar državljana · Zagreb'].join('\n');

function build(to, name, subject, title, paras, button, foot, attachments) {
  return {
    to, name, subject, link: button && button.href, attachments: attachments || [],
    html: layout(title, paras, button, foot),
    text: textOf(title, paras, button, foot),
  };
}

export function mailConfirm({ to, given, surname, stateName, stateCode, link }) {
  return build(to, `${given} ${surname}`, 'Confirm your registration · Balkan Confederation',
    'Confirm your registration',
    [`Dear ${esc(given)},`,
     `You asked to become a citizen of the Balkan Confederation, attached to <b>${esc(stateName)}</b> (${esc(stateCode)}), in the name of <b>${esc(surname.toUpperCase())} ${esc(given)}</b>.`,
     'Confirm your e-mail address to have your citizen card issued. The link is valid for 48 hours.'],
    { href: link, label: 'Confirm my registration' },
    'If you did not make this request, ignore this message: no card will be issued and the details will be deleted within seven days.');
}

export function mailCard({ to, given, surname, num, stateName, stateCode, expiry, link, attachments }) {
  const att = attachments && attachments.length;
  return build(to, `${given} ${surname}`, `Your citizen card ${num}`,
    `Your citizen card ${num}`,
    [`Dear ${esc(given)},`,
     `Your citizen card has been issued. Number <b>${esc(num)}</b>, state of attachment <b>${esc(stateName)}</b> (${esc(stateCode)}), valid until ${esc(expiry)}.`,
     att ? 'The front and back of the card are attached to this message.' : 'Open your card with the link below; you can download the front and back from there.',
     'Keep this message. The link gives access to your card and lets you amend or delete your registration: do not forward it.'],
    { href: link, label: 'Open my citizen card' },
    'You receive this message because you registered on the portal of the Balkan Confederation.',
    attachments);
}

export function mailAccess({ to, given, surname, num, link, reason }) {
  const intro = reason === 'again'
    ? 'Someone, perhaps you, tried to register again with this address. You are already a citizen: here is the link to your card.'
    : 'You asked for a new link to your citizen card.';
  return build(to, `${given} ${surname}`, `Access to your citizen card ${num}`,
    'Access to your citizen card',
    [`Dear ${esc(given)},`, intro,
     `Card number <b>${esc(num)}</b>. The link below gives access to your card and lets you amend or delete your registration: do not forward it.`],
    { href: link, label: 'Open my citizen card' },
    'If you did not make this request, you can ignore this message: nothing has changed.');
}
