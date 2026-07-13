export interface WalkthroughStep {
  id: string;
  selector: string;
  title: string;
  messageOn: string;
  messageOff: string;
}

// Order roughly follows a typical page's top-to-bottom flow. A step is only
// shown on a given page if `selector` matches an element currently in the DOM
// — most integration points only exist on some page types (e.g. FilterPanel
// only on listing pages), so the tour is assembled fresh each time it starts.
export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'search-bar',
    selector: '[data-walkthrough="search-bar"]',
    title: 'Catalog search',
    messageOn:
      "This search box calls Pikle's live catalog search API as you type, you can update and configure what is indexed and how it is searched with no development effort! It can also turn into a full conversational AI assistant if you enable the chat integration.",
    messageOff:
      "There are great search engines out there, but making changes to how your products are indexed and searched can be a big job and a barrier to improving your store and results.",
  },
  {
    id: 'filter-panel',
    selector: '[data-walkthrough="filter-panel"]',
    title: 'Product filtering',
    messageOn:
      "This panel is populated live from Pikle's filtering API, which can be configured to filter on any product attribute you want.",
    messageOff:
      "Filtering is a common feature of e-commerce sites, but it can be a lot of work to implement and maintain, leading to incomplete filtering or filtering driven by what data is easy to load rather than what customers are looking for.",
  },
  {
    id: 'compare-button',
    selector: '[data-walkthrough="compare-button"]',
    title: 'Compare button',
    messageOn:
      "This button calls Pikle's compare API, which can be configured to compare any product attributes you want. Making comparison part of a discovery flow can help shoppers make decisions and increase conversion. It is a natural point to engage shoppers who are not ready to decide in a conversation or allow them to save their progress.",
    messageOff:
      "Comparison is often an afterthought or missing feature in e-commerce sites, but it can be a powerful tool for shoppers to make decisions and for you to increase conversion.",
  },
  {
    id: 'similar-products',
    selector: '[data-walkthrough="similar-products"]',
    title: 'Similar products',
    messageOn:
      "This section is populated live from Pikle's similar-products API, matched against the product you're viewing using attribute embeddings that you are in control of and can customize and test without a development project. Offering releveant similar products can help shoppers discover products they will love and increase conversion.",
    messageOff:
      "If your similar products are hard-coded, missing or based on a simple algorithm, you may be missing out on opportunities to help shoppers discover products they will love and increase conversion.",
  },
  {
    id: 'chat-assistant',
    selector: '[data-walkthrough="chat-assistant"]',
    title: 'AI shopping assistant',
    messageOn:
      "Pikle's AI assistant is connected to your catalog and can be configured to answer questions about your products and help shoppers discover products they will love as well as being connected to the other discovery features so that it can truly drive a personalized shopping experience. It can also bring in a human agent when needed!",
    messageOff:
      "AI assistants are a hot topic, but many are not connected to your product catalog and cannot answer questions about your products.",
  },
];

export function getApplicableSteps(): WalkthroughStep[] {
  return WALKTHROUGH_STEPS.filter((step) => document.querySelector(step.selector));
}

export function isElementVisible(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
