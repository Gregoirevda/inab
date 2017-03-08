import React from 'react';
import {getSortedCategoryGroups} from '../selectors/categoryGroups';
import {getCategoriesByGroupId} from '../selectors/categories';
import {getAvailableByCategoryIdForSelectedMonth} from '../selectors/budget';
import {getSelectedMonthBudgetItemsByCategoryId} from '../selectors/budgetItems';
import {getSelectedMonthActivityByCategoryId} from '../selectors/transactions';
import {connect} from 'react-redux';
import CategoryRow from './CategoryRow';
import CategoryGroupRow from './CategoryGroupRow';
import ui from 'redux-ui';
import '../styles/tables.scss';
import {CategoryGroupResource} from '../entities/CategoryGroup';

@ui({
  state: {
    editingCategoryId: undefined
  }
})
class BudgetTable extends React.Component {
  static propTypes = {
    categoryGroups: React.PropTypes.arrayOf(CategoryGroupResource.propType).isRequired,
    categoriesByGroupId: React.PropTypes.instanceOf(Map).isRequired,
    getSelectedMonthActivityByCategoryId: React.PropTypes.instanceOf(Map).isRequired,
    getSelectedMonthBudgetItemsByCategoryId: React.PropTypes.instanceOf(Map).isRequired,
    availableByCategory: React.PropTypes.instanceOf(Map).isRequired,
    updateUI: React.PropTypes.func.isRequired
  };

  render() {
    const rows = [];
    this.props.categoryGroups.forEach(cg => {
      rows.push(<CategoryGroupRow
        key={'cg'+cg.uuid}
        categoryGroup={cg}
        onClick={() => this.props.updateUI({categoryGroupSelected: cg.uuid, categoryGroupFormOpen: true})}
      />);
      if (this.props.categoriesByGroupId.get(cg.uuid)) {
        this.props.categoriesByGroupId.get(cg.uuid).forEach(c => {
          rows.push(<CategoryRow
            key={'c'+c.uuid}
            category={c}
            onNameClick={() => this.props.updateUI({categorySelected: c.uuid, categoryFormOpen: true})}
            budgetItem={this.props.getSelectedMonthBudgetItemsByCategoryId.get(c.uuid)}
            activity={this.props.getSelectedMonthActivityByCategoryId.get(c.uuid)}
            available={this.props.availableByCategory.get(c.uuid)}
          />);
        });
      }
    });

    return (
      <table className="table table-sm table-hover budget-table">
        <thead>
          <tr>
            <th>Category</th>
            <th className="right">Budgeted</th>
            <th className="right">Activity</th>
            <th className="right">Available</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

const mapStateToProps = (state) => ({
  categoryGroups: getSortedCategoryGroups(state),
  categoriesByGroupId: getCategoriesByGroupId(state),
  getSelectedMonthActivityByCategoryId: getSelectedMonthActivityByCategoryId(state),
  getSelectedMonthBudgetItemsByCategoryId: getSelectedMonthBudgetItemsByCategoryId(state),
  availableByCategory: getAvailableByCategoryIdForSelectedMonth(state)
});

export default connect(mapStateToProps)(BudgetTable);
