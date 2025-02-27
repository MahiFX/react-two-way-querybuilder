import PropTypes from 'prop-types';
import React from 'react';
import TreeHelper from './helpers/TreeHelper';
import Rule from './Rule';

class Condition extends React.Component {
  constructor(props) {
    super(props);
    this.treeHelper = new TreeHelper(this.props.data);
    this.node = this.treeHelper.getNodeByName(this.props.nodeName);
    this.state = {
      data: this.node,
    };
    this.addRule = this.addRule.bind(this);
    this.addCondition = this.addCondition.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleChildUpdate = this.handleChildUpdate.bind(this);
    this.combinatorChange = this.combinatorChange.bind(this);
    this.combinatorValueChange = this.combinatorValueChange.bind(this);
    this.styles = this.props.config.styles;
  }

  addRule() {
    const data = this.state.data;
    const nodeName = this.treeHelper.generateNodeName(this.state.data);
    let field = null;
    if (data.rules.length !== 0) {
      if (data.combinator === 'or') {
        field = data.rules[0].field;
      } else if (data.combinator === 'and') {
        const usedFields = data.rules.map(rule => rule.field);
        const unusedFields = this.props.fields.map(obj => obj.name)
          .filter(obj => !usedFields.includes(obj));
        if (unusedFields.length !== 0) {
          field = unusedFields[0];
        }
      }
    }
    data.rules.push({
      field: (field === null) ? this.props.fields[0].name : field,
      operator: this.props.config.operators[0].operator,
      value: '',
      nodeName,
    });
    this.setState({ data });
    this.props.onChange(this.props.data);
  }

  addCondition() {
    const data = this.state.data;
    const nodeName = this.treeHelper.generateNodeName(this.state.data);
    data.rules.push({
      combinator: this.props.config.combinators[0].combinator,
      nodeName,
      rules: [],
    });
    this.setState({ data });
    this.props.onChange(this.props.data);
  }

  handleDelete(nodeName) {
    this.treeHelper.removeNodeByName(nodeName);
    this.props.onChange(this.props.data);
  }

  handleChildUpdate() {
    const node = this.treeHelper.getNodeByName(this.props.nodeName);
    this.setState({ data: node });
    this.props.onChange(this.props.data);
  }

  combinatorChange(event) {
    this.combinatorValueChange(event.target.value);
  }

  combinatorValueChange(combinator) {
    this.node.combinator = combinator;
    this.props.onChange(this.props.data);
  }

  render() {
    let deleteBtn;

    if (this.props.nodeName !== '1') {
      if (typeof this.props.config.deleteButtonRenderer === 'function') {
        deleteBtn = this.props.config.deleteButtonRenderer(
          () => this.handleDelete(this.props.nodeName),
          this.props.buttonsText.delete);
      } else {
        deleteBtn = (<button
          type="button"
          onClick={() => this.handleDelete(this.props.nodeName)}
          className={this.styles.deleteBtn}
        >{this.props.buttonsText.delete}</button>);
      }
    }

    return (
      <div className={this.styles.condition}>
        {typeof this.props.config.combinatorRenderer === 'function' ? this.props.config.combinatorRenderer(this.combinatorValueChange, this.state.data.combinator) :
          (<select
            value={this.state.data.combinator} className={this.styles.select}
            onChange={this.combinatorChange}
          >
            {this
              .props
              .config
              .combinators
              .map((combinator, index) => {
                return (
                  <option
                    value={combinator.combinator}
                    key={index}
                  >
                    {combinator.label}
                  </option>);
              })}
          </select>)
        }
        {typeof this.props.config.primaryButtonRenderer === 'function' ? this.props.config.primaryButtonRenderer(this.addCondition, this.props.buttonsText.addGroup) :
          <button type="button" className={this.styles.primaryBtn} onClick={this.addCondition}>
            {this.props.buttonsText.addGroup}
          </button>
        }
        {typeof this.props.config.primaryButtonRenderer === 'function' ? this.props.config.primaryButtonRenderer(this.addRule, this.props.buttonsText.addRule) :
          <button type="button" className={this.styles.primaryBtn} onClick={this.addRule}>
            {this.props.buttonsText.addRule}
          </button>
        }
        {deleteBtn}
        {this
          .state
          .data
          .rules
          .map((rule) => {
            if (rule.field) {
              return (<Rule
                key={rule.nodeName}
                buttonsText={this.props.buttonsText}
                fields={this.props.fields}
                operators={this.props.config.operators}
                nodeName={rule.nodeName}
                data={this.props.data}
                onChange={this.handleChildUpdate}
                styles={this.props.config.styles}
                fieldRenderer={this.props.config.fieldRenderer}
                operatorRenderer={this.props.config.operatorRenderer}
                deleteButtonRenderer={this.props.config.deleteButtonRenderer}
              />);
            }
            return (<Condition
              key={rule.nodeName}
              config={this.props.config}
              buttonsText={this.props.buttonsText}
              fields={this.props.fields}
              nodeName={rule.nodeName}
              data={this.props.data}
              onChange={this.handleChildUpdate}
            />);
          })}
      </div>
    );
  }
}

Condition.propTypes = {
  buttonsText: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  nodeName: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

export default Condition;
