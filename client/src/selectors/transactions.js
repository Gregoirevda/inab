import {createSelector} from "reselect";
import {createInMonthSelectors, createUpToMonthSelectors} from "./ui";
import {beginningOfMonth, createMappingSelector, groupBy, mapMap} from "./utils";
import sumBy from 'lodash/sumBy';

// All
export const getTransactions = state => state.transactions;

export const getSortedTransactions = createSelector(
  getTransactions,
  transactions => transactions.concat().sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    if (a.date > b.date) {
      return -1;
    }
    if (a.amount != undefined && b.amount != undefined) {
      return a.amount - b.amount;
    }
    if (a.amount != undefined) {
      return -1;
    }
    if (b.amount != undefined) {
      return 1;
    }
    return 0;
  })
);

// Filters
export const inMonth = createInMonthSelectors(getTransactions, (t) => beginningOfMonth(t.date));
export const upToMonth = createUpToMonthSelectors(getTransactions, (t) => beginningOfMonth(t.date));

// Map
export const getPayees = createSelector(
  getTransactions,
  transactions => [...new Set(transactions.filter(t => t.payee != null).map(t => t.payee))]
);

// Grouping
export const getTransactionsById = createMappingSelector(getTransactions, 'id');

export const getToBeBudgetedSumUpToSelectedMonth = createSelector(
  upToMonth.current,
  transactions => sumBy(transactions.filter(t => t.type == "to_be_budgeted"), 'amount')
);

export const getSelectedMonthActivityByCategoryId = createSelector(
  inMonth.current,
  transactions => {
    return sumByCategoryId(transactions);
  }
);

// Utils

// Flattens a series of transactions to an array of [date, category_id, amount]
// including both transactions and subtransactions.
export const flattenTransactions = (transactions) => {
  const result = [];
  transactions.forEach((transaction) => {
    const category_id = transaction.category_id;
    if (category_id) {
      result.push({
        date: transaction.date,
        category_id: category_id,
        amount: transaction.amount || 0
      });
    }
    transaction.subtransactions.forEach((subt) => {
      const sub_category_id = subt.category_id;
      if (sub_category_id) {
        result.push({
          date: transaction.date,
          category_id: sub_category_id,
          amount: subt.amount || 0
        });
      }
    });
  });
  return result;
};

// Returns the sum of the amounts per category id for the transactions provided.
export const sumByCategoryId = (transactions) => {
  const result = groupBy(flattenTransactions(transactions), (t) => t.category_id);
  return mapMap(result, v => sumBy(v, 'amount'));
};
