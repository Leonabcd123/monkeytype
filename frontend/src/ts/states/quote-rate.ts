import { createSignal } from "solid-js";
import { Language } from "@monkeytype/schemas/languages";
import Ape from "../ape";
import { Quote } from "../controllers/quotes-controller";
import { showErrorNotification } from "./notifications";
import { showModal } from "./modals";
import { isSafeNumber } from "@monkeytype/util/numbers";
import { QuoteLength } from "@monkeytype/schemas/quotes";

type QuoteStats = {
  average?: number;
  ratings?: number;
  totalRating?: number;
  quoteId?: number;
  language?: Language;
};

const [selectedQuote, setSelectedQuote] = createSignal<Quote | null>(null);
const [quoteStats, setQuoteStats] = createSignal<
  QuoteStats | null | Record<string, never>
>(null);

export { selectedQuote, quoteStats };

export function clearQuoteStats(): void {
  setQuoteStats(null);
}

export function getRatingAverage(stats: QuoteStats): number {
  if (
    isSafeNumber(stats.ratings) &&
    isSafeNumber(stats.totalRating) &&
    stats.ratings > 0 &&
    stats.totalRating > 0
  ) {
    return Math.round((stats.totalRating / stats.ratings) * 10) / 10;
  }
  return 0;
}

export async function getQuoteStats(
  quote?: Quote,
): Promise<QuoteStats | undefined> {
  if (!quote) return;

  setSelectedQuote(quote);
  const response = await Ape.quotes.getRating({
    query: { quoteId: quote.id, language: quote.language },
  });

  if (response.status !== 200) {
    showErrorNotification("Failed to get quote ratings", { response });
    return;
  }

  if (response.body.data === null) {
    setQuoteStats({});
    return {} as QuoteStats;
  }

  const stats = response.body.data as QuoteStats;
  if (stats !== undefined && stats.average === undefined) {
    stats.average = getRatingAverage(stats);
  }

  setQuoteStats(stats);
  return stats;
}

export function updateQuoteStats(stats: QuoteStats): void {
  setQuoteStats(stats);
}

export function showQuoteRateModal(quote: Quote): void {
  setSelectedQuote(quote);
  showModal("QuoteRate");
}

export function getLengthDesc(quoteToCheck?: Quote): QuoteLength | "-" {
  const quote = quoteToCheck ?? selectedQuote();
  if (!quote) return "-";
  if (quote.group === 0) return "short";
  if (quote.group === 1) return "medium";
  if (quote.group === 2) return "long";
  if (quote.group === 3) return "thicc";
  return "-";
}
