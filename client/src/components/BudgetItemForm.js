import React from 'react';
import PropTypes from 'prop-types';
import {Field} from 'redux-form';
import {BudgetItemResource, amountToCents, getSelectedMonthMoment} from 'inab-shared';
import {connect} from 'react-redux';
import {resourceForm} from 'hw-react-shared';
import {crud} from '../hoc/crud';

const mapStateToProps = state => ({
  selectedMonth: getSelectedMonthMoment(state)
});

const formToResource = (data, props) => ({
  month: props.selectedMonth.format('YYYY-MM-DD'),
  category_uuid: props.category_uuid,
  amount: amountToCents(data.amount)
});

const resourceToForm = () => ({});

@connect(mapStateToProps)
@resourceForm(crud, BudgetItemResource, formToResource, resourceToForm)
export class BudgetItemForm extends React.Component {
  static propTypes = {
    updatedResource: BudgetItemResource.propType,
    deleteResource: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    postSubmit: PropTypes.func.isRequired,
    category_uuid: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    selectedMonth: PropTypes.object.isRequired
  };

  onSubmit = data => {
    if (Number(data.amount) === 0) {
      if (this.props.updatedResource) {
        this.props.deleteResource();
      }
    } else {
      this.props.onSubmit(data);
    }
    this.props.postSubmit();
  };

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.onSubmit)}>
        <Field
          name="amount"
          className="form-control"
          onBlur={this.props.onBlur}
          component="input"
          type="text"
          placeholder="Amount"
          autoFocus
        />
      </form>
    );
  }
}
