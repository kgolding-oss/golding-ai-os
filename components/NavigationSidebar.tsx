const links = [
  ["Dashboard", "/dashboard"], ["CEO", "/ceo"], ["The Law Library", "/businesses/the-law-library"], ["Golding Compound", "/businesses/golding-compound"], ["YouPassGo", "/businesses/youpassgo"], ["Relax With Me", "/businesses/relax-with-me"], ["Funding", "/funding"], ["CRM", "/crm"], ["Projects", "/projects"], ["Documents", "/documents"], ["Knowledge", "/knowledge"], ["AI Agents", "/ai-agents"], ["Settings", "/settings"],
];

export function NavigationSidebar() {
  return <aside className="sidebar"><a className="brand" href="/dashboard"><span>G</span><strong>Golding OS</strong></a><nav aria-label="Primary navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav></aside>;
}
