import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import CategoryRow from './CategoryRow';
import CategoryGroupRow from './CategoryGroupRow';
import ui from 'redux-ui';
import '../styles/tables.scss';
import {
  CategoryGroupResource,
  CategoryResource,
  getSortedCategoryGroups,
  selectCategoriesByGroupId,
  getSelectedMonthBudgetItemByCategoryId,
  BudgetItemResource,
  selectSelectedMonthActivityByCategoryId,
  getAvailableByCategoryIdForSelectedMonth
} from 'inab-shared';

@ui({
  state: {
    editingCategoryId: undefined
  }
})
class BudgetTable extends React.Component {
  static propTypes = {
    categoryGroups: PropTypes.arrayOf(CategoryGroupResource.propType).isRequired,
    categoriesByGroupId: PropTypes.objectOf(PropTypes.arrayOf(CategoryResource.propType).isRequired)
      .isRequired,
    selectedMonthActivityByCategoryId: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
    selectedMonthBudgetItemByCategoryId: PropTypes.objectOf(BudgetItemResource.propType).isRequired,
    availableByCategory: PropTypes.instanceOf(Map).isRequired,
    updateUI: PropTypes.func.isRequired
  };

  render() {
    const rows = [];
    this.props.categoryGroups.forEach(cg => {
      rows.push(
        <CategoryGroupRow
          key={'cg' + cg.uuid}
          categoryGroup={cg}
          onClick={() =>
            this.props.updateUI({categoryGroupSelected: cg.uuid, categoryGroupFormOpen: true})}
        />
      );
      if (this.props.categoriesByGroupId[cg.uuid]) {
        this.props.categoriesByGroupId[cg.uuid].forEach(c => {
          rows.push(
            <CategoryRow
              key={'c' + c.uuid}
              category={c}
              onNameClick={() =>
                this.props.updateUI({categorySelected: c.uuid, categoryFormOpen: true})}
              budgetItem={this.props.selectedMonthBudgetItemByCategoryId[c.uuid]}
              activity={this.props.selectedMonthActivityByCategoryId[c.uuid]}
              available={this.props.availableByCategory.get(c.uuid)}
            />
          );
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

const mapStateToProps = state => ({
  categoryGroups: getSortedCategoryGroups(state),
  categoriesByGroupId: selectCategoriesByGroupId(state),
  selectedMonthActivityByCategoryId: selectSelectedMonthActivityByCategoryId(state),
  selectedMonthBudgetItemByCategoryId: getSelectedMonthBudgetItemByCategoryId(state),
  availableByCategory: getAvailableByCategoryIdForSelectedMonth(state)
});

export default connect(mapStateToProps)(BudgetTable);
