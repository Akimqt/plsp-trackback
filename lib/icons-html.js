// String-markup mirror of lib/icons.js, for the dashboard's innerHTML
// template literals (the page still renders most of its dynamic content
// imperatively, so JSX icons from lib/icons.js can't be embedded there
// directly — these are the same icons as raw SVG strings instead).

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const ICONS_HTML = {
  package: `<svg viewBox="0 0 24 24" ${S}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,

  electronics: `<svg viewBox="0 0 24 24" ${S}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="18" x2="15" y2="18"/></svg>`,
  books: `<svg viewBox="0 0 24 24" ${S}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  clothing: `<svg viewBox="0 0 24 24" ${S}><path d="M16 4l4 3-2.5 3L16 8.5V21H8V8.5L6.5 10 4 7l4-3 1.5 1.5a3 3 0 0 0 5 0z"/></svg>`,
  accessories: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  idcards: `<svg viewBox="0 0 24 24" ${S}><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><line x1="13" y1="10" x2="18" y2="10"/><line x1="13" y1="14" x2="18" y2="14"/></svg>`,

  reportPlus: `<svg viewBox="0 0 24 24" ${S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg>`,
  reportFound: `<svg viewBox="0 0 24 24" ${S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l1.5 1.5L15 12"/></svg>`,
  search: `<svg viewBox="0 0 24 24" ${S}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  message: `<svg viewBox="0 0 24 24" ${S}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" ${S}><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" ${S}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" ${S}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" ${S}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" ${S}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" ${S}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
};

const CATEGORY_MAP = {
  Electronics: ICONS_HTML.electronics,
  Books: ICONS_HTML.books,
  Clothing: ICONS_HTML.clothing,
  Accessories: ICONS_HTML.accessories,
  'ID/Cards': ICONS_HTML.idcards,
};

export const DEFAULT_ITEM_ICON_HTML = ICONS_HTML.package;

export function getCategoryIconHtml(category) {
  return CATEGORY_MAP[category] || ICONS_HTML.package;
}
