import {createSelector} from 'reselect';
import R from 'ramda';
import {byIdSelector} from 'hw-react-shared';
import {AccountResource, CategoryResource, getSortedTransactions, getPayees} from 'inab-shared';

const getMirrorTransfer = transaction => {
  const mirror = Object.assign({}, transaction);
  mirror.key = mirror.uuid + 'r';
  mirror.account_uuid = transaction.transfer_account_uuid;
  mirror.transfer_account_uuid = transaction.account_uuid;
  mirror.account = transaction.payee;
  mirror.payee = transaction.account;
  mirror.amount = -mirror.amount;
  return mirror;
};

// Converts the transactions to TransactionView
export const getTransactionsForRendering = createSelector(
  getSortedTransactions,
  byIdSelector(AccountResource),
  byIdSelector(CategoryResource),
  (transactions, accountsById, categoriesById) => {
    const result = [];

    transactions.forEach(tr => {
      const tr_result = {
        ...tr,
        key: tr.uuid,
        account: accountsById[tr.account_uuid].name,
        payee: tr.payee ||
          (tr.transfer_account_uuid && accountsById[tr.transfer_account_uuid].name),
        is_transfer: !!tr.transfer_account_uuid,
        tagsForSearch: tr.tags.map(t => t.name).join(',')
      };
      tr_result.display_date = tr.date;

      if (tr.type === 'to_be_budgeted') {
        tr_result.category = 'To be budgeted';
      }
      if (tr.type === 'split') {
        tr_result.category = 'Split';
      }
      if (tr.type === 'regular' && tr.category_uuid) {
        tr_result.category = categoriesById[tr.category_uuid].name;
      }

      result.push(tr_result);
      if (tr.transfer_account_uuid) {
        result.push(getMirrorTransfer(tr_result));
      }

      tr.subtransactions.forEach((str, strIndex) => {
        const str_result = {
          // TODO make sure subtransaction always have an id, index is bad as key
          key: 's' + (str.uuid ? str.uuid : 'i' + strIndex),
          uuid: str.uuid,
          date: tr.date,
          account_uuid: tr.account_uuid,
          category_uuid: str.category_uuid,
          category: str.category_uuid ? categoriesById[str.category_uuid].name : '',
          description: str.description,
          amount: str.amount,
          subtransaction: true,
          tags: [],
          parent_transaction: tr.uuid
        };
        result.push(str_result);
      });
    });

    return result;
  }
);

export const getTransactionColumns = createSelector(
  byIdSelector(AccountResource),
  byIdSelector(CategoryResource),
  getPayees,
  (accountsById, categoriesById, payees) => ({
    account: {
      label: 'Account',
      type: 'text',
      options: R.map(R.prop('name'), accountsById)
    },
    date: {
      label: 'Date',
      type: 'date'
    },
    category_uuid: {
      label: 'Category',
      type: 'text',
      options: R.map(R.prop('name'), categoriesById)
    },
    amount: {
      label: 'Amount',
      type: 'number'
    },
    description: {
      label: 'Description',
      type: 'text'
    },
    payee: {
      label: 'Payee',
      type: 'text',
      options: payees
    }
  })
);
